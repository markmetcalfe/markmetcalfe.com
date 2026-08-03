import { expect, test } from "@chromatic-com/playwright";
import type {
  Browser,
  BrowserContext,
  Locator,
  Page,
  TestInfo,
} from "@playwright/test";

// Mirrors the two project names in playwright.config.ts.
// @chromatic-com/playwright writes one archive file per test, named
// purely from the test's title path (spec file + describe blocks +
// test name) with no project or viewport in the path, and -- for
// Playwright specifically (unlike e.g. Vitest) -- always overwrites
// rather than disambiguating a repeat write. So a test with the same
// title run under both Desktop Chrome and Mobile Chrome silently
// clobbers whichever project's archive was written first, losing that
// project's Chromatic coverage for the story entirely (verified
// directly against the installed 0.14.11, the latest version).
// Registering the test under a genuinely different title per project
// avoids the collision -- each project's own `grepInvert` (see
// playwright.config.ts) then excludes the *other* project's variant
// entirely, rather than instantiating and skipping it: a mid-body
// `test.skip()` still runs the chromatic-wrapped `page` fixture's
// teardown (verified directly), which writes an empty archive for the
// skipped variant and reintroduces the exact same collision.
const PROJECT_NAMES = ["Desktop Chrome", "Mobile Chrome"] as const;

// Not `Parameters<typeof test>[1]` -- test() is overloaded, and
// Parameters<> on an overloaded function type only sees the *last*
// overload (test(title, details, body)), resolving [1] to the details
// object rather than the callback.
type TestFn = (
  fixtures: { page: Page; context: BrowserContext; browser: Browser },
  testInfo: TestInfo,
) => Promise<void>;

export function testPerProject(name: string, fn: TestFn) {
  for (const projectName of PROJECT_NAMES) {
    // Playwright requires the test callback's first parameter to be an
    // object-destructuring pattern -- it statically rejects a plain
    // named parameter -- so the full fixture set used across these
    // spec files is destructured here and forwarded on, rather than
    // passing the fixtures object through untouched.
    test(`${name} (${projectName})`, async ({
      page,
      context,
      browser,
    }, testInfo) => {
      await fn({ page, context, browser }, testInfo);
    });
  }
}

// Every e2e file that hits /play otherwise shares Playwright's two
// fixed per-project rooms ("abc123-desktop"/"abc123-mobile", see
// generateRoomId in api/play/src/index.ts). Splitting gameplay
// into separate spec files only pays off if those files can still run
// in parallel (Playwright's fullyParallel default schedules different
// files onto different workers) without corrupting each other's shared
// room state -- so each file tags its own room via this helper instead.
//
// A file-level `test.use({ extraHTTPHeaders })` can't do this cleanly:
// it replaces the project's own extraHTTPHeaders wholesale rather than
// merging into it (verified directly -- a file-level override drops
// "X-Playwright-Project" entirely and falls back to the bare "abc123"
// room, losing the desktop/mobile split that keeps those two projects
// from colliding). Reading the project's configured value at runtime
// and appending to it instead preserves both.
export async function isolateRoomPerFile(
  context: BrowserContext,
  testInfo: TestInfo,
  fileTag: string,
) {
  const projectTag =
    testInfo.project.use.extraHTTPHeaders?.["X-Playwright-Project"] ??
    testInfo.project.name;
  await context.setExtraHTTPHeaders({
    "X-Playwright-Project": `${projectTag}-${fileTag}`,
  });
}

// Only for a fresh room: navigates to /play, which creates a room and
// redirects to it (the shared lobby -- see web/modules/play). A guest
// joining an existing room already knows its URL (e.g. copied from the
// host) and must navigate straight there with `page.goto` instead --
// routing it through here too would re-trigger room *creation* on a
// plain, untagged request and land it in the wrong (new, empty) room
// instead of the host's.
export async function joinLobby(page: Page, name: string) {
  await page.goto("/play");
  await expect(page).toHaveURL(/\/play\/abc123(-[\w-]+)?$/, {
    timeout: 15000,
  });
  await submitName(page, name);
}

export async function submitName(page: Page, name: string) {
  await expect(
    page.getByRole("heading", { name: "Enter your name" }),
  ).toBeVisible();
  await page.getByRole("searchbox", { name: "Your name" }).fill(name);
  await page.getByRole("button", { name: "Join" }).click();
  await expect(
    page.getByRole("heading", { name: "Enter your name" }),
  ).toBeHidden();
}

// The map's countries are fetched/rendered asynchronously (see
// CountryMap.vue) and can still be loading once gameplay's other UI is
// already interactive -- taking a Chromatic snapshot before the map's
// first real frame lands captures a blank/black canvas instead of the
// countries. CountryMap.vue flips data-map-loaded once that first frame
// has rendered. A longer-than-default timeout: multiplayer renders two
// of these concurrently (host + guest pages), which measurably slows
// down how long the first frame takes versus solo's single map.
export async function waitForMapLoaded(page: Page) {
  await expect(page.locator('[data-map-loaded="true"]')).toBeVisible({
    timeout: 15000,
  });
}

// Playwright's actionability check occasionally still hits a transient
// full-page pointer-event interception around this page's dynamic
// mobile-viewport-height CSS updates (see useFixMobileViewport) --
// observed directly as "<html>...</html> intercepts pointer events"
// followed by the target getting detached before the retry lands.
// Retrying the click covers that without weakening any assertion.
export async function clickRobustly(locator: Locator) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await locator.click({ timeout: 10000 });
      return;
    } catch (error) {
      if (attempt === 3) {
        throw error;
      }
    }
  }
}

// Repeatedly skips until the countdown drops under a minute (solo's 10s
// skip penalty makes this reliably reachable). The number of skips this
// takes is deterministic under Playwright (see `soloClockIsManual` in
// game-room.ts, which stops the passive per-second tick from racing
// these clicks), but this still checks before each click rather than
// firing a fixed count, since the exact figure is an implementation
// detail of the server's clock math this test shouldn't hardcode.
export async function skipUntilTimerUnderOneMinute(
  page: Page,
  skipButton: Locator,
) {
  const timer = page.locator(".scorebar-timer");
  for (let i = 0; i < 20; i++) {
    if (
      /^\d{1,2}s\s*$/.test(((await timer.textContent()) ?? "").trim())
    ) {
      return;
    }
    try {
      await skipButton.click({ timeout: 2000 });
    } catch {
      // Ignored -- same rationale as drainRoundViaSkips below.
    }
  }
  await expect(timer).toHaveText(/^\d{1,2}s\s*$/);
}

// Repeatedly skips until the round ends. Solo's clock under Playwright
// only moves via skip/guess actions (see `soloClockIsManual` in
// game-room.ts), so the number of skips this takes is deterministic --
// still checked before each click rather than fired as a fixed count,
// since that exact figure is an implementation detail of the server's
// clock math this test shouldn't hardcode. Bounded so a genuine bug
// can't spin forever.
export async function drainRoundViaSkips(
  skipButton: Locator,
  gameOverHeading: Locator,
) {
  for (let i = 0; i < 40; i++) {
    if (await gameOverHeading.isVisible()) {
      return;
    }
    try {
      // The skip button can vanish for good between the check above and
      // this click landing (the round ends and the game-over screen
      // takes over) -- a bounded timeout here means that race fails
      // fast into the next loop iteration instead of hanging on a
      // button that will never reappear, up to the whole test's
      // timeout.
      await skipButton.click({ timeout: 2000 });
    } catch {
      // Ignored -- the next iteration's isVisible() check above decides
      // whether that was the round ending or a genuine, retryable miss.
    }
  }
  await expect(gameOverHeading).toBeVisible({ timeout: 10000 });
}
