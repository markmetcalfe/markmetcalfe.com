<template>
  <div class="gamelobby">
    <video
      :key="displayGame"
      class="gamelobby-bg-video"
      autoplay
      muted
      loop
      playsinline
      :poster="bgPoster"
      preload="auto"
    >
      <source
        v-if="!isPlaywrightTest"
        :src="bgVideoSrc"
        type="video/webm"
      />
    </video>

    <HeaderBar title="Games" back-href="/" back-label="Leave" />

    <main class="gamelobby-main">
      <h1 class="gamelobby-title">Games</h1>

      <div class="gamelobby-picker">
        <GamePickerButton
          title="Country Guesser"
          description="Guess the highlighted country before time runs out"
          :selected="displayGame === 'countries'"
          :interactive="store.isHost"
          @click="selectGame('countries')"
        >
          <Icon name="bx:world" />
        </GamePickerButton>

        <GamePickerButton
          title="Doodle"
          description="Draw the word you're given, guess everyone else's"
          :selected="displayGame === 'doodle'"
          :interactive="store.isHost"
          @click="selectGame('doodle')"
        >
          <Icon name="bx:paint" />
        </GamePickerButton>
      </div>

      <div v-if="store.players.length > 1" class="gamelobby-players">
        <h3>Players</h3>

        <div
          class="gamelobby-players-list"
          :class="{
            'gamelobby-players-list-3col': store.players.length > 4,
          }"
        >
          <div
            v-for="player in store.players"
            :key="player.id"
            class="gamelobby-player"
          >
            <span
              class="gamelobby-player-name"
              :class="{ highlight: player.id === store.myId }"
              >{{ player.name }}</span
            >
            <span class="gamelobby-player-badges">
              <span
                v-if="player.disconnectedAt"
                class="gamelobby-player-status"
                >connection lost</span
              >
              <Icon
                v-else-if="player.isHost"
                name="bx:crown"
                class="gamelobby-player-crown"
              />
            </span>
          </div>
        </div>
      </div>

      <div class="gamelobby-invite-wrapper">
        <h3>Invite Others</h3>
        <div ref="inviteRef" class="gamelobby-invite">
          <span ref="urlRef" class="gamelobby-invite-url">{{
            displayRoomUrl
          }}</span>
          <LinkButton
            :text="copied ? 'Copied!' : 'Copy Link'"
            small
            @click="copyLink"
          >
            <Icon v-if="copied" name="bx:check" />
            <Icon v-else name="bx:copy" />
          </LinkButton>
        </div>
      </div>

      <div
        v-if="store.players.length > 1"
        class="gamelobby-settings-group"
      >
        <CountryGuesserSettings v-if="displayGame === 'countries'" />
        <DoodleSettings v-else />
      </div>

      <template v-if="store.isHost">
        <LinkButton
          large
          :disabled="!canStart"
          :text="startLabel"
          @click="store.startGame()"
        >
          <Icon name="bx:play" />
        </LinkButton>
      </template>
      <p v-else class="gamelobby-waiting">
        <em>Waiting for the host to start&hellip;</em>
      </p>

      <p v-if="store.errorMessage" class="gamelobby-error">
        {{ store.errorMessage }}
      </p>
    </main>

    <NamePromptModal
      v-if="showNamePrompt"
      :error="nameError"
      :submitting="submittingName"
      @submit="submitName"
    />
  </div>
</template>

<script setup lang="ts">
import isMobile from "is-mobile";

const store = usePlayLobbyStore();

const displayGame = computed(() => store.selectedGame);

const isPlaywrightTest = useRuntimeConfig().public.isPlaywrightTest;

const bgVideoSrc = computed(() =>
  displayGame.value === "doodle"
    ? "/doodle-demo.webm"
    : "/country-guesser-demo.webm",
);
const bgPoster = computed(() =>
  displayGame.value === "doodle"
    ? "/doodle-poster.jpg"
    : "/country-guesser-poster.jpg",
);

const showNamePrompt = ref(false);
const nameError = ref("");
const submittingName = ref(false);

const COUNTRIES_DEFAULT_ROUND_LENGTH = 300;
const DOODLE_DEFAULT_ROUND_LENGTH = 70;

const canStart = computed(
  () => displayGame.value !== "doodle" || store.players.length >= 2,
);
const startLabel = computed(() => {
  if (displayGame.value === "doodle" && store.players.length < 2) {
    return "Need at least 2 players";
  }
  return "Start Game";
});

// Switching games also resets the round length to that game's own
// sensible default -- the two don't share a unit (minutes vs. seconds
// per turn), so carrying over the previous game's raw number would be
// meaningless.
function selectGame(game: "countries" | "doodle") {
  if (!store.isHost) {
    return;
  }
  store.selectGame(game);
  store.updateSettings(
    game === "countries"
      ? COUNTRIES_DEFAULT_ROUND_LENGTH
      : DOODLE_DEFAULT_ROUND_LENGTH,
    store.countryOrder,
  );
}

// [room].vue owns connect()/disconnect() (the WS spans the whole page,
// not just this component) -- this only needs to handle the one case
// connecting doesn't: a first-time visitor with no remembered name yet.
watch(
  () => store.connected,
  connected => {
    if (connected && !store.myName) {
      showNamePrompt.value = true;
    }
  },
);

async function submitName(name: string) {
  nameError.value = "";
  submittingName.value = true;
  try {
    await store.join(name);
    showNamePrompt.value = false;
  } catch (message) {
    nameError.value = message as string;
  } finally {
    submittingName.value = false;
  }
}

const roomUrl = computed(() =>
  typeof window !== "undefined" ? window.location.href : "",
);
const displayRoomUrl = computed(() =>
  isMobile()
    ? roomUrl.value.replace(/^https?:\/\//, "")
    : roomUrl.value,
);

const copied = ref(false);

async function copyLink() {
  try {
    await navigator.clipboard.writeText(roomUrl.value);
  } catch {
    // iOS Safari's Clipboard API is unavailable/rejects in some
    // versions -- fall back to the legacy selection-based copy.
    const textarea = document.createElement("textarea");
    textarea.value = roomUrl.value;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

// The invite URL must never truncate -- shrink its font instead of
// letting it ellipsis. Font-size is set directly (rather than via CSS)
// because "does it fit" depends on the rendered text width, which only
// the DOM can measure.
const BASE_FONT_SIZE_REM = 0.8;
const MIN_FONT_SIZE_REM = 0.45;
const FONT_STEP_REM = 0.05;

const inviteRef = ref<HTMLElement | null>(null);
const urlRef = ref<HTMLElement | null>(null);
let resizeObserver: ResizeObserver | null = null;

function fitUrlText() {
  const el = urlRef.value;
  if (!el) {
    return;
  }
  let fontSize = BASE_FONT_SIZE_REM;
  el.style.fontSize = `${fontSize}rem`;
  while (
    el.scrollWidth > el.clientWidth &&
    fontSize > MIN_FONT_SIZE_REM
  ) {
    fontSize -= FONT_STEP_REM;
    el.style.fontSize = `${fontSize}rem`;
  }
}

watch(displayRoomUrl, () => {
  void nextTick(fitUrlText);
});

onMounted(() => {
  void nextTick(fitUrlText);
  resizeObserver = new ResizeObserver(fitUrlText);
  if (inviteRef.value) {
    resizeObserver.observe(inviteRef.value);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});
</script>

<style lang="scss">
@use "/variables" as vars;

.gamelobby {
  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;

  &-bg-video {
    position: absolute;
    inset: 0;

    // More negative than DynamicBackground's own -100 (see
    // DynamicBackground.vue) -- .gamelobby has no z-index of its own, so
    // this compares against that globally rather than in a local
    // stacking context. Puts the video furthest back, the dynamic
    // background in front of it, and the rest of the lobby's content
    // (default z-index: auto) in front of both.
    z-index: -101;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.1;
    pointer-events: none;
  }

  &-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    padding: 0 0.5rem;
    padding-bottom: 1rem;
    text-align: center;
  }

  &-title {
    margin: 0;
  }

  &-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  &-settings-group {
    display: flex;
    flex-direction: column;
    align-items: center;

    // Tighter than the 1.5rem gap between page sections -- these are
    // all part of one cohesive settings block (shared length + the
    // game-specific control below it), same spacing for both games.
    gap: 1rem;
    width: 100%;
  }

  &-settings {
    width: 100%;
    max-width: 280px;

    &-readonly {
      margin: 0;
      color: var(--color-light);
      font-size: 0.9rem;
    }

    &-value {
      color: var(--color-highlight);
      font-weight: 600;
    }
  }

  &-suggest {
    display: flex;
    gap: 0.5rem;
    width: 100%;
    max-width: 360px;

    .textfield {
      flex: 1;
    }
  }

  &-players {
    display: flex;
    flex-direction: column;
    min-width: 200px;

    h3 {
      margin: 0;
      margin-bottom: 0.5rem;
    }

    &-list {
      display: grid;
      grid-template-columns: repeat(2, minmax(180px, 1fr));
      gap: 0.75rem;

      &-3col {
        @include vars.desktop-only {
          grid-template-columns: repeat(3, minmax(140px, 1fr));
        }
      }
    }
  }

  &-player {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    border: 1px solid var(--color-light);
    background: var(--color-dark);
    padding: 0.4rem 0.75rem;
    font-size: 0.95rem;

    &-name {
      font-weight: 500;
    }

    &-badges {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    &-status {
      color: var(--color-error);
      font-size: 0.85rem;
    }

    &-crown {
      color: var(--color-highlight);
      flex-shrink: 0;
    }
  }

  &-invite {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    border: 1px solid var(--color-light);
    background: var(--color-dark);
    padding: 0.5rem 0.75rem;
    max-width: 480px;
    width: 100%;
    box-sizing: border-box;

    &-url {
      flex: 1;
      min-width: 0;
      font-size: 0.8rem;
      color: var(--color-light);
      white-space: nowrap;
      text-align: left;
    }

    &-wrapper h3 {
      margin: 0;
      margin-bottom: 0.5rem;
    }
  }

  &-waiting {
    margin: 0;
    color: var(--color-light);
    font-size: 0.9rem;
  }

  &-error {
    margin: 0;
    color: var(--color-error);
    font-size: 0.9rem;
  }

  @include vars.mobile-only {
    &-invite {
      max-width: none;
    }
  }
}
</style>
