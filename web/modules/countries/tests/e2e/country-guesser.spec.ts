import {
  test,
  expect,
  takeSnapshot,
} from "@chromatic-com/playwright";

test.describe("CountryGuesserPage", () => {
  test("redirects to a new room and shows the lobby", async ({
    page,
  }, testInfo) => {
    // The room page always connects to the countries API over a
    // WebSocket (server-authoritative state), which this hermetic
    // Playwright/Chromatic environment has no route to. This only
    // checks what's reachable without a live backend -- that visiting
    // the hub creates a room and lands on its (pre-connection) lobby
    // shell, stubbing just the room-creation POST so the redirect can
    // happen at all.
    await page.route("**/api/countries/rooms", route =>
      route.fulfill({ json: { roomId: "testroom" } }),
    );

    await page.goto("/countries");

    await expect(page).toHaveURL("/countries/testroom");
    await expect(
      page.getByRole("heading", { name: "Country Guesser" }),
    ).toBeVisible();
    await expect(
      page.getByText("Invite Others To Play:"),
    ).toBeVisible();

    await takeSnapshot(page, "Country Guesser Lobby", testInfo);
  });
});
