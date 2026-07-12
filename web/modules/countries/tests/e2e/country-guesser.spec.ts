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
    await page.goto("/countries");

    await page.locator('button:has-text("Play Solo")').click();

    await expect(
      page.locator("text=/ \\/ 197 guessed/"),
    ).toBeVisible();
    await expect(
      page.locator('input[placeholder="Type a country..."]'),
    ).toBeVisible();
  });
});
