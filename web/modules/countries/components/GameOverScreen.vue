<template>
  <div class="gameoverscreen">
    <div
      class="gameoverscreen-top"
      :class="{
        'gameoverscreen-solo': !isMultiplayer,
        'gameoverscreen-multiplayer': isMultiplayer,
      }"
    >
      <h2 class="gameoverscreen-heading">Game Over</h2>
      <template v-if="!isMultiplayer">
        <p class="gameoverscreen-solo-score">
          <span class="highlight">{{ store.me?.score ?? 0 }}</span>
          points
        </p>
        <p class="gameoverscreen-solo-progress">
          {{ store.guessedCodes.length }} out of
          {{ totalCount }} countries guessed in
          {{ formattedElapsedTime }}
        </p>
        <p class="gameoverscreen-solo-stats">
          {{ store.me?.skips ?? 0 }} skipped &middot; +{{
            (store.me?.correctGuesses ?? 0) * TIME_BONUS_SECONDS
          }}s from correct guesses
        </p>
      </template>
      <template v-else>
        <p v-if="winner" class="gameoverscreen-winner">
          <span class="highlight">{{ winner.name }}</span> wins!
        </p>
        <ul class="gameoverscreen-scores">
          <li
            v-for="(player, i) in sortedPlayers"
            :key="player.id"
            class="gameoverscreen-score"
            :class="{ 'gameoverscreen-score-top': i === 0 }"
          >
            <span class="gameoverscreen-score-info">
              <span class="gameoverscreen-score-name">{{
                player.name
              }}</span>
              <span class="gameoverscreen-score-stats">
                {{ player.correctGuesses }} guessed,
                {{ player.skips }} skipped
              </span>
            </span>
            <span class="gameoverscreen-score-pts">{{
              player.score
            }}</span>
          </li>
        </ul>
      </template>
    </div>

    <div class="gameoverscreen-buttons">
      <LinkButton
        v-if="!isMultiplayer"
        text="Play Again"
        @click="playAgain"
      >
        <Icon name="bx:refresh" />
      </LinkButton>
      <LinkButton
        v-if="store.isHost"
        text="Back to Lobby"
        @click="store.returnToLobby()"
      >
        <Icon name="bx:arrow-back" />
      </LinkButton>
      <LinkButton
        v-if="!isMultiplayer"
        :disabled="store.scoreSubmitted"
        :text="
          store.scoreSubmitted ? 'Score Submitted!' : 'Submit Score'
        "
        @click="store.submitScore()"
      >
        <Icon name="bx:send" />
      </LinkButton>
      <LinkButton
        v-if="!isMultiplayer"
        text="Leaderboard"
        @click="emit('show-leaderboard')"
      >
        <Icon name="bx:trophy" />
      </LinkButton>
      <p v-if="!store.isHost" class="gameoverscreen-waiting">
        Waiting for the host to return to the lobby&hellip;
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { COUNTRIES } from "../data/countries";

const emit = defineEmits<{ "show-leaderboard": [] }>();

const TIME_BONUS_SECONDS = 10;
const totalCount = COUNTRIES.length;

const store = useCountryGuesserRoomStore();
const { recordScore } = useCountryGuesserHighScore();

const sortedPlayers = computed(() =>
  [...store.players].sort((a, b) => b.score - a.score),
);
const winner = computed(() => sortedPlayers.value[0]);

// `store.soloMode` reflects how the round was *started*, which can go
// stale -- e.g. a player joins mid-round after the host started solo,
// and their socket's initial "state" sync still says "solo". The
// current player count is always accurate, so this screen keys off
// that instead.
const isMultiplayer = computed(() => store.players.length > 1);

// Server-computed (see api/countries/src/game-room.ts) so this is
// correct even for a client that reconnects straight into "round_end"
// without ever having been present for the live round.
const formattedElapsedTime = computed(() => {
  const minutes = Math.floor(store.elapsedSeconds / 60);
  const seconds = store.elapsedSeconds % 60;
  const secondsLabel = `${seconds} second${seconds === 1 ? "" : "s"}`;
  if (minutes === 0) {
    return secondsLabel;
  }
  const minutesLabel = `${minutes} minute${minutes === 1 ? "" : "s"}`;
  return `${minutesLabel}, ${secondsLabel}`;
});

function playAgain() {
  store.startGame(store.roundLength, store.players.length < 2);
}

// This component only exists while phase === "round_end" (mounted fresh
// each time a round ends), so onMounted firing once is exactly the
// "record this round's final score once" semantics needed here.
onMounted(() => {
  if (!isMultiplayer.value) {
    recordScore(store.me?.score ?? 0);
  }
});
</script>

<style lang="scss">
.gameoverscreen {
  &-top {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem 1rem;
    text-align: center;
    flex-shrink: 0;
  }

  &-solo {
    padding-bottom: 0;
  }

  &-heading,
  &-winner,
  &-solo-score,
  &-solo-progress,
  &-solo-stats {
    margin: 0;
  }

  &-heading {
    font-size: 2rem;
    font-weight: 400;
  }

  &-winner {
    font-size: 1.1rem;
  }

  &-solo-score {
    font-size: 1.2rem;
  }

  &-solo-progress,
  &-solo-stats {
    font-size: 0.9rem;
    color: var(--color-light);
  }

  &-scores {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    width: 100%;
    max-width: 280px;
    max-height: 30vh;
    overflow-y: auto;
    margin: 0.25rem 0 0;
    padding: 0;
  }

  &-score {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    border: 1px solid var(--color-light);
    padding: 0.3rem 0.65rem;
    font-size: 0.9rem;

    &-top {
      border-color: var(--color-highlight);
    }

    &-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      min-width: 0;
    }

    &-name {
      font-weight: 500;
    }

    &-stats {
      font-size: 0.75rem;
      color: var(--color-light);
    }

    &-pts {
      flex-shrink: 0;
      color: var(--color-highlight);
      font-weight: 600;
    }
  }

  &-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    padding: 1rem 1rem 1.5rem;
    flex-shrink: 0;
  }

  &-waiting {
    font-size: 0.9rem;
    color: var(--color-light);
  }
}
</style>
