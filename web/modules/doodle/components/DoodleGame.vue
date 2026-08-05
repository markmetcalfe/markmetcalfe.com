<template>
  <div class="doodleroom">
    <HeaderBar
      title="Doodle"
      back-label="Back to Lobby"
      :on-back="handleBack"
    >
      <span
        v-if="
          store.totalRounds > 0 &&
          !['game_end', 'waiting'].includes(store.phase)
        "
        class="doodleroom-header-round"
      >
        Round {{ store.roundNumber }}/{{ store.totalRounds }}
      </span>
    </HeaderBar>

    <main class="doodleroom-main">
      <template v-if="store.phase !== 'waiting'">
        <div class="doodleroom-canvas-col">
          <div class="doodleroom-canvas-wrap">
            <div
              v-if="store.phase === 'drawing'"
              class="doodleroom-word-row"
            >
              <span class="doodleroom-word">{{
                store.amIDrawing ? store.myWord : store.formattedHint
              }}</span>
              <CountdownTimer
                :seconds-left="store.timeLeft"
                class="doodleroom-word-timer"
              />
            </div>

            <DoodleCanvas />

            <RoundResult v-if="store.phase === 'round_end'" />
            <GameResult v-if="store.phase === 'game_end'" />
          </div>
        </div>
      </template>
    </main>

    <aside class="doodleroom-sidebar">
      <PlayerList />
      <DoodleChat />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { getPersistentPlayerName } from "@play/composables/usePersistentPlayer";

const route = useRoute();
const config = useRuntimeConfig();
const store = useDoodleStore();
const playLobby = usePlayLobbyStore();

useDoodleSound();

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

// seed() (see api/doodle/src/game-room.ts) pre-registered the lobby's
// host here (with any words submitted in the lobby already merged in),
// so our own reconnect-by-id join lands as host immediately -- well
// before a guest's fresh join to this same room necessarily has (that's
// a genuinely separate browser establishing a brand new connection, not
// a reconnect). Starting the instant we're confirmed as host would race
// that and hit the server's own "need at least 2 players" rejection, so
// this also waits for a second player to show up in *this* room's own
// roster first.
watch(
  [() => store.isHost, () => store.players.length],
  ([isHost, playerCount]) => {
    if (isHost && store.phase === "waiting" && playerCount >= 2) {
      store.roundLength = playLobby.roundLength;
      store.startGame();
    }
  },
);

onMounted(() => {
  const rememberedName = getPersistentPlayerName();
  if (rememberedName) {
    store.myName = rememberedName;
  }
  store.connect(roomId.value, config.public.doodleApiUrl as string);
});

onUnmounted(() => {
  store.disconnect();
});
</script>

<style lang="scss">
@use "/variables" as vars;

.doodleroom {
  position: fixed;
  inset: 0;
  display: grid;

  // The sidebar spans both rows in its own column (rather than sharing
  // a row with the header), so it runs the full viewport height instead
  // of stopping below the header like "main" does.
  grid-template: "header sidebar" auto "main   sidebar" 1fr / 1fr 260px;
  background: var(--color-dark);
  z-index: 20;

  @include vars.mobile-only {
    grid-template:
      "header" auto
      "players" auto
      "main" auto
      "chat" 1fr
      / 1fr;
  }

  .headerbar {
    border-bottom: none;
    position: relative;
  }

  &-header {
    &-round {
      font-size: 0.85rem;
      color: var(--color-light);

      // flex: 1; text-align: center would only centre this in whatever
      // space is left over after the back button and title -- not the
      // header as a whole, so it visibly drifts off-centre depending on
      // the title's width. Absolutely positioning it against the
      // header (position: relative above) centres it for real,
      // independent of its siblings' widths.
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      white-space: nowrap;
    }
  }

  &-main {
    grid-area: main;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  &-canvas-col {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;

    // Shrink-wraps to the canvas's own natural width (the widest
    // content among its children) instead of stretching to fill the
    // main area, so the word-row's width -- and so the timer's right
    // edge -- lines up with the canvas rather than the wider container.
    @include vars.desktop-only {
      width: fit-content;
      max-width: 100%;
      margin: 0 auto;
    }
  }

  &-word-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
    padding: 0.5rem;

    @include vars.mobile-only {
      padding-bottom: 1rem;
    }

    @include vars.desktop-only {
      padding-bottom: 0.25rem;

      // Lets the word below be centred against this row as a whole
      // (see position: absolute on .doodleroom-word) rather than just
      // whatever space the timer's width happens to leave it.
      position: relative;
    }
  }

  &-word {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    flex: 1;
    text-align: center;
    font-size: 1.3rem;
    font-weight: 700;
    font-family: monospace;
    letter-spacing: 3px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @include vars.desktop-only {
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }

  &-word-timer {
    flex-shrink: 0;
    padding: 0.3rem 0.6rem;
    margin-left: auto;

    // CountdownTimer.vue's own .countdowntimer sets font-size: 1.1rem --
    // the compound selector's extra specificity guarantees this wins
    // regardless of the two components' stylesheet order, to match the
    // word above it instead.
    &.countdowntimer {
      font-size: 1.3rem;
    }

    @include vars.mobile-only {
      padding-right: 0.75rem;
    }
  }

  &-canvas-wrap {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    @include vars.desktop-only {
      justify-content: center;
    }
  }

  &-sidebar {
    grid-area: sidebar;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    @include vars.mobile-only {
      display: contents;
    }
  }
}
</style>
