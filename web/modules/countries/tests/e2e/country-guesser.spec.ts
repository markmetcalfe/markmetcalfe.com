import {
  test,
  expect,
  takeSnapshot,
} from "@chromatic-com/playwright";
import type { Page } from "@playwright/test";

async function joinLobby(page: Page, name: string) {
  await page.goto("/countries");
  await expect(page).toHaveURL(/\/countries\/abc123(-[\w]+)?$/, {
    timeout: 15000,
  });
  await expect(
    page.getByRole("heading", { name: "Enter your name" }),
  ).toBeVisible();
  await page.getByRole("searchbox", { name: "Your name" }).fill(name);
  await page.getByRole("button", { name: "Join Room" }).click();
  await expect(
    page.getByRole("heading", { name: "Enter your name" }),
  ).toBeHidden();
}

test.describe("CountryGuesserLobby", () => {
  test.describe.configure({ mode: "serial" });

  test("creates a room from the hub and shows the lobby", async ({
    page,
  }, testInfo) => {
    await joinLobby(page, "Alex");

    await expect(
      page.getByRole("heading", { name: "Country Guesser" }),
    ).toBeVisible();
    await expect(
      page.getByText("Invite Others To Play:"),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Enter your name" }),
    ).toBeVisible();

    await takeSnapshot(page, "Country Guesser Lobby", testInfo);
  });

  test("shows the header, heading and description", async ({
    page,
  }) => {
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
  });

  test("shows the solo game and leaderboard buttons", async ({
    page,
  }) => {
    await joinLobby(page, "Alex");

    await expect(
      page.getByRole("button", { name: "Start Solo Game" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Leaderboard" }),
    ).toBeVisible();
  });

  test("shows an invite link and copies it to the clipboard", async ({
    page,
    context,
  }) => {
    await context.grantPermissions([
      "clipboard-read",
      "clipboard-write",
    ]);
    await joinLobby(page, "Alex");

    await expect(
      page.getByText("Invite Others To Play:"),
    ).toBeVisible();
    await expect(page.locator(".roomlobby-invite-url")).toContainText(
      "/countries/",
    );

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
  });

  test("opens the leaderboard, lists scores highest to lowest, shows the player's best and closes", async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem("countryGuesserHighScore", "555"),
    );

    await joinLobby(page, "Alex");
    await page.getByRole("button", { name: "Leaderboard" }).click();

    await expect(
      page.getByRole("heading", { name: "Leaderboard" }),
    ).toBeVisible();

    await expect(
      page.locator(".leaderboardmodal-personal"),
    ).toHaveText("Your best: 555");

    await page.getByRole("button", { name: "Close" }).click();
    await expect(
      page.getByRole("heading", { name: "Leaderboard" }),
    ).toBeHidden();
  });

  test("starts a solo game once joined", async ({ page }) => {
    await joinLobby(page, "Alex");

    await page
      .getByRole("button", { name: "Start Solo Game" })
      .click();

    await expect(
      page.getByRole("searchbox", { name: "Guess" }),
    ).toBeVisible();
  });

  test("updates the host's lobby once a second player joins, and shows the guest a waiting screen", async ({
    page,
    browser,
  }) => {
    await joinLobby(page, "Alex");
    await expect(
      page.getByRole("button", { name: "Start Solo Game" }),
    ).toBeVisible();

    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    await guestPage.goto(page.url());
    await joinLobby(guestPage, "Sam");

    await expect(
      page.getByRole("button", { name: "Start Solo Game" }),
    ).toBeHidden();
    await expect(page.getByText("Alex")).toBeVisible();
    await expect(page.getByText("Sam")).toBeVisible();
    await expect(
      page.getByText("host", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("slider", { name: "Game length (min)" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Start Game" }),
    ).toBeVisible();

    await expect(
      guestPage.getByRole("button", { name: "Start Solo Game" }),
    ).toBeHidden();
    await expect(
      guestPage.getByRole("button", { name: "Start Game" }),
    ).toBeHidden();
    await expect(
      guestPage.getByText("Waiting for the host to start…"),
    ).toBeVisible();

    await guestContext.close();
  });
});
