<template>
  <div class="countryguesser">
    <HeaderBar title="Country Guesser" back-href="/" floating>
      <ScoreBar
        v-if="store.phase === 'playing'"
        :seconds-left="store.secondsLeft"
        :score="store.score"
        :guessed-count="store.guessedCount"
        :total-count="store.totalCount"
      />
    </HeaderBar>

    <main class="countryguesser-main">
      <div v-if="store.phase === 'idle'" class="countryguesser-hub">
        <AttractMap />
        <h1 class="countryguesser-hub-heading">Country Guesser</h1>
        <p class="countryguesser-hub-desc">
          A country will be highlighted on the map — type its name
          before the clock runs out. Stuck? Letters get revealed over
          time, and you can skip (with a small penalty)
        </p>
        <div class="countryguesser-hub-actions">
          <LinkButton text="Play Solo" large @click="store.start()">
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
          v-if="store.phase === 'ended'"
          class="countryguesser-gameover-top"
        >
          <h2 class="countryguesser-gameover-heading">Game Over</h2>
          <p class="countryguesser-gameover-score">
            <span class="highlight">{{ store.score }}</span> points
          </p>
          <p class="countryguesser-gameover-progress">
            {{ store.guessedCount }} out of
            {{ store.totalCount }} countries guessed in
            {{ formattedElapsedTime }}
          </p>
          <p class="countryguesser-gameover-stats">
            {{ store.skipCount }} skipped &middot; +{{
              store.timeBonusSeconds
            }}s from correct guesses
          </p>
        </div>

        <CountryMap
          :target-code="store.currentCode"
          :guessed-codes="store.guessedCodes"
          :complete="store.phase === 'ended'"
        />

        <GuessInput
          v-if="store.phase === 'playing'"
          ref="guessInputRef"
          :hint="store.hint"
          @submit="handleGuess"
          @skip="store.skip()"
        />
        <div
          v-else-if="store.phase === 'ended'"
          class="countryguesser-gameover-bottom"
        >
          <LinkButton text="Play Again" large @click="store.start()">
            <Icon name="bx:refresh" />
          </LinkButton>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
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

const store = useCountryGuesserStore();
const { playCorrect, playIncorrect, playRoundEnd } =
  useCountryGuesserSound(
    computed(() => store.secondsLeft),
    computed(() => store.phase === "playing"),
  );
const guessInputRef = ref<{ flashIncorrect: () => void }>();
const creatingRoom = ref(false);

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

function handleGuess(text: string) {
  const correct = store.submitGuess(text);
  if (correct) {
    playCorrect();
  } else {
    playIncorrect();
    guessInputRef.value?.flashIncorrect();
  }
}

watch(
  () => store.phase,
  phase => {
    if (phase === "ended") {
      playRoundEnd();
    }
  },
);

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

onUnmounted(() => {
  store.stop();
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
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
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
      justify-content: center;
      padding: 1rem 1rem 1.5rem;
      flex-shrink: 0;
    }
  }
}
</style>
