import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("homepage explains the product without calling the farm API", async ({
  page,
}) => {
  const calls: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/")) calls.push(request.url());
  });
  await page.route("**/api/**", (route) => route.abort());
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Know your farm. Prepare for what comes next.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Evaluation release · sample records only"),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "See how the first workflow works" })
    .click();
  await expect(page).toHaveURL(/#how-it-works$/);
  await expect(
    page.getByRole("heading", { name: "Less guesswork. A clearer next step." }),
  ).toBeVisible();
  expect(calls).toEqual([]);
});

test("the primary action opens the real workspace and home navigation returns", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Explore the field workspace", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/workspace#overview$/);
  await expect(
    page.getByRole("heading", { name: "Farm preparedness", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "TerraFort homepage", exact: true })
    .click();
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("heading", {
      name: "Know your farm. Prepare for what comes next.",
    }),
  ).toBeVisible();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Farm preparedness", exact: true }),
  ).toBeVisible();
});

test("mobile disclosure, focus, FAQ and reduced motion are operable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#home-content")).toBeFocused();
  const menu = page.locator(".public-menu > summary");
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("navigation", { name: "Mobile product navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(
    page.getByRole("navigation", { name: "Mobile product navigation" }),
  ).toBeHidden();
  await page.keyboard.press("Enter");
  await page
    .getByRole("navigation", { name: "Mobile product navigation" })
    .getByRole("link", { name: "Who it is for" })
    .click();
  await expect(page).toHaveURL(/#for-farmers$/);
  await expect(page.locator("#for-farmers")).toBeFocused();
  await expect(
    page.getByRole("navigation", { name: "Mobile product navigation" }),
  ).toBeHidden();
  const question = page
    .locator(".question-list summary")
    .filter({ hasText: "Is TerraFort a live flood-warning service?" });
  await question.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("Not yet. The current release has farm registration", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(page.locator(".question-list details").first()).toHaveAttribute(
    "open",
    "",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("desktop, expanded mobile navigation and 320px reflow pass automated checks", async ({
  page,
}) => {
  await page.goto("/");
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    if (width === 390) await page.locator(".public-menu > summary").click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
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

test("unknown paths do not silently open operational records", async ({
  page,
}) => {
  const calls: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/")) calls.push(request.url());
  });
  await page.goto("/missing-page");
  await expect(
    page.getByRole("heading", { name: "That page is not here." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Return to TerraFort" }).click();
  await expect(page).toHaveURL("/");
  expect(calls).toEqual([]);
});

test.describe("production output", () => {
  test.use({ baseURL: "http://127.0.0.1:4173" });
  test("homepage is readable and FAQ works with JavaScript disabled", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      baseURL: "http://127.0.0.1:4173",
    });
    const page = await context.newPage();
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: "Know your farm. Prepare for what comes next.",
      }),
    ).toBeVisible();
    await page
      .locator(".question-list summary")
      .filter({ hasText: "Does a farm record confirm insurance cover?" })
      .click();
    await expect(
      page.getByText("No. The record does not confirm a policy", {
        exact: false,
      }),
    ).toBeVisible();
    await context.close();
  });
  test("hydration preserves content and workspace entry is non-indexed", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("/");
    await page
      .getByRole("link", { name: "Explore the field workspace", exact: true })
      .first()
      .click();
    await expect(
      page.getByRole("heading", { name: "Farm preparedness", exact: true }),
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex,nofollow",
    );
    expect(errors).toEqual([]);
  });
});

test("a failed workspace download offers a real retry rather than a blank screen", async ({
  page,
}) => {
  await page.route("**/assets/FieldWorkspace-*.js", (route) => route.abort());
  await page.goto("http://127.0.0.1:4173/");
  await page
    .getByRole("link", { name: "Explore the field workspace", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "The workspace could not be opened." }),
  ).toBeVisible();
  await page.unroute("**/assets/FieldWorkspace-*.js");
  await page.getByRole("button", { name: "Retry workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Farm preparedness", exact: true }),
  ).toBeVisible();
});
