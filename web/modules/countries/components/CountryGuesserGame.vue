<template>
  <div class="countryguesser">
    <HeaderBar
      title="Country Guesser"
      back-label="Back to Lobby"
      :on-back="handleBack"
      :hide-title-on-mobile="store.phase === 'playing'"
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
      <!-- Only ever seen for a moment while the host's own auto-start
           (below) round-trips -- seed() has already registered us as
           players, the round just hasn't officially begun yet. -->
      <div v-if="store.phase === 'waiting'" />

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

    <LeaderboardModal
      v-if="showLeaderboard"
      @close="showLeaderboard = false"
    />
  </div>
</template>

<script setup lang="ts">
import { COUNTRIES } from "../data/countries";
import { getPersistentPlayerName } from "../stores/countryGuesserRoom";

const totalCount = COUNTRIES.length;

const route = useRoute();
const config = useRuntimeConfig();
const store = useCountryGuesserRoomStore();
const playLobby = usePlayLobbyStore();
const { playCorrect, playIncorrect, playRoundEnd, playNextTarget } =
  useCountryGuesserSound();

// Only the host's "back" sends everyone back to the lobby -- anyone
// else pressing it just leaves for themselves, landing back on /play's
// fresh room rather than lingering in someone else's in-progress game.
function handleBack() {
  if (playLobby.isHost) {
    playLobby.returnToLobby();
  } else {
    void navigateTo("/play");
  }
}

const roomId = computed(() => route.params.room as string);
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

// seed() (see api/countries/src/game-room.ts) pre-registered the lobby's
// host here, so our own reconnect-by-id join lands as host immediately
// -- well before a guest's fresh join to this same room necessarily has
// (that's a genuinely separate browser establishing a brand new
// connection, not a reconnect). Starting the instant we're confirmed as
// host would race that and hit the server's own "need at least 2
// players" rejection, so this also waits for however many players the
// lobby actually had at hand-off (unless it was solo to begin with) to
// show up in *this* room's own roster first.
// Also fires from "round_end" -- returning to the lobby after a solo
// game and starting again reconnects into this same, still-finished
// GameRoom DO (seed() only ever touches a genuinely empty room), so
// this has to restart it exactly like GameOverScreen's "Play Again"
// does rather than only handling a room's very first start.
const soloStart = playLobby.players.length < 2;
watch(
  [() => store.isHost, () => store.players.length],
  ([isHost, playerCount]) => {
    if (
      isHost &&
      (store.phase === "waiting" || store.phase === "round_end") &&
      (soloStart || playerCount >= 2)
    ) {
      store.startGame(
        playLobby.roundLength,
        soloStart,
        playLobby.countryOrder,
      );
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

// Only a genuine live round ending should chime -- reconnecting
// straight into an already-finished room (e.g. restarting a solo game
// from the lobby remounts this component, whose fresh "state" sync
// briefly reports "round_end" before the auto-restart above kicks in)
// isn't a round actually ending, so that transition is excluded.
watch(
  () => store.phase,
  (phase, previousPhase) => {
    if (phase === "round_end" && previousPhase === "playing") {
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

// A solo room only ever has room for the one player it was seeded for
// (see the "join" handler in api/countries/src/game-room.ts) -- anyone
// else who lands here (e.g. guessing/finding the room code) never
// registers as a real player, so there's nothing for them to do here.
watch(
  () => store.joinRejected,
  rejected => {
    if (rejected) {
      void navigateTo("/play");
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
