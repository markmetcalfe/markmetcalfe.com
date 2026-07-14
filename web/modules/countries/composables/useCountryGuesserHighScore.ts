const STORAGE_KEY = "countryGuesserHighScore";

// Purely a personal convenience display -- unlike the leaderboard, this
// is never sent to the server and trivially editable by the player
// themselves, so it carries no anti-cheat guarantee.
export function useCountryGuesserHighScore() {
  const highScore = ref(0);
  if (import.meta.client) {
    highScore.value = Number(localStorage.getItem(STORAGE_KEY)) || 0;
  }

  function recordScore(score: number) {
    if (score > highScore.value) {
      highScore.value = score;
      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY, String(score));
      }
    }
  }

  return { highScore, recordScore };
}
