import {
  test,
  expect,
  type APIRequestContext,
  type Page,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function createFarm(request: APIRequestContext) {
  const response = await request.post("http://127.0.0.1:8080/api/v1/farms", {
    data: {
      requestId: crypto.randomUUID(),
      farmerName: "Sample correction farmer",
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
    },
  });
  expect(response.status()).toBe(201);
  return await response.json();
}
async function review(
  page: Page,
  reason = "Corrected crop after checking the sample record",
) {
  await page
    .getByRole("combobox", { name: "Crop", exact: true })
    .selectOption("Maize");
  await page.getByLabel("Reason for this correction").fill(reason);
  await page.getByRole("checkbox").check();
}

test("reviewed correction survives refresh and preserves original permission and tasks", async ({
  page,
  request,
}) => {
  const farm = await createFarm(request);
  const other = await createFarm(request);
  await page.goto(`/workspace#summary?farm=${farm.id}`);
  await page
    .getByRole("link", { name: "Correct farm details", exact: true })
    .click();
  await review(page);
  await page.getByRole("button", { name: "Save reviewed correction" }).click();
  await expect(
    page.getByText(
      "Reviewed correction saved. Original permission and actions are unchanged.",
    ),
  ).toBeVisible();
  await expect(page.locator(".summary")).toContainText("Maize");
  await page.getByLabel("Selected farm").selectOption(other.id);
  await expect(page.locator(".success-notice")).toBeHidden();
  await page.getByLabel("Selected farm").selectOption(farm.id);
  await page.reload();
  await expect(page.locator(".summary")).toContainText("Maize");
  await expect(page.locator(".summary")).toContainText(
    "0 of 3 actions recorded as complete.",
  );
  await page.getByRole("link", { name: "Record history", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Farm details corrected" }),
  ).toBeVisible();
  await expect(page.getByText("Version 2", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Corrected crop after checking the sample record", {
      exact: false,
    }),
  ).toBeVisible();
  const saved = await (
    await request.get(`http://127.0.0.1:8080/api/v1/farms/${farm.id}`)
  ).json();
  expect(saved.consentAt).toBe(farm.consentAt);
  await page.getByRole("link", { name: "Farm summary", exact: true }).click();
  await page.getByLabel("Selected farm").selectOption(other.id);
  await expect(page.locator(".success-notice")).toBeHidden();
});

test("lost correction response retries the same submission without duplicate events", async ({
  page,
  request,
}) => {
  const farm = await createFarm(request);
  const bodies: string[] = [];
  await page.route(`**/api/v1/farms/${farm.id}`, async (route) => {
    if (route.request().method() !== "PUT") return route.continue();
    bodies.push(route.request().postData()!);
    if (bodies.length === 1) {
      await route.fetch();
      await route.abort("failed");
    } else await route.continue();
  });
  await page.goto(`/workspace#edit?farm=${farm.id}`);
  await review(page);
  await page.getByRole("button", { name: "Save reviewed correction" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "response is unconfirmed",
  );
  await expect(
    page.getByRole("combobox", { name: "Crop", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Retry this correction" }).click();
  await expect(page.locator(".summary")).toContainText("Maize");
  expect(bodies).toHaveLength(2);
  expect(bodies[1]).toBe(bodies[0]);
  const history = await (
    await request.get(`http://127.0.0.1:8080/api/v1/farms/${farm.id}/history`)
  ).json();
  expect(
    history.filter(
      (event: { eventType: string }) => event.eventType === "FARM_CORRECTED",
    ),
  ).toHaveLength(1);
});

test("a stale edit never overwrites the other correction and starts from the current record", async ({
  page,
  request,
}) => {
  const farm = await createFarm(request);
  await page.goto(`/workspace#edit?farm=${farm.id}`);
  await review(page);
  const result = await request.put(
    `http://127.0.0.1:8080/api/v1/farms/${farm.id}`,
    {
      data: {
        requestId: crypto.randomUUID(),
        expectedVersion: 1,
        reviewed: true,
        reason: "Reviewed other sample change",
        crop: "Vegetables",
        stage: farm.stage,
        areaHectares: farm.areaHectares,
        assets: farm.assets,
        boundary: farm.boundary,
      },
    },
  );
  expect(result.status()).toBe(200);
  await page.getByRole("button", { name: "Save reviewed correction" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "record changed after you opened it",
  );
  await expect(
    page.getByRole("button", { name: "Retry this correction" }),
  ).toBeHidden();
  await page.getByRole("button", { name: "Review current record" }).click();
  await expect(page.locator(".summary")).toContainText("Vegetables");
  await page
    .getByRole("link", { name: "Correct farm details", exact: true })
    .click();
  await expect(page.getByText("Version 2", { exact: true })).toBeVisible();
  await expect(page.getByRole("checkbox")).not.toBeChecked();
});

test("no-change and invalid boundary errors retain editable reviewed fields", async ({
  page,
  request,
}) => {
  const farm = await createFarm(request);
  await page.goto(`/workspace#edit?farm=${farm.id}`);
  await page
    .getByLabel("Reason for this correction")
    .fill("Reviewed unchanged sample");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Save reviewed correction" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "No farm details changed",
  );
  await expect(
    page.getByRole("combobox", { name: "Crop", exact: true }),
  ).toBeEnabled();
  await page
    .getByLabel("Longitude, latitude coordinates")
    .fill("86,25\n87,25\n87,26\n86,26");
  await page.getByRole("button", { name: "Save reviewed correction" }).click();
  await expect(page.getByRole("alert")).toContainText("Repeat the first point");
  await expect(page.getByLabel("Reason for this correction")).toHaveValue(
    "Reviewed unchanged sample",
  );
});

test("history loading, empty and failure states do not invent events", async ({
  page,
  request,
}) => {
  const farm = await createFarm(request);
  await page.route(`**/api/v1/farms/${farm.id}/history`, (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ message: "History temporarily unavailable" }),
    }),
  );
  await page.goto(`/workspace#history?farm=${farm.id}`);
  await expect(page.getByRole("alert")).toContainText(
    "History temporarily unavailable",
  );
  await expect(page.getByText("No events available")).toBeHidden();
  await page.unroute(`**/api/v1/farms/${farm.id}/history`);
  await page.route(`**/api/v1/farms/${farm.id}/history`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.getByRole("button", { name: "Retry history" }).click();
  await expect(page.getByText("No events available")).toBeVisible();
});

test("mobile correction, history and unknown record have accessible bounded layouts", async ({
  page,
  request,
}) => {
  const farm = await createFarm(request);
  await page.setViewportSize({ width: 320, height: 800 });
  for (const route of ["edit", "history"]) {
    await page.goto(`/workspace#${route}?farm=${farm.id}`);
    await expect(page.getByText("Loading the farm workspace...")).toBeHidden();
    await expect(page.getByText("Loading record history...")).toBeHidden();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }
  await page.goto(`/workspace#edit?farm=${crypto.randomUUID()}`);
  await expect(
    page.getByText("Farm not found in this workspace"),
  ).toBeVisible();
});

test("keyboard correction and cancelled navigation preserve unsaved values", async ({
  page,
  request,
}) => {
  const farm = await createFarm(request);
  await page.goto(`/workspace#edit?farm=${farm.id}`);
  await page.getByRole("combobox", { name: "Crop", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("combobox", { name: "Crop stage", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Area in hectares")).toBeFocused();
  await page
    .getByLabel("Reason for this correction")
    .fill("Keep this unsaved reason");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("link", { name: "Return to farm summary" }).click();
  await expect(page.getByLabel("Reason for this correction")).toHaveValue(
    "Keep this unsaved reason",
  );
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.evaluate(() => {
    location.hash = "farms";
  });
  await expect(page.getByLabel("Reason for this correction")).toHaveValue(
    "Keep this unsaved reason",
  );
});

test("leaving an in-flight correction does not redirect when its response arrives", async ({
  page,
  request,
}) => {
  const farm = await createFarm(request);
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(`**/api/v1/farms/${farm.id}`, async (route) => {
    if (route.request().method() !== "PUT") return route.continue();
    const response = await route.fetch();
    await gate;
    await route.fulfill({ response });
  });
  await page.goto(`/workspace#edit?farm=${farm.id}`);
  await review(page);
  await page.getByRole("button", { name: "Save reviewed correction" }).click();
  await expect(
    page.getByRole("button", { name: "Confirming correction..." }),
  ).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("link", { name: "Farm registry", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "The farm registry" }),
  ).toBeVisible();
  const completed = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/v1/farms/${farm.id}`) &&
      response.request().method() === "PUT",
  );
  release();
  await completed;
  await expect(
    page.getByRole("heading", { name: "The farm registry" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/#farms$/);
});
