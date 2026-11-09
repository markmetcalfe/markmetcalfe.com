import {
  test,
  expect,
  takeSnapshot,
} from "@chromatic-com/playwright";

test.describe("HomePage", () => {
  for (const [hostname, firstName] of [
    ["markmetcalfe.com", "Mark"],
    ["markometcalfe.com", "Marko"],
  ] as const) {
    test(`uses the name ${firstName} on ${hostname}`, async ({
      request,
    }) => {
      const response = await request.get("/", {
        headers: { Host: hostname },
      });

      expect(response.ok()).toBe(true);
      const html = await response.text();

      expect(html).toContain(`<title>${firstName} Metcalfe</title>`);
      expect(html).toContain(
        `property="og:title" content="${firstName} Metcalfe"`,
      );
      expect(html).toContain(
        `name="description" content="${firstName} Metcalfe: Developer & Visual Artist"`,
      );
      expect(html).toContain(
        `property="og:description" content="${firstName} Metcalfe: Developer & Visual Artist"`,
      );
      expect(html).toMatch(
        new RegExp(`<h1>${firstName} Metcalfe\\s*</h1>`),
      );
    });

    test(`suffixes page titles with ${firstName} on ${hostname}`, async ({
      request,
    }) => {
      const response = await request.get("/sequencer", {
        headers: { Host: hostname },
      });
      const html = await response.text();

      expect(html).toContain(
        `<title>Sequencer - ${firstName} Metcalfe</title>`,
      );
      expect(html).toContain(
        `property="og:title" content="Sequencer - ${firstName} Metcalfe"`,
      );
      expect(html).toContain(
        `property="og:image" content="https://markmetcalfe.com/sequencer-social-card.jpg?v=1"`,
      );
    });
  }

  test("can load page", async ({ page }, testInfo) => {
    await page.goto("/");
    await expect(page.locator('text="Mark Metcalfe"')).toBeVisible();

    await expect(page.locator('text="Me"')).toBeVisible();
    await expect(page.locator('text="My Work"')).toBeVisible();

    await takeSnapshot(page, "Home Page", testInfo);
  });

  test("email link has valid mailto value", async ({ page }) => {
    await page.goto("/");

    const link = page.getByTitle("Email");

    await expect(link).toHaveAttribute(
      "href",
      "mailto:mark@markmetcalfe.com",
    );
  });

  test("can navigate to github", async ({ page }) => {
    await page.goto("/");

    const link = page.getByTitle("GitHub");

    await expect(link).toHaveAttribute(
      "href",
      "https://github.com/markmetcalfe",
    );
  });

  test("can navigate to instagram", async ({ page }) => {
    await page.goto("/");

    const link = page.getByTitle("Instagram");

    await expect(link).toHaveAttribute(
      "href",
      "https://instagram.com/markus_vizshun",
    );
  });

  test("can navigate to linkedin", async ({ page }) => {
    await page.goto("/");

    const link = page.getByTitle("LinkedIn");

    await expect(link).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/mark-metcalfe/",
    );
  });

  test("can navigate to the resume page", async ({ page }) => {
    await page.goto("/");

    const link = page.locator('a:has-text("Resume")');

    await Promise.all([page.waitForURL("/resume"), link.click()]);

    await expect(page.locator("body")).toContainText("Resume");
    await expect(page.locator("body")).toContainText("Experience");
  });

  test("can navigate to the visuals page", async ({ page }) => {
    await page.goto("/");

    const link = page.locator('a:has-text("Visualiser")');

    await Promise.all([page.waitForURL("/visuals"), link.click()]);

    await expect(page.locator("body")).toContainText("Visualiser");
  });

  test("can navigate to the sequencer page", async ({ page }) => {
    await page.goto("/");

    const link = page.locator('a:has-text("Sequencer")');

    await Promise.all([page.waitForURL("/sequencer"), link.click()]);

    await expect(page.locator("body")).toContainText(
      "Step Sequencer",
    );
  });

  test("can navigate to the games page", async ({ page }) => {
    await page.goto("/");

    const link = page.locator('a:has-text("Games")');

    await Promise.all([page.waitForURL(/\/play\/.+/), link.click()]);

    await expect(page.locator("body")).toContainText("Games");
  });
});
