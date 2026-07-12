<template>
  <div class="countryguesserroom">
    <HeaderBar
      title="Country Guesser"
      back-href="/"
      back-label="Leave game"
    >
      <ScoreBar
        v-if="store.phase === 'playing'"
        :seconds-left="store.timeLeft"
        :players="store.players"
        :my-player-id="store.myId"
        class="countryguesserroom-header-scores"
      />
    </HeaderBar>

    <main class="countryguesserroom-main">
      <RoomLobby v-if="store.phase === 'waiting'" />

      <div v-else class="countryguesserroom-play">
        <div
          v-if="store.phase === 'round_end'"
          class="countryguesserroom-gameover-top"
        >
          <h2 class="countryguesserroom-gameover-heading">
            Game Over
          </h2>
          <p v-if="winner" class="countryguesserroom-gameover-winner">
            <span class="highlight">{{ winner.name }}</span> wins!
          </p>
          <ul class="countryguesserroom-gameover-scores">
            <li
              v-for="(player, i) in sortedPlayers"
              :key="player.id"
              class="countryguesserroom-gameover-score"
              :class="{
                'countryguesserroom-gameover-score-top': i === 0,
              }"
            >
              <span class="countryguesserroom-gameover-score-info">
                <span
                  class="countryguesserroom-gameover-score-name"
                  >{{ player.name }}</span
                >
                <span class="countryguesserroom-gameover-score-stats">
                  {{ player.correctGuesses }} guessed,
                  {{ player.skips }} skipped
                </span>
              </span>
              <span class="countryguesserroom-gameover-score-pts">{{
                player.score
              }}</span>
            </li>
          </ul>
        </div>

        <CountryMap
          :target-code="store.currentCode"
          :guessed-codes="store.guessedCodes"
          :complete="store.phase === 'round_end'"
        />

        <GuessInput
          v-if="store.phase === 'playing' && !store.amIDone"
          ref="guessInputRef"
          :hint="store.hint"
          @submit="handleGuess"
          @skip="store.submitSkip()"
        />
        <div
          v-else-if="store.phase === 'playing' && store.amIDone"
          class="countryguesserroom-waiting"
        >
          <p class="countryguesserroom-waiting-text">
            {{
              store.lastGuessCorrect
                ? "Nice, you got it!"
                : "Skipped."
            }}
            Waiting for {{ remainingLabel }}&hellip;
          </p>
        </div>
        <div
          v-else-if="store.phase === 'round_end'"
          class="countryguesserroom-gameover-bottom"
        >
          <LinkButton
            v-if="store.isHost"
            text="Play Again"
            large
            @click="store.startGame(store.roundLength)"
          >
            <Icon name="bx:refresh" />
          </LinkButton>
          <p v-else class="countryguesserroom-gameover-waiting">
            Waiting for the host to start another round&hellip;
          </p>
        </div>
      </div>
    </main>

    <ModalDialog v-if="showNamePrompt">
      <h2>Enter your name</h2>
      <form @submit.prevent="submitName">
        <TextField
          ref="nameInput"
          v-model="nameValue"
          maxlength="24"
          placeholder="Your name..."
          autocomplete="off"
        />
        <LinkButton
          :disabled="!nameValue.trim().length"
          type="submit"
          text="Join Room"
        >
          <Icon name="bx:log-in" />
        </LinkButton>
      </form>
    </ModalDialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false });

useSeoMeta({ title: "Country Guesser - Mark Metcalfe" });

const route = useRoute();
const config = useRuntimeConfig();
const store = useCountryGuesserRoomStore();
const { playCorrect, playIncorrect, playRoundEnd, playNextTarget } =
  useCountryGuesserSound(
    computed(() => store.timeLeft),
    computed(() => store.phase === "playing"),
  );

const roomId = computed(() => route.params.roomId as string);
const showNamePrompt = ref(false);
const nameValue = ref(store.myName);
const nameInput = ref<{ focus: () => void }>();
const guessInputRef = ref<{ flashIncorrect: () => void }>();

const sortedPlayers = computed(() =>
  [...store.players].sort((a, b) => b.score - a.score),
);
const winner = computed(() => sortedPlayers.value[0]);

const remainingLabel = computed(() => {
  const remainingPlayers = store.players.filter(
    p => !store.donePlayerIds.includes(p.id),
  );
  if (remainingPlayers.length > 0 && remainingPlayers.length <= 3) {
    return remainingPlayers.map(p => p.name).join(", ");
  }
  const remaining = remainingPlayers.length;
  return remaining === 1
    ? "1 more player"
    : `${remaining} more players`;
});

watch(
  () => store.myId,
  id => {
    if (!id) {
      return;
    }
    if (store.myName) {
      store.send({ type: "join", name: store.myName });
    } else {
      showNamePrompt.value = true;
      void nextTick(() => nameInput.value?.focus());
    }
  },
);

function submitName() {
  const name = nameValue.value.trim();
  if (!name) {
    return;
  }
  showNamePrompt.value = false;
  store.join(name);
}

function handleGuess(text: string) {
  store.submitGuess(text);
}

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
  phase => {
    if (phase === "round_end") {
      playRoundEnd();
    }
  },
);

// Everyone in the room has guessed or skipped and the target has
// advanced. Skip the very first target of a round (transitioning from
// no code at all) so this only plays on actual advances.
watch(
  () => store.currentCode,
  (code, previousCode) => {
    if (previousCode && code) {
      playNextTarget();
    }
  },
);

onMounted(() => {
  store.connect(
    roomId.value,
    config.public.countryGuesserApiUrl as string,
  );
});

onUnmounted(() => {
  store.disconnect();
});
</script>

<style lang="scss">
@use "/variables" as vars;

.countryguesserroom {
  position: fixed;
  inset: 0;
  display: grid;
  grid-template: "header" auto "main" 1fr / 1fr;
  background: var(--color-dark);
  z-index: 20;

  & > .headerbar {
    grid-area: header;
    flex-wrap: wrap;
    border-bottom: none;
  }

  &-header {
    &-scores {
      flex: 1;
    }
  }

  &-main {
    grid-area: main;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  &-play {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &-waiting {
    display: flex;
    justify-content: center;
    padding: 0.75rem 1rem 1.25rem;
    flex-shrink: 0;

    &-text {
      font-size: 0.95rem;
      color: var(--color-light);
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
    &-winner {
      margin: 0;
    }

    &-heading {
      font-size: 2rem;
      font-weight: 400;
    }

    &-winner {
      font-size: 1.1rem;
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

    &-bottom {
      display: flex;
      justify-content: center;
      padding: 1rem 1rem 1.5rem;
      flex-shrink: 0;
    }

    &-waiting {
      font-size: 0.9rem;
      color: var(--color-light);
    }
  }

  .modaldialog {
    h2 {
      font-size: 1.3rem;
      font-weight: 400;
      text-align: center;
    }

    form {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
  }
}
</style>
