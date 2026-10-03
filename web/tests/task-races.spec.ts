import { test, expect } from "@playwright/test";
const sample = (name: string) => ({
  requestId: crypto.randomUUID(),
  farmerName: name,
  village: "Sample village",
  district: "Sample district",
  crop: "Paddy",
  stage: "Growing",
  areaHectares: 1.25,
  assets: "One pump",
  boundary: [
    { longitude: 86, latitude: 25 },
    { longitude: 87, latitude: 25 },
    { longitude: 87, latitude: 26 },
    { longitude: 86, latitude: 25 },
  ],
  consent: true,
  consentVersion: "registry-v1-en",
});
test("a delayed checklist revalidation cannot undo a confirmed completion", async ({
  page,
  request,
}) => {
  const first = await (
    await request.post("http://127.0.0.1:8080/api/v1/farms", {
      data: sample("Sample read/write race"),
    })
  ).json();
  const second = await (
    await request.post("http://127.0.0.1:8080/api/v1/farms", {
      data: sample("Sample other checklist"),
    })
  ).json();
  await page.goto(`/workspace#prepare?farm=${first.id}`);
  await expect(page.getByText("0 of 3 recorded")).toBeVisible();
  let release: () => void = () => {},
    started: () => void = () => {},
    otherStarted: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const reading = new Promise<void>((resolve) => {
    started = resolve;
  });
  const otherReading = new Promise<void>((resolve) => {
    otherStarted = resolve;
  });
  await page.route(`**/api/v1/farms/${second.id}/tasks`, async (route) => {
    otherStarted();
    await gate;
    await route.continue().catch(() => {});
  });
  await page.route(`**/api/v1/farms/${first.id}/tasks`, async (route) => {
    const response = await route.fetch();
    started();
    await gate;
    await route.fulfill({ response }).catch(() => {});
  });
  await page.getByLabel("Selected farm").selectOption(second.id);
  await otherReading;
  const settled = Promise.race([
    page
      .waitForResponse((response) =>
        response.url().endsWith(`/farms/${first.id}/tasks`),
      )
      .then((response) => response.finished()),
    page.waitForEvent("requestfailed", (request) =>
      request.url().endsWith(`/farms/${first.id}/tasks`),
    ),
  ]);
  await page.getByLabel("Selected farm").selectOption(first.id);
  await reading;
  await page
    .getByRole("button", { name: "Mark Record movable equipment complete" })
    .click();
  await expect(page.getByText("1 of 3 recorded")).toBeVisible();
  release();
  await settled;
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await expect(page.getByText("1 of 3 recorded")).toBeVisible();
  await page.reload();
  await expect(page.getByText("1 of 3 recorded")).toBeVisible();
});

test("returning to a farm during an outstanding save refreshes its confirmed actions", async ({
  page,
  request,
}) => {
  const first = await (
    await request.post("http://127.0.0.1:8080/api/v1/farms", {
      data: sample("Sample outstanding save"),
    })
  ).json();
  const second = await (
    await request.post("http://127.0.0.1:8080/api/v1/farms", {
      data: sample("Sample visited farm"),
    })
  ).json();
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(`**/api/v1/farms/${first.id}/tasks/*`, async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto(`/workspace#prepare?farm=${first.id}`);
  await page
    .getByRole("button", { name: "Mark Record movable equipment complete" })
    .click();
  await expect(page.getByText("Saving...")).toBeVisible();
  await page.getByLabel("Selected farm").selectOption(second.id);
  await expect(page.getByText("0 of 3 recorded")).toBeVisible();
  await page.getByLabel("Selected farm").selectOption(first.id);
  await expect(page.getByText("0 of 3 recorded")).toBeVisible();
  release();
  await expect(page.getByText("1 of 3 recorded")).toBeVisible();
});

test("a failed outstanding write remains visible when the worker returns to its farm", async ({
  page,
  request,
}) => {
  const first = await (
    await request.post("http://127.0.0.1:8080/api/v1/farms", {
      data: sample("Sample rejected save"),
    })
  ).json();
  const second = await (
    await request.post("http://127.0.0.1:8080/api/v1/farms", {
      data: sample("Sample other record"),
    })
  ).json();
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(`**/api/v1/farms/${first.id}/tasks/*`, async (route) => {
    await gate;
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ message: "Action temporarily unavailable" }),
    });
  });
  await page.goto(`/workspace#prepare?farm=${first.id}`);
  await page
    .getByRole("button", { name: "Mark Record movable equipment complete" })
    .click();
  await expect(page.getByText("Saving...")).toBeVisible();
  await page.getByLabel("Selected farm").selectOption(second.id);
  await expect(page.getByText("0 of 3 recorded")).toBeVisible();
  await page.getByLabel("Selected farm").selectOption(first.id);
  await expect(page.getByText("0 of 3 recorded")).toBeVisible();
  release();
  await expect(page.getByRole("alert")).toContainText(
    "Action temporarily unavailable",
  );
  await expect(page.getByText("0 of 3 recorded")).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Mark Record movable equipment complete",
    }),
  ).toBeEnabled();
});

test("farm selection preserves the requested page before its hash change is rendered", async ({
  page,
  request,
}) => {
  const farm = await (
    await request.post("http://127.0.0.1:8080/api/v1/farms", {
      data: sample("Sample rapid route selection"),
    })
  ).json();
  const target = await (
    await request.post("http://127.0.0.1:8080/api/v1/farms", {
      data: sample("Sample route target"),
    })
  ).json();
  await page.addInitScript(() => {
    let holding = false,
      held: HashChangeEvent | undefined;
    window.addEventListener(
      "hashchange",
      (event) => {
        if (holding) {
          held = event;
          event.stopImmediatePropagation();
        }
      },
      true,
    );
    const controls = window as unknown as Window & {
      holdRoute: () => void;
      releaseRoute: () => void;
    };
    controls.holdRoute = () => {
      holding = true;
    };
    controls.releaseRoute = () => {
      holding = false;
      if (held)
        window.dispatchEvent(
          new HashChangeEvent("hashchange", {
            oldURL: held.oldURL,
            newURL: location.href,
          }),
        );
    };
  });
  await page.goto(`/workspace#prepare?farm=${farm.id}`);
  await expect(page.getByText("0 of 3 recorded")).toBeVisible();
  await page.evaluate(() =>
    (window as unknown as Window & { holdRoute: () => void }).holdRoute(),
  );
  await page.getByRole("link", { name: "Farmer summary", exact: true }).click();
  await expect(page).toHaveURL(/#summary$/);
  await page.getByLabel("Selected farm").selectOption(target.id);
  await expect(page).toHaveURL(new RegExp(`#summary\\?farm=${target.id}$`));
  await page.evaluate(() =>
    (window as unknown as Window & { releaseRoute: () => void }).releaseRoute(),
  );
  await expect(
    page.getByRole("heading", { name: `${target.farmerName}'s farm` }),
  ).toBeVisible();
});
