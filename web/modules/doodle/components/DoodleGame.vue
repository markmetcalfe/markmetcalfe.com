<template>
  <div class="doodleroom">
    <HeaderBar title="Doodle" back-href="/" back-label="Leave game">
      <span
        v-if="
          store.totalRounds > 0 &&
          !['game_end', 'waiting'].includes(store.phase)
        "
        class="doodleroom-header-round"
      >
        Round {{ store.roundNumber }}/{{ store.totalRounds }}
      </span>

      <span
        v-if="store.phase === 'drawing'"
        class="doodleroom-header-hint"
      >
        {{ store.amIDrawing ? store.myWord : store.formattedHint }}
      </span>

      <span
        v-if="store.phase === 'drawing'"
        :class="['doodleroom-header-timer', timerClass]"
      >
        {{ store.timeLeft }}s
      </span>
    </HeaderBar>

    <!-- Main canvas area -->
    <main class="doodleroom-main">
      <!-- Only ever seen for a moment while the host's own auto-start
           (below) round-trips -- seed() has already registered us as
           players, the round just hasn't officially begun yet. -->
      <template v-if="store.phase !== 'waiting'">
        <div class="doodleroom-canvas-wrap">
          <DoodleCanvas />

          <RoundResult v-if="store.phase === 'round_end'" />
          <GameResult v-if="store.phase === 'game_end'" />
        </div>
      </template>
    </main>

    <!-- Sidebar: players + chat -->
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

const roomId = computed(() => route.params.room as string);

const timerClass = computed(() => {
  if (store.timeLeft > 30) {
    return "doodleroom-header-timer-ok";
  }
  if (store.timeLeft > 10) {
    return "doodleroom-header-timer-warn";
  }
  return "doodleroom-header-timer-danger";
});

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
  grid-template: "header header" auto "main   sidebar" 1fr / 1fr 260px;
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

  // The shared HeaderBar hides its title on mobile everywhere else (see
  // HeaderBar.vue) since most pages just show the back button there --
  // Doodle needs it back, because the word/hint can be too long for a
  // single mobile-width line alongside round/timer, and needs its own
  // second line instead of clipping the page.
  .headerbar {
    @include vars.mobile-only {
      flex-wrap: wrap;
    }
  }

  .headerbar-title {
    @include vars.mobile-only {
      display: inline;
    }
  }

  &-header {
    &-round {
      font-size: 0.85rem;
      color: var(--color-light);
      flex-shrink: 0;
    }

    &-hint {
      flex: 1;
      text-align: center;
      font-size: 1.3rem;
      font-weight: 700;
      font-family: monospace;
      letter-spacing: 3px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      // Pushed onto its own second line, after round/timer (which stay
      // at the default order) rather than between them.
      @include vars.mobile-only {
        order: 10;
        flex-basis: 100%;
      }
    }

    &-timer {
      font-size: 1.1rem;
      font-weight: 700;
      min-width: 42px;
      text-align: right;
      flex-shrink: 0;

      &-ok {
        color: var(--color-light);
      }

      &-warn {
        color: #ffb300;
      }

      &-danger {
        color: var(--color-error);
      }
    }
  }

  &-main {
    grid-area: main;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  &-canvas-wrap {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &-sidebar {
    grid-area: sidebar;
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--color-light);
    overflow: hidden;

    @include vars.mobile-only {
      display: contents;
    }
  }
}
</style>
