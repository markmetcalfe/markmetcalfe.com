import {
  test,
  expect,
  takeSnapshot,
} from "@chromatic-com/playwright";
import {
  drainRoundViaSkips,
  isolateRoomPerFile,
  joinLobby,
  skipUntilTimerUnderOneMinute,
  testPerProject,
  waitForMapLoaded,
} from "./helpers";

test.beforeEach(async ({ context }, testInfo) => {
  await isolateRoomPerFile(context, testInfo, "solo");
});

// The room's queue is dealt alphabetically under Playwright (see
// `IS_PLAYWRIGHT` in game-room.ts), so "Afghanistan" and "Albania" are
// always the first two targets of a fresh solo round -- letting this
// guess/skip/score flow run without knowing the answer ahead of time.
// It's one long continuous session rather than several small tests
// because each Playwright test is a fresh browser context/player, and
// a second player joining mid-round would flip the room into
// multiplayer mode instead of solo.
testPerProject(
  "plays a solo round through to game over, and back to the lobby",
  async ({ page }, testInfo) => {
    test.setTimeout(120000);

    await joinLobby(page, "Alex");
    await page.getByRole("button", { name: "Start Game" }).click();

    const guessInput = page.getByRole("searchbox", { name: "Guess" });
    const guessButton = page.getByRole("button", { name: "Guess" });
    const skipButton = page.getByRole("button", { name: "Skip" });
    await expect(guessInput).toBeVisible();
    await expect(guessButton).toBeDisabled();
    await expect(skipButton).toBeVisible();

    await expect(page.locator(".scorebar-progress")).toHaveText(
      "0 / 197 guessed",
    );
    await expect(page.locator(".scorebar-score")).toHaveText("0 pts");
    // Solo rounds start at SOLO_ROUND_LENGTH (120s, see game-room.ts) --
    // a full minute or more always displays as "M:SS".
    await expect(page.locator(".scorebar-timer")).toHaveText(
      /^\d+:\d{2}\s*$/,
    );

    await waitForMapLoaded(page);
    await takeSnapshot(
      page,
      "Country Guesser Solo Gameplay",
      testInfo,
    );

    // Wrong guess for the first target (Afghanistan) doesn't advance.
    await guessInput.fill("Not A Country");
    await guessButton.click();
    await expect(page.locator(".scorebar-progress")).toHaveText(
      "0 / 197 guessed",
    );

    // Correct guess advances and scores points (100 down to a floor of
    // 20, 10 off per clue letter already revealed at guess time; clues
    // never auto-reveal under Playwright though, see `clueIntervalSeconds`
    // in game-room.ts, so this is always 100 here).
    await guessInput.fill("Afghanistan");
    await guessButton.click();
    await expect(page.locator(".scorebar-progress")).toHaveText(
      "1 / 197 guessed",
    );
    const scoreText = await page
      .locator(".scorebar-score")
      .innerText();
    const correctGuessPoints = Number(scoreText.replace(" pts", ""));
    expect(correctGuessPoints).toBeGreaterThanOrEqual(20);
    expect(correctGuessPoints).toBeLessThanOrEqual(100);

    // Skipping the second target (Albania) doesn't add to the guessed count.
    await skipButton.click();
    await expect(page.locator(".scorebar-progress")).toHaveText(
      "1 / 197 guessed",
    );

    // Once the countdown drops under a minute, the timer switches from
    // "M:SS" back to a plain "Ns".
    await skipUntilTimerUnderOneMinute(page, skipButton);

    // Drain the clock via skips (10s penalty each, solo mode) to reach
    // game over quickly instead of waiting out the full round length.
    // The exact number of skips needed is deterministic under Playwright
    // (see `soloClockIsManual` in game-room.ts), but is still read back
    // rather than asserted as a literal, since it's an implementation
    // detail of the server's clock math this test shouldn't hardcode.
    const gameOverHeading = page.getByRole("heading", {
      name: "Game Over",
    });
    await drainRoundViaSkips(skipButton, gameOverHeading);

    await expect(
      page.locator(".gameoverscreen-solo-score"),
    ).toHaveText(`${correctGuessPoints} points`);
    await expect(
      page.locator(".gameoverscreen-solo-progress"),
    ).toContainText("1 out of 197 countries guessed in");
    await expect(
      page.locator(".gameoverscreen-solo-stats"),
    ).toHaveText(/^\d+ skipped · \+10s from correct guesses\s*$/);

    await takeSnapshot(
      page,
      "Country Guesser Solo Game Over",
      testInfo,
    );

    const submitScoreButton = page.getByRole("button", {
      name: "Submit Score",
    });
    await submitScoreButton.click();
    await expect(
      page.getByRole("button", { name: "Score Submitted!" }),
    ).toBeDisabled();

    await page.getByRole("button", { name: "Leaderboard" }).click();
    await expect(
      page.getByRole("heading", { name: "Leaderboard" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(
      page.getByRole("heading", { name: "Leaderboard" }),
    ).toBeHidden();

    // Play Again starts a fresh round (queue -- and so the clock and
    // score -- resets).
    await page.getByRole("button", { name: "Play Again" }).click();
    await expect(guessInput).toBeVisible();
    await expect(page.locator(".scorebar-progress")).toHaveText(
      "0 / 197 guessed",
    );
    await expect(page.locator(".scorebar-score")).toHaveText("0 pts");

    // Skip through the whole round this time, then return to the lobby.
    await drainRoundViaSkips(skipButton, gameOverHeading);
    await expect(
      page.locator(".gameoverscreen-solo-score"),
    ).toHaveText("0 points");
    await expect(
      page.locator(".gameoverscreen-solo-stats"),
    ).toHaveText(/^\d+ skipped · \+0s from correct guesses\s*$/);

    await page.getByRole("button", { name: "Back to Lobby" }).click();
    await expect(
      page.getByRole("button", { name: "Start Game" }),
    ).toBeVisible();

    // Starting again from the lobby reconnects into the same, still
    // finished GameRoom DO -- this must restart it exactly like "Play
    // Again" does rather than reshowing the previous game's Game Over
    // screen (see the "round_end" branch in CountryGuesserGame.vue's
    // auto-start watcher), with the score actually reset too (see
    // "players" on the "target_start" broadcast in game-room.ts --
    // without it the client keeps showing the previous game's final
    // score instead of the server's freshly-reset one).
    await page.getByRole("button", { name: "Start Game" }).click();
    await expect(guessInput).toBeVisible();
    await expect(page.locator(".scorebar-progress")).toHaveText(
      "0 / 197 guessed",
    );
    await expect(page.locator(".scorebar-score")).toHaveText("0 pts");
  },
);

testPerProject(
  "redirects a stranger who tries to join an in-progress solo game back to /play",
  async ({ page, context, browser }, testInfo) => {
    // A fresh room, isolated from the long session above -- this one
    // needs a second browser mid-round, which would otherwise collide
    // with (or get flipped into multiplayer by) that shared room.
    await isolateRoomPerFile(context, testInfo, "solo-intruder");

    await joinLobby(page, "Alex");
    const roomUrl = page.url();
    await page.getByRole("button", { name: "Start Game" }).click();

    const guessInput = page.getByRole("searchbox", { name: "Guess" });
    await expect(guessInput).toBeVisible();
    await waitForMapLoaded(page);

    // Solo, one player -- the score readout, not a player list.
    await expect(page.locator(".scorebar-score")).toBeVisible();
    await expect(page.locator(".scorebar-players")).toHaveCount(0);

    // A stranger who already has a remembered name (e.g. played here
    // before) auto-joins on connect -- exactly the path the server
    // must reject once a solo game is already under way. Tagged with
    // its own room isolation too, since the redirect below lands them
    // on the bare /play hub, which creates a fresh room of its own.
    const guestContext = await browser.newContext();
    await guestContext.setExtraHTTPHeaders({
      "X-Playwright-Project": `${testInfo.project.name}-solo-intruder-guest`,
    });
    await guestContext.addInitScript(() => {
      window.localStorage.setItem("playerName", "Steve");
    });
    const guestPage = await guestContext.newPage();
    await guestPage.goto(roomUrl);

    // Rejected server-side, then redirected client-side (see
    // CountryGuesserGame.vue's "joinRejected" watcher) straight back to
    // /play -- which immediately creates its own fresh room for them,
    // rather than leaving them stuck spectating someone else's game.
    // (roomUrl itself already matches /play/.+, so this has to wait for
    // the URL to actually change rather than just match that pattern.)
    await guestPage.waitForURL(url => url.toString() !== roomUrl, {
      timeout: 15000,
    });
    await expect(guestPage).toHaveURL(/\/play\/.+/);

    // The original room stayed solo throughout -- the stranger never
    // actually registered as a real player.
    await expect(page.locator(".scorebar-players")).toHaveCount(0);
    await expect(page.locator(".scorebar-score")).toBeVisible();

    await takeSnapshot(
      page,
      "Country Guesser Solo Blocks Intruder",
      testInfo,
    );

    await guestContext.close();
  },
);
