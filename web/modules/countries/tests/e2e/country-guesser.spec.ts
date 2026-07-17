import {
  test,
  expect,
  takeSnapshot,
} from "@chromatic-com/playwright";

test.describe("CountryGuesserPage", () => {
  test("redirects to a new room and shows the lobby", async ({
    page,
  }, testInfo) => {
    await page.goto("/countries");

    await expect(page).toHaveURL(/\/countries\/abc123$/, {
      timeout: 15000,
    });
    await expect(
      page.getByRole("heading", { name: "Country Guesser" }),
    ).toBeVisible();
    await expect(
      page.getByText("Invite Others To Play:"),
    ).toBeVisible();

    await takeSnapshot(page, "Country Guesser Lobby", testInfo);
  });
});
