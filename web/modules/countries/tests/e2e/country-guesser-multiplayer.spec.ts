import {
  test,
  expect,
  takeSnapshot,
} from "@chromatic-com/playwright";
import {
  clickRobustly,
  isolateRoomPerFile,
  joinLobby,
  submitName,
  testPerProject,
  waitForMapLoaded,
} from "./helpers";

test.beforeEach(async ({ context }, testInfo) => {
  await isolateRoomPerFile(context, testInfo, "multiplayer");
});

// Same alphabetical-under-Playwright queue as the solo test, so
// "Afghanistan", "Albania" and "Algeria" are always the first three
// targets. Unlike solo, multiplayer guesses/skips carry no time
// bonus/penalty (see game-room.ts), so there's no way to drain the
// clock early -- the round length is set to the server's 1 minute
// minimum. The round clock itself ticks faster under Playwright (see
// PLAYWRIGHT_TICK_SPEEDUP in game-room.ts), so the game-over wait
// below is roughly 1/4 of that, not a genuine 1 minute.
testPerProject(
  "plays a multiplayer round from an invite link through to game over, and back to the lobby",
  async ({ page, context, browser }, testInfo) => {
    test.setTimeout(90000);

    await context.grantPermissions([
      "clipboard-read",
      "clipboard-write",
    ]);
    await joinLobby(page, "Mark");
    await page.getByRole("button", { name: "Copy Link" }).click();
    await expect(
      page.getByRole("button", { name: "Copied!" }),
    ).toBeVisible();
    const inviteUrl = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );

    // Navigates straight to the invite URL and only fills in the name --
    // NOT joinLobby(), which starts by navigating to /countries and would
    // create (and land the guest in) a brand new room instead of Mark's.
    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    await guestPage.goto(inviteUrl);
    await submitName(guestPage, "Steve");

    // Host sees both players, the host badge, and the round-length
    // controls (a slider plus a linked numeric field) and Start Game.
    await expect(
      page.getByText("host", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Mark")).toBeVisible();
    await expect(page.getByText("Steve")).toBeVisible();
    await expect(
      page.getByRole("slider", { name: "Game length (min)" }),
    ).toBeVisible();
    const roundLengthInput = page.getByRole("spinbutton");
    await expect(roundLengthInput).toBeVisible();
    const startGameButton = page.getByRole("button", {
      name: "Start Game",
    });
    await expect(startGameButton).toBeVisible();

    // The guest sees neither -- just a waiting message.
    await expect(
      guestPage.getByRole("button", { name: "Start Game" }),
    ).toBeHidden();
    await expect(
      guestPage.getByRole("slider", { name: "Game length (min)" }),
    ).toBeHidden();
    await expect(
      guestPage.getByText("Waiting for the host to start…"),
    ).toBeVisible();

    // Shortest possible round -- the server clamps below 1 minute anyway.
    await roundLengthInput.fill("1");
    await startGameButton.click();

    const hostGuessInput = page.getByRole("searchbox", {
      name: "Guess",
    });
    const hostGuessButton = page.getByRole("button", {
      name: "Guess",
    });
    const hostSkipButton = page.getByRole("button", { name: "Skip" });
    const guestGuessInput = guestPage.getByRole("searchbox", {
      name: "Guess",
    });
    const guestGuessButton = guestPage.getByRole("button", {
      name: "Guess",
    });
    const guestSkipButton = guestPage.getByRole("button", {
      name: "Skip",
    });

    await expect(hostGuessInput).toBeVisible();
    await expect(guestGuessInput).toBeVisible();
    await expect(page.locator(".scorebar-players")).toContainText(
      "Mark",
    );
    await expect(page.locator(".scorebar-players")).toContainText(
      "Steve",
    );

    await waitForMapLoaded(page);
    await takeSnapshot(
      page,
      "Country Guesser Multiplayer Gameplay",
      testInfo,
    );

    // Afghanistan: both guess correctly -- each scores points (100 down
    // to a floor of 20, depending on how many clue letters happened to
    // be revealed before the guess landed) and the round only advances
    // once both are done.
    await hostGuessInput.fill("Afghanistan");
    await clickRobustly(hostGuessButton);
    await expect(page.locator(".guesspanel-waiting-text")).toHaveText(
      "Nice, you got it! Waiting for Steve…",
    );
    await expect(guestGuessInput).toBeVisible();

    await guestGuessInput.fill("Afghanistan");
    await clickRobustly(guestGuessButton);
    await expect(hostGuessInput).toBeVisible();
    await expect(guestGuessInput).toBeVisible();

    // Mark's score is now final -- he only skips from here on.
    const markPoints = Number(
      await page
        .locator(".scorebar-player", { hasText: "Mark" })
        .locator(".scorebar-player-score")
        .innerText(),
    );
    expect(markPoints).toBeGreaterThanOrEqual(20);
    expect(markPoints).toBeLessThanOrEqual(100);

    // Albania: host skips (no score change for him), guest guesses.
    await clickRobustly(hostSkipButton);
    await expect(page.locator(".guesspanel-waiting-text")).toHaveText(
      "Skipped. Waiting for Steve…",
    );
    await guestGuessInput.fill("Albania");
    await clickRobustly(guestGuessButton);
    await expect(hostGuessInput).toBeVisible();
    await expect(guestGuessInput).toBeVisible();

    // Steve's score is now final (2 correct guesses combined).
    const stevePoints = Number(
      await page
        .locator(".scorebar-player", { hasText: "Steve" })
        .locator(".scorebar-player-score")
        .innerText(),
    );
    expect(stevePoints).toBeGreaterThanOrEqual(40);
    expect(stevePoints).toBeLessThanOrEqual(200);
    expect(stevePoints).toBeGreaterThan(markPoints);

    // Algeria: guest skips first this time, then host -- no score change
    // for either.
    await clickRobustly(guestSkipButton);
    await expect(
      guestPage.locator(".guesspanel-waiting-text"),
    ).toHaveText("Skipped. Waiting for Mark…");
    await clickRobustly(hostSkipButton);

    // Steve: 2 correct, 1 skip -- the higher score, so the winner. Mark:
    // 1 correct, 2 skips. The rest of the round plays out untouched
    // until the (accelerated, ~15s) clock ends it.
    const gameOverHeading = page.getByRole("heading", {
      name: "Game Over",
    });
    await expect(gameOverHeading).toBeVisible({ timeout: 45000 });
    await expect(
      guestPage.getByRole("heading", { name: "Game Over" }),
    ).toBeVisible();

    await expect(page.locator(".gameoverscreen-winner")).toHaveText(
      "Steve wins!",
    );
    const scores = page.locator(".gameoverscreen-score");
    await expect(scores).toHaveCount(2);
    await expect(scores.nth(0)).toContainText("Steve");
    await expect(scores.nth(0)).toContainText("2 guessed, 1 skipped");
    await expect(
      scores.nth(0).locator(".gameoverscreen-score-pts"),
    ).toHaveText(String(stevePoints));
    await expect(scores.nth(1)).toContainText("Mark");
    await expect(scores.nth(1)).toContainText("1 guessed, 2 skipped");
    await expect(
      scores.nth(1).locator(".gameoverscreen-score-pts"),
    ).toHaveText(String(markPoints));

    await takeSnapshot(
      page,
      "Country Guesser Multiplayer Game Over",
      testInfo,
    );

    const backToLobbyButton = page.getByRole("button", {
      name: "Back to Lobby",
    });
    await expect(backToLobbyButton).toBeVisible();
    await expect(
      guestPage.getByText(
        "Waiting for the host to return to the lobby…",
      ),
    ).toBeVisible();

    await backToLobbyButton.click();
    await expect(startGameButton).toBeVisible();
    await expect(
      guestPage.getByText("Waiting for the host to start…"),
    ).toBeVisible();

    await guestContext.close();
  },
);
