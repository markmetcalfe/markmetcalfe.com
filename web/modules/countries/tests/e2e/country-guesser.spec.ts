import {
  test,
  expect,
  takeSnapshot,
} from "@chromatic-com/playwright";

test.describe("CountryGuesserPage", () => {
  test("can load the hub page", async ({ page }, testInfo) => {
    await page.goto("/countries");

    await expect(
      page.getByRole("heading", { name: "Country Guesser" }),
    ).toBeVisible();
    await expect(page.locator('text="Play Solo"')).toBeVisible();
    await expect(page.locator('text="Create Room"')).toBeVisible();

    await takeSnapshot(page, "Country Guesser Hub", testInfo);
  });

  test("can start a solo round", async ({ page }) => {
    // Solo play now connects to the countries API over a WebSocket
    // (server-authoritative scoring for the leaderboard), which this
    // hermetic Playwright/Chromatic environment has no route to. This
    // only checks the part reachable without a live backend -- that
    // clicking Play Solo leaves the hub and starts connecting.
    await page.goto("/countries");

    await page.locator('button:has-text("Play Solo")').click();

    await expect(page.getByText("Connecting…")).toBeVisible();
  });
});
