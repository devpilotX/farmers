import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function fillSample(page: Page, name: string) {
  await page.getByLabel("Farmer name", { exact: true }).fill(name);
  await page.getByLabel("Village", { exact: true }).fill("Sample village");
  await page.getByLabel("District", { exact: true }).fill("Sample district");
  await page.getByLabel("Area in hectares").fill("1.25");
  await page.getByLabel("Movable assets (optional)").fill("One sample pump");
  await page
    .getByLabel("Longitude, latitude coordinates")
    .fill("86,25\n87,25\n87,26\n86,25");
  await page.getByRole("checkbox").check();
}
async function queueSample(page: Page, name: string) {
  await page.goto("/workspace#register");
  await fillSample(page, name);
  await page.getByRole("button", { name: "Keep pending for later" }).click();
  await expect(page.getByRole("heading", { name })).toBeVisible();
}
test("a partial draft survives refresh without carrying permission", async ({
  page,
}) => {
  let writes = 0;
  page.on("request", (request) => {
    if (request.method() === "POST") writes++;
  });
  await page.goto("/workspace#register");
  await page
    .getByLabel("Farmer name", { exact: true })
    .fill("Sample partial draft");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Save sample draft" }).click();
  await expect(page.getByRole("status")).toContainText("Sample draft saved");
  await page.reload();
  await expect(page.getByLabel("Farmer name", { exact: true })).toHaveValue(
    "Sample partial draft",
  );
  await expect(page.getByRole("checkbox")).not.toBeChecked();
  expect(writes).toBe(0);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Discard saved draft" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Saved device draft removed",
  );
  await page.reload();
  await expect(page.getByLabel("Farmer name", { exact: true })).toHaveValue("");
});
test("pending capture makes no POST, survives refresh and sends explicitly", async ({
  page,
}) => {
  let writes = 0;
  page.on("request", (request) => {
    if (request.method() === "POST") writes++;
  });
  const name = `Sample queued capture ${Date.now()}`;
  await queueSample(page, name);
  expect(writes).toBe(0);
  await page.reload();
  await expect(page.getByRole("heading", { name })).toBeVisible();
  await page.getByText("Review the fixed submission", { exact: true }).click();
  await expect(
    page.getByText("One sample pump", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Send this registration" }).click();
  await expect(
    page.getByRole("heading", { name: "No pending registrations" }),
  ).toBeVisible();
  expect(writes).toBe(1);
  const farms = await (await page.request.get("/api/v1/farms")).json();
  expect(
    farms.filter((farm: { farmerName: string }) => farm.farmerName === name),
  ).toHaveLength(1);
});
test("a committed request with a lost response retries to the same farm", async ({
  page,
}) => {
  const name = `Sample lost response ${Date.now()}`;
  let savedId = "";
  await page.goto("/workspace#register");
  await fillSample(page, name);
  await page.route("**/api/v1/farms", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    const response = await route.fetch();
    expect(response.ok()).toBe(true);
    savedId = (await response.json()).id;
    await route.abort();
  });
  await page.getByRole("button", { name: "Save farm record" }).click();
  await expect(page.getByRole("alert")).toContainText("pending copy");
  await expect(page.getByLabel("Farmer name", { exact: true })).toHaveValue(
    name,
  );
  await expect(
    page.getByRole("button", { name: "Save farm record" }),
  ).toBeDisabled();
  await page.unroute("**/api/v1/farms");
  await page.reload();
  await page
    .getByRole("link", { name: "Pending registrations", exact: true })
    .click();
  await page.getByRole("button", { name: "Send this registration" }).click();
  await expect(
    page.getByRole("heading", { name: "No pending registrations" }),
  ).toBeVisible();
  const farms = await (await page.request.get("/api/v1/farms")).json();
  const matching = farms.filter(
    (farm: { farmerName: string }) => farm.farmerName === name,
  );
  expect(matching).toHaveLength(1);
  expect(matching[0].id).toBe(savedId);
});
test("a server rejection keeps the fixed copy and discard changes no server data", async ({
  page,
}) => {
  await queueSample(page, "Sample rejected capture");
  await page.route("**/api/v1/farms", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ message: "Review this test submission" }),
        })
      : route.continue(),
  );
  await page.getByRole("button", { name: "Send this registration" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Review this test submission",
  );
  await expect(
    page.getByRole("heading", { name: "Sample rejected capture" }),
  ).toBeVisible();
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Discard local copy" }).click();
  await expect(
    page.getByRole("heading", { name: "Sample rejected capture" }),
  ).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Discard local copy" }).click();
  await expect(page.getByRole("status").last()).toContainText(
    "Server records were not changed",
  );
  await expect(
    page.getByRole("heading", { name: "No pending registrations" }),
  ).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "kept pending" }),
  ).toHaveCount(0);
});
test("blocked device storage never reports a saved draft or sends a sample POST", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "indexedDB", { value: undefined }),
  );
  let writes = 0;
  page.on("request", (request) => {
    if (request.method() === "POST") writes++;
  });
  await page.goto("/workspace#register");
  await fillSample(page, "Sample storage failure");
  await page.getByRole("button", { name: "Save farm record" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Device storage is unavailable",
  );
  await expect(page.getByLabel("Farmer name", { exact: true })).toHaveValue(
    "Sample storage failure",
  );
  expect(writes).toBe(0);
});
test("authenticated mode never opens the sample store", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "indexedDB", {
      get() {
        throw new Error("Unexpected device persistence");
      },
    });
  });
  await page.route("**/api/v1/workspace", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        mode: "authenticated",
        playbookStatus: "illustrative",
      }),
    }),
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/workspace#register");
  await expect(
    page.getByRole("button", { name: "Save sample draft" }),
  ).toHaveCount(0);
  await page
    .getByRole("link", { name: "Pending registrations", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Device capture is not enabled here" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("pending preview and keyboard send reflow with no automated AA violations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await queueSample(page, "Sample mobile capture");
  const review = page.locator(".pending-record summary");
  await review.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("One sample pump", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "Send this registration" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Review before sending" }),
  ).toBeFocused();
});
