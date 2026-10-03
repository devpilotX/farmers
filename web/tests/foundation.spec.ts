import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("registration, durable checklist, summary, and printable record", async ({
  page,
}) => {
  await page.goto("/#register");
  const name = `Sample browser farmer ${Date.now()}`;
  await page.getByLabel("Farmer name", { exact: true }).fill(name);
  await page.getByLabel("Village", { exact: true }).fill("Sample village");
  await page.getByLabel("District", { exact: true }).fill("Sample district");
  await page.getByLabel("Area in hectares").fill("1.25");
  await page.getByLabel("Movable assets (optional)").fill("One sample pump");
  await page
    .getByLabel("Longitude, latitude coordinates")
    .fill("86.100,25.900\n86.102,25.900\n86.102,25.902\n86.100,25.900");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Save farm record" }).click();
  await expect(
    page.getByRole("heading", { name: `${name}'s farm` }),
  ).toBeVisible();
  await expect(page.getByText("One sample pump")).toBeVisible();
  await page.getByRole("button", { name: "Open the checklist" }).click();
  const task = page.getByRole("button", {
    name: "Mark Record movable equipment complete",
  });
  await task.click();
  await expect(page.getByText("1 of 3 recorded")).toBeVisible();
  await page.reload();
  await expect(page.getByText("1 of 3 recorded")).toBeVisible();
  await page.getByRole("link", { name: "Farmer summary", exact: true }).click();
  await page
    .getByLabel("Selected farm")
    .selectOption({ label: `${name} · Sample village` });
  await expect(
    page.getByText("1 of 3 actions recorded as complete."),
  ).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("navigation")).toBeHidden();
  await expect(
    page.getByRole("heading", { name: `${name}'s farm` }),
  ).toBeVisible();
});
test("server failure is visible and retry recovers", async ({ page }) => {
  await page.route("**/api/v1/farms", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ message: "Temporary test outage" }),
    }),
  );
  await page.goto("/workspace");
  await expect(page.getByRole("alert")).toContainText("Temporary test outage");
  await page.unroute("**/api/v1/farms");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("heading", { name: "Your farms, at a glance" }),
  ).toBeVisible();
});
test("empty registry, failed actions, mobile navigation and keyboard entry", async ({
  page,
}) => {
  await page.route("**/api/v1/farms", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.goto("/workspace");
  await expect(page.getByText("Your first farm starts here.")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.getByRole("link", { name: "Farm registry", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "The farm registry" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("main surfaces have no automated WCAG AA violations", async ({ page }) => {
  for (const route of ["overview", "farms", "register", "prepare", "summary"]) {
    await page.goto(`/#${route}`);
    await expect(page.getByText("Loading the farm workspace...")).toBeHidden();
    await expect(page.getByText("Loading the saved actions...")).toBeHidden();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      results.violations,
      JSON.stringify(
        results.violations.map((item) => ({
          id: item.id,
          nodes: item.nodes.map((node) => node.target),
        })),
      ),
    ).toEqual([]);
  }
});

test("partial summary does not present missing actions as zero completion", async ({
  page,
}) => {
  await page.route("**/api/v1/farms/*/tasks", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ message: "Actions temporarily unavailable" }),
    }),
  );
  await page.goto("/#summary");
  await expect(page.getByRole("alert")).toContainText(
    "Actions temporarily unavailable",
  );
  await expect(
    page.getByText(
      "Preparedness data is unavailable. Retry the actions above.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Print summary" }),
  ).toBeVisible();
  await page.unroute("**/api/v1/farms/*/tasks");
  await page.getByRole("button", { name: "Retry actions" }).click();
  await expect(
    page.getByText(
      "Preparedness data is unavailable. Retry the actions above.",
    ),
  ).toBeHidden();
});

test("keyboard registration, invalid coordinates and failed save preserve entered values", async ({
  page,
}) => {
  await page.goto("/#register");
  await expect(
    page.getByRole("heading", { name: "Register a farm", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Farmer name", { exact: true })).toBeEnabled();
  await page.getByLabel("Farmer name", { exact: true }).focus();
  await page.keyboard.type("Keyboard sample");
  await page.keyboard.press("Tab");
  await page.keyboard.type("Keyboard village");
  await page.keyboard.press("Tab");
  await page.keyboard.type("Keyboard district");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Area in hectares")).toBeFocused();
  await page.keyboard.type("0.50");
  await page.keyboard.press("Tab");
  await page.keyboard.type("Sample equipment");
  await page.keyboard.press("Tab");
  await page.keyboard.type("86,25\n87,25\n87,26\n86,26");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("alert")).toContainText("Repeat the first point");
  await page
    .getByLabel("Longitude, latitude coordinates")
    .fill("86,25\n87,25\n87,26\n86,25");
  await page.route("**/api/v1/farms", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ message: "Save temporarily unavailable" }),
        })
      : route.continue(),
  );
  await page.getByRole("button", { name: "Save farm record" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Save temporarily unavailable",
  );
  await expect(page.getByLabel("Farmer name", { exact: true })).toHaveValue(
    "Keyboard sample",
  );
});

test("pending workspace requests render loading rather than empty totals", async ({
  page,
}) => {
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/v1/farms", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/workspace");
  await expect(page.getByText("Loading the farm workspace...")).toBeVisible();
  await expect(page.getByText("Your first farm starts here.")).toBeHidden();
  release();
  await expect(
    page.getByRole("heading", { name: "Your farms, at a glance" }),
  ).toBeVisible();
});
