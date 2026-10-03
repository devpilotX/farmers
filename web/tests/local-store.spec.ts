import { test, expect } from "@playwright/test";
test("native IndexedDB bounds the queue and refuses changed retry contents", async ({
  page,
}) => {
  await page.goto("/workspace#register");
  await expect(
    page.getByRole("button", { name: "Save sample draft" }),
  ).toBeEnabled();
  const result = await page.evaluate(async () => {
    const path = "/src/local/store.ts";
    const store = await import(path);
    const payload = {
      requestId: crypto.randomUUID(),
      farmerName: "Sample store check",
      village: "Sample village",
      district: "Sample district",
      crop: "Paddy",
      stage: "Sowing",
      areaHectares: 1,
      assets: "",
      boundary: [
        { longitude: 86, latitude: 25 },
        { longitude: 87, latitude: 25 },
        { longitude: 87, latitude: 26 },
        { longitude: 86, latitude: 25 },
      ],
      consent: true,
      consentVersion: "registry-v1-en",
    };
    await store.enqueue(payload);
    await store.enqueue(payload);
    let conflict = "";
    try {
      await store.enqueue({ ...payload, farmerName: "Changed copy" });
    } catch (error) {
      conflict = (error as Error).message;
    }
    await Promise.all(
      Array.from({ length: 19 }, () =>
        store.enqueue({ ...payload, requestId: crypto.randomUUID() }),
      ),
    );
    let capacity = "";
    try {
      await store.enqueue({ ...payload, requestId: crypto.randomUUID() });
    } catch (error) {
      capacity = (error as Error).message;
    }
    return {
      conflict,
      capacity,
      pending: (await store.loadLocalRecords()).pending.length,
    };
  });
  expect(result.conflict).toContain("different entries");
  expect(result.capacity).toContain("20 pending");
  expect(result.pending).toBe(20);
});
test("expiry removes a draft and pending copy without contacting the farm API", async ({
  page,
}) => {
  await page.goto("/workspace#register");
  await expect(
    page.getByRole("button", { name: "Save sample draft" }),
  ).toBeEnabled();
  const result = await page.evaluate(async () => {
    const path = "/src/local/store.ts";
    const store = await import(path);
    const payload = {
      requestId: crypto.randomUUID(),
      farmerName: "Sample expired",
      village: "Sample village",
      district: "Sample district",
      crop: "Paddy",
      stage: "Sowing",
      areaHectares: 1,
      assets: "",
      boundary: [
        { longitude: 86, latitude: 25 },
        { longitude: 87, latitude: 25 },
        { longitude: 87, latitude: 26 },
        { longitude: 86, latitude: 25 },
      ],
      consent: true,
      consentVersion: "registry-v1-en",
    };
    await store.enqueue(payload);
    await store.saveDraft({ farmerName: "Sample expired draft" });
    const snapshot = await store.loadLocalRecords(
      Date.now() + 8 * 24 * 60 * 60 * 1000,
    );
    return {
      expired: snapshot.expired,
      pending: snapshot.pending.length,
      draft: snapshot.draft,
    };
  });
  expect(result).toEqual({ expired: 2, pending: 0, draft: undefined });
  await page.goto("/workspace#pending");
  await expect(
    page.getByRole("heading", { name: "No pending registrations" }),
  ).toBeVisible();
});
test("two tabs retrying the same copy create one server farm", async ({
  page,
  context,
}) => {
  const name = `Sample two-tab retry ${Date.now()}`;
  await page.goto("/workspace#register");
  for (const [label, value] of [
    ["Farmer name", name],
    ["Village", "Sample village"],
    ["District", "Sample district"],
    ["Area in hectares", "1.25"],
    ["Longitude, latitude coordinates", "86,25\n87,25\n87,26\n86,25"],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Keep pending for later" }).click();
  const second = await context.newPage();
  await second.goto("/workspace#pending");
  await expect(second.getByRole("heading", { name })).toBeVisible();
  let seen = 0;
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await context.route("**/api/v1/farms", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    seen++;
    if (seen === 2) release();
    await gate;
    await route.continue();
  });
  await Promise.all([
    page.getByRole("button", { name: "Send this registration" }).click(),
    second.getByRole("button", { name: "Send this registration" }).click(),
  ]);
  await expect(
    page.getByRole("heading", { name: "No pending registrations" }),
  ).toBeVisible();
  await expect(
    second.getByRole("heading", { name: "No pending registrations" }),
  ).toBeVisible();
  const farms = await (await page.request.get("/api/v1/farms")).json();
  expect(
    farms.filter((farm: { farmerName: string }) => farm.farmerName === name),
  ).toHaveLength(1);
  expect(seen).toBe(2);
});

test("a stale tab cannot overwrite, remove or clear a newer draft", async ({
  page,
}) => {
  await page.goto("/workspace#register");
  await expect(
    page.getByRole("button", { name: "Save sample draft" }),
  ).toBeEnabled();
  const result = await page.evaluate(async () => {
    const path = "/src/local/store.ts";
    const store = await import(path);
    const first = await store.saveDraft({ farmerName: "First sample" });
    const newer = await store.saveDraft({ farmerName: "Newer sample" }, first);
    let overwrite = "";
    let discard = "";
    try {
      await store.saveDraft({ farmerName: "Stale sample" }, first);
    } catch (error) {
      overwrite = (error as Error).message;
    }
    try {
      await store.removeDraft(first);
    } catch (error) {
      discard = (error as Error).message;
    }
    const payload = {
      requestId: crypto.randomUUID(),
      farmerName: "First sample",
      village: "Sample village",
      district: "Sample district",
      crop: "Paddy",
      stage: "Sowing",
      areaHectares: 1,
      assets: "",
      boundary: [
        { longitude: 86, latitude: 25 },
        { longitude: 87, latitude: 25 },
        { longitude: 87, latitude: 26 },
        { longitude: 86, latitude: 25 },
      ],
      consent: true,
      consentVersion: "registry-v1-en",
    };
    await store.enqueue(payload, first);
    const snapshot = await store.loadLocalRecords();
    await store.removeDraft(newer);
    return {
      overwrite,
      discard,
      remaining: snapshot.draft?.fields.farmerName,
      pending: snapshot.pending.length,
      removed: !(await store.loadLocalRecords()).draft,
    };
  });
  expect(result.overwrite).toContain("changed in another tab");
  expect(result.discard).toContain("changed in another tab");
  expect(result.remaining).toBe("Newer sample");
  expect(result.pending).toBe(1);
  expect(result.removed).toBe(true);
});
