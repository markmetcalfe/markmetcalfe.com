import {
  test,
  expect,
  takeSnapshot,
} from "@chromatic-com/playwright";
import {
  isolateRoomPerFile,
  joinLobby,
  testPerProject,
  waitForMapLoaded,
} from "./helpers";

test.beforeEach(async ({ context }, testInfo) => {
  await isolateRoomPerFile(context, testInfo, "lobby");
});

test.describe("Country Guesser Lobby", () => {
  test.describe.configure({ mode: "serial" });

  testPerProject(
    "shows the name prompt modal, rejects an offensive name, then joins",
    async ({ page }, testInfo) => {
      await page.goto("/countries");
      await expect(page).toHaveURL(/\/countries\/abc123(-[\w-]+)?$/, {
        timeout: 15000,
      });

      await expect(
        page.getByRole("heading", { name: "Enter your name" }),
      ).toBeVisible();
      const nameInput = page.getByRole("searchbox", {
        name: "Your name",
      });
      await expect(page.getByText("Your name...")).toBeVisible();
      const joinButton = page.getByRole("button", {
        name: "Join Room",
      });
      await expect(joinButton).toBeDisabled();

      await waitForMapLoaded(page);
      await takeSnapshot(
        page,
        "Country Guesser Name Prompt",
        testInfo,
      );

      await nameInput.fill("fuck");
      await expect(joinButton).toBeEnabled();
      await joinButton.click();
      await expect(
        page.getByText("This name cannot be used"),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Enter your name" }),
      ).toBeVisible();

      await nameInput.fill("Alex");
      await joinButton.click();
      await expect(
        page.getByRole("heading", { name: "Enter your name" }),
      ).toBeHidden();
    },
  );

  testPerProject(
    "creates a room from the hub and shows the lobby",
    async ({ page }, testInfo) => {
      await joinLobby(page, "Alex");

      await expect(
        page.getByRole("heading", { name: "Country Guesser" }),
      ).toBeVisible();
      await expect(
        page.getByText("Invite Others To Play:"),
      ).toBeVisible();

      await waitForMapLoaded(page);
      await takeSnapshot(page, "Country Guesser Lobby", testInfo);
    },
  );

  testPerProject(
    "shows the header, heading and description",
    async ({ page }) => {
      await joinLobby(page, "Alex");

      await expect(page.locator(".headerbar-title")).toHaveText(
        "Country Guesser",
      );

      const backLink = page.getByRole("link", { name: "Leave game" });
      await expect(backLink).toBeVisible();
      await expect(backLink).toHaveAttribute("href", "/");

      await expect(
        page.getByRole("heading", { name: "Country Guesser" }),
      ).toBeVisible();
      await expect(
        page.getByText(
          "A country will be highlighted on the map — type its name before the clock runs out.",
          { exact: false },
        ),
      ).toBeVisible();
      await expect(
        page.getByText(
          "Letters get revealed over time, and you can skip (with a small penalty)",
          { exact: false },
        ),
      ).toBeVisible();

      await backLink.click();
      await expect(page).toHaveURL("/");
    },
  );

  testPerProject(
    "shows the solo game and leaderboard buttons",
    async ({ page }) => {
      await joinLobby(page, "Alex");

      await expect(
        page.getByRole("button", { name: "Start Solo Game" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Leaderboard" }),
      ).toBeVisible();
    },
  );

  testPerProject(
    "shows an invite link and copies it to the clipboard",
    async ({ page, context }) => {
      await context.grantPermissions([
        "clipboard-read",
        "clipboard-write",
      ]);
      await joinLobby(page, "Alex");

      await expect(
        page.getByText("Invite Others To Play:"),
      ).toBeVisible();
      await expect(
        page.locator(".roomlobby-invite-url"),
      ).toContainText("/countries/");

      const copyButton = page.getByRole("button", {
        name: "Copy Link",
      });
      await copyButton.click();

      await expect(
        page.getByRole("button", { name: "Copied!" }),
      ).toBeVisible();
      const clipboardText = await page.evaluate(() =>
        navigator.clipboard.readText(),
      );
      expect(clipboardText).toBe(page.url());
    },
  );

  testPerProject(
    "opens the leaderboard, lists scores highest to lowest, shows the player's best and closes",
    async ({ page }, testInfo) => {
      await page.addInitScript(() =>
        localStorage.setItem("countryGuesserHighScore", "555"),
      );

      // The leaderboard is a single global Durable Object shared by every
      // room (see LEADERBOARD.idFromName("global") in game-room.ts), so
      // whether it already has entries by the time this test runs depends
      // on which other tests happened to submit a score first -- on a
      // clean backend it's genuinely empty, which left the modal showing
      // "Loading…" (or "No scores yet") forever and made the Chromatic
      // snapshot flaky. Mocking the response makes both the content and
      // the load timing deterministic regardless of any other test.
      await page.route(
        "**/api/countries/leaderboard",
        route =>
          void route.fulfill({
            json: [
              { name: "Alex", score: 320 },
              { name: "Sam", score: 210 },
            ],
          }),
      );

      await joinLobby(page, "Alex");
      await page.getByRole("button", { name: "Leaderboard" }).click();

      await expect(
        page.getByRole("heading", { name: "Leaderboard" }),
      ).toBeVisible();

      const entries = page.locator(".leaderboardmodal-entry");
      await expect(entries).toHaveCount(2);
      await expect(entries.nth(0)).toContainText("Alex");
      await expect(
        entries.nth(0).locator(".leaderboardmodal-score"),
      ).toHaveText("320");
      await expect(entries.nth(1)).toContainText("Sam");
      await expect(
        entries.nth(1).locator(".leaderboardmodal-score"),
      ).toHaveText("210");

      await expect(
        page.locator(".leaderboardmodal-personal"),
      ).toHaveText("Your best: 555");

      await waitForMapLoaded(page);
      await takeSnapshot(
        page,
        "Country Guesser Leaderboard",
        testInfo,
      );

      await page.getByRole("button", { name: "Close" }).click();
      await expect(
        page.getByRole("heading", { name: "Leaderboard" }),
      ).toBeHidden();
    },
  );
});
