<template>
  <div class="countryguesser">
    <HeaderBar title="Country Guesser" back-href="/" floating>
      <ScoreBar
        v-if="store.phase === 'playing'"
        :seconds-left="store.timeLeft"
        :score="store.me?.score ?? 0"
        :guessed-count="store.guessedCodes.length"
        :total-count="totalCount"
      />
    </HeaderBar>

    <main class="countryguesser-main">
      <div v-if="!started" class="countryguesser-hub">
        <AttractMap />
        <h1 class="countryguesser-hub-heading">Country Guesser</h1>
        <p class="countryguesser-hub-desc">
          A country will be highlighted on the map — type its name
          before the clock runs out. Stuck? Letters get revealed over
          time, and you can skip (with a small penalty)
        </p>
        <div class="countryguesser-hub-actions">
          <LinkButton
            text="Play Solo"
            large
            :disabled="started"
            @click="playSolo"
          >
            <Icon name="bx:play" />
          </LinkButton>
          <LinkButton
            text="Create Room"
            large
            :disabled="creatingRoom"
            @click="createRoom"
          >
            <Icon name="bx:group" />
          </LinkButton>
          <LinkButton
            text="Leaderboard"
            large
            @click="showLeaderboard = true"
          >
            <Icon name="bx:trophy" />
          </LinkButton>
        </div>
        <p class="countryguesser-hub-attribution">
          Map data from
          <a
            href="https://commons.wikimedia.org/wiki/File:BlankMap-World-Compact.svg"
            target="_blank"
            rel="noopener noreferrer"
            >Wikimedia Commons</a
          >, released into the public domain by Canuckguy et al.
        </p>
      </div>

      <div v-else class="countryguesser-play">
        <div
          v-if="store.phase === 'round_end'"
          class="countryguesser-gameover-top"
        >
          <h2 class="countryguesser-gameover-heading">Game Over</h2>
          <p class="countryguesser-gameover-score">
            <span class="highlight">{{ store.me?.score ?? 0 }}</span>
            points
          </p>
          <p class="countryguesser-gameover-progress">
            {{ store.guessedCodes.length }} out of
            {{ totalCount }} countries guessed in
            {{ formattedElapsedTime }}
          </p>
          <p class="countryguesser-gameover-stats">
            {{ store.me?.skips ?? 0 }} skipped &middot; +{{
              (store.me?.correctGuesses ?? 0) * TIME_BONUS_SECONDS
            }}s from correct guesses
          </p>

          <p
            v-if="store.scoreSubmitted"
            class="countryguesser-submitscore-confirm"
          >
            Score submitted!
          </p>
          <form
            v-else
            class="countryguesser-submitscore"
            @submit.prevent="submitScore"
          >
            <TextField
              v-model="scoreNameValue"
              small
              maxlength="24"
              placeholder="Your name..."
              aria-label="Your name"
              :autofill="false"
            />
            <LinkButton
              type="submit"
              small
              text="Submit score"
              :disabled="!canSubmitScoreName"
            >
              <Icon name="bx:send" />
            </LinkButton>
          </form>
          <p
            v-if="store.scoreSubmitError"
            class="countryguesser-submitscore-error"
          >
            {{ store.scoreSubmitError }}
          </p>
        </div>

        <p
          v-if="store.phase === 'waiting'"
          class="countryguesser-connecting"
        >
          Connecting&hellip;
        </p>
        <CountryMap
          v-else
          :target-code="store.currentCode"
          :guessed-codes="store.guessedCodes"
          :complete="store.phase === 'round_end'"
        />

        <GuessInput
          v-if="store.phase === 'playing'"
          ref="guessInputRef"
          :hint="store.hint"
          @submit="handleGuess"
          @skip="store.submitSkip()"
        />
        <div
          v-else-if="store.phase === 'round_end'"
          class="countryguesser-gameover-bottom"
        >
          <LinkButton text="Play Again" large @click="playAgain">
            <Icon name="bx:refresh" />
          </LinkButton>
          <LinkButton
            text="Leaderboard"
            large
            @click="showLeaderboard = true"
          >
            <Icon name="bx:trophy" />
          </LinkButton>
        </div>
      </div>
    </main>

    <LeaderboardModal
      v-if="showLeaderboard"
      @close="showLeaderboard = false"
    />
  </div>
</template>

<script setup lang="ts">
import { COUNTRIES } from "../../data/countries";

definePageMeta({ ssr: false });

useSeoMeta({
  title: "Country Guesser - Mark Metcalfe",
  ogTitle: "Country Guesser - Mark Metcalfe",
  description:
    "A singleplayer and multiplayer country name guessing game",
  ogDescription:
    "A singleplayer and multiplayer country name guessing game",
  ogImage: "https://markmetcalfe.com/countries/social-card.jpg?v=1",
});

useHideDynamicBackground();

useFixMobileViewport();

const TIME_BONUS_SECONDS = 10;
const totalCount = COUNTRIES.length;

const config = useRuntimeConfig();
const store = useCountryGuesserRoomStore();
const { recordScore } = useCountryGuesserHighScore();
const { playCorrect, playIncorrect, playRoundEnd } =
  useCountryGuesserSound(
    computed(() => store.timeLeft),
    computed(() => store.phase === "playing"),
  );

const guessInputRef = ref<{ flashIncorrect: () => void }>();
const started = ref(false);
const creatingRoom = ref(false);
const showLeaderboard = ref(false);
const scoreNameValue = ref("");
const playStartedAt = ref(0);
const elapsedSeconds = ref(0);

const canSubmitScoreName = computed(
  () =>
    scoreNameValue.value.trim().length > 0 &&
    scoreNameValue.value.trim().length <= 20,
);

const formattedElapsedTime = computed(() => {
  const minutes = Math.floor(elapsedSeconds.value / 60);
  const seconds = elapsedSeconds.value % 60;
  const secondsLabel = `${seconds} second${seconds === 1 ? "" : "s"}`;
  if (minutes === 0) {
    return secondsLabel;
  }
  const minutesLabel = `${minutes} minute${minutes === 1 ? "" : "s"}`;
  return `${minutesLabel}, ${secondsLabel}`;
});

async function playSolo() {
  if (started.value) {
    return;
  }
  started.value = true;
  const res = await fetch("/api/countries/rooms", { method: "POST" });
  const { roomId } = (await res.json()) as { roomId: string };
  store.connect(roomId, config.public.countryGuesserApiUrl as string);
  // Solo has no lobby (no name prompt to wait on) and no name is ever
  // shown, so join as solo instead of supplying/validating a name.
  void store.join("", true).catch(() => {});
}

function playAgain() {
  store.startGame(120, true);
}

async function createRoom() {
  creatingRoom.value = true;
  try {
    const res = await fetch("/api/countries/rooms", {
      method: "POST",
    });
    const { roomId } = (await res.json()) as { roomId: string };
    await navigateTo(`/countries/${roomId}`);
  } finally {
    creatingRoom.value = false;
  }
}

function handleGuess(text: string) {
  store.submitGuess(text);
}

function submitScore() {
  const name = scoreNameValue.value.trim();
  if (!name || name.length > 20) {
    return;
  }
  store.submitScore(name);
  localStorage.setItem("countryGuesserName", name);
}

watch(
  () => store.me,
  me => {
    if (
      started.value &&
      me &&
      store.phase === "waiting" &&
      !store.scoreSubmitted
    ) {
      store.startGame(120, true);
    }
  },
);

watch(
  () => store.lastGuessCorrect,
  correct => {
    if (correct === true) {
      playCorrect();
    } else if (correct === false) {
      playIncorrect();
      guessInputRef.value?.flashIncorrect();
    }
  },
);

watch(
  () => store.phase,
  (phase, previousPhase) => {
    if (phase === "playing" && previousPhase !== "playing") {
      playStartedAt.value = Date.now();
    }
    if (phase === "round_end") {
      elapsedSeconds.value = Math.round(
        (Date.now() - playStartedAt.value) / 1000,
      );
      recordScore(store.me?.score ?? 0);
      scoreNameValue.value =
        localStorage.getItem("countryGuesserName") ?? "";
      playRoundEnd();
    }
  },
);

onUnmounted(() => {
  store.disconnect();
});
</script>

<style lang="scss">
@use "/variables" as vars;

.countryguesser {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--cg-viewport-height, 100dvh);
  display: grid;
  grid-template: "header" auto "main" 1fr / 1fr;
  background: var(--color-dark);
  z-index: 20;

  & > .headerbar {
    grid-area: header;

    .scorebar {
      flex: 1;
    }
  }

  &-main {
    grid-area: main;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  &-hub {
    position: relative;
    z-index: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
    padding: 5rem 1.5rem 2rem;
    text-align: center;

    &-heading {
      font-size: 1.8rem;
      font-weight: 400;
    }

    &-desc {
      max-width: 480px;
      color: var(--color-light);
    }

    &-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    &-attribution {
      font-size: 0.75rem;
      color: var(--color-light);

      a {
        color: inherit;
      }
    }
  }

  &-play {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding-top: 3rem;
  }

  &-connecting {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-light);
  }

  &-submitscore {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding-top: 0.5rem;

    .textfield {
      max-width: 150px;
    }

    &-confirm {
      margin: 0;
      color: var(--color-highlight);
      font-size: 0.9rem;
    }

    &-error {
      margin: 0;
      color: var(--color-error);
      font-size: 0.85rem;
      text-align: center;
    }
  }

  &-gameover {
    &-top {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1rem 1rem;
      text-align: center;
      flex-shrink: 0;
    }

    &-heading,
    &-score,
    &-progress,
    &-stats {
      margin: 0;
    }

    &-heading {
      font-size: 2rem;
      font-weight: 400;
    }

    &-score {
      font-size: 1.2rem;
    }

    &-progress,
    &-stats {
      font-size: 0.9rem;
      color: var(--color-light);
    }

    &-bottom {
      display: flex;
      gap: 1rem;
      justify-content: center;
      padding: 1rem 1rem 1.5rem;
      flex-shrink: 0;
    }
  }
}
</style>
