import {
  test,
  expect,
  takeSnapshot,
} from "@chromatic-com/playwright";
import {
  drainRoundViaSkips,
  isolateRoomPerFile,
  joinLobby,
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
    await page
      .getByRole("button", { name: "Start Solo Game" })
      .click();

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
    await expect(page.locator(".scorebar-timer")).toHaveText(
      /^\d{2,3}s\s*$/,
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
    // 20, depending on how many clue letters happened to be revealed
    // before the guess landed).
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

    // Drain the clock via skips (10s penalty each, solo mode) to reach
    // game over quickly instead of waiting out the full round length.
    // The exact number of skips needed isn't fixed -- the alarm also
    // decrements the clock once per real second regardless of skips, so
    // it depends on how long the clicks themselves take -- so the skip
    // count below is read back rather than asserted as a literal.
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

    // Play Again starts a fresh round (queue -- and so the clock -- resets).
    await page.getByRole("button", { name: "Play Again" }).click();
    await expect(guessInput).toBeVisible();
    await expect(page.locator(".scorebar-progress")).toHaveText(
      "0 / 197 guessed",
    );

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
      page.getByRole("button", { name: "Start Solo Game" }),
    ).toBeVisible();
  },
);
