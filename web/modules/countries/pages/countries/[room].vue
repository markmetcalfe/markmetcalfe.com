<template>
  <div class="countryguesser">
    <HeaderBar
      title="Country Guesser"
      back-href="/"
      back-label="Leave game"
      floating
    >
      <ScoreBar
        v-if="store.phase === 'playing'"
        :seconds-left="store.timeLeft"
        v-bind="scoreBarProps"
        class="countryguesser-header-scores"
      />
    </HeaderBar>

    <main class="countryguesser-main">
      <WaitingRoomScreen
        v-if="store.phase === 'waiting'"
        @show-leaderboard="showLeaderboard = true"
      />

      <div v-else class="countryguesser-play">
        <GameOverScreen
          v-if="store.phase === 'round_end'"
          @show-leaderboard="showLeaderboard = true"
        />

        <CountryMap
          :target-code="store.currentCode"
          :guessed-codes="store.guessedCodes"
          :complete="store.phase === 'round_end'"
        />

        <GuessPanel ref="guessPanelRef" />
      </div>
    </main>

    <NamePromptModal
      v-if="showNamePrompt"
      @joined="showNamePrompt = false"
    />

    <LeaderboardModal
      v-if="showLeaderboard"
      @close="showLeaderboard = false"
    />
  </div>
</template>

<script setup lang="ts">
import { COUNTRIES } from "../../data/countries";
import { getPersistentPlayerName } from "../../stores/countryGuesserRoom";

definePageMeta({ ssr: false });

useSeoMeta({
  title: "Country Guesser - Mark Metcalfe",
  ogTitle: "Country Guesser - Mark Metcalfe",
  description:
    "A singleplayer and multiplayer country name guessing game",
  ogDescription:
    "A singleplayer and multiplayer country name guessing game",
  ogImage: "https://markmetcalfe.com/countries-social-card.jpg?v=1",
});

useHideDynamicBackground();

useFixMobileViewport();

const totalCount = COUNTRIES.length;

const route = useRoute();
const config = useRuntimeConfig();
const store = useCountryGuesserRoomStore();
const { playCorrect, playIncorrect, playRoundEnd, playNextTarget } =
  useCountryGuesserSound(
    computed(() => store.timeLeft),
    computed(() => store.phase === "playing"),
  );

const roomId = computed(() => route.params.room as string);
const showNamePrompt = ref(false);
const showLeaderboard = ref(false);
const guessPanelRef = ref<{ flashIncorrect: () => void }>();

const scoreBarProps = computed(() =>
  store.players.length < 2
    ? {
        score: store.me?.score ?? 0,
        guessedCount: store.guessedCodes.length,
        totalCount,
      }
    : { players: store.players, myPlayerId: store.myId },
);

// The store itself auto-rejoins on every (re)connect once `myName` is
// known (including across a brief drop or a backgrounded-tab reconnect)
// -- this only needs to handle the one case it can't: a first-time
// visitor with no remembered name yet.
watch(
  () => store.connected,
  connected => {
    if (connected && !store.myName) {
      showNamePrompt.value = true;
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
      guessPanelRef.value?.flashIncorrect();
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
  const rememberedName = getPersistentPlayerName();
  if (rememberedName) {
    store.myName = rememberedName;
  }
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
    padding-top: 3rem;
  }
}
</style>
