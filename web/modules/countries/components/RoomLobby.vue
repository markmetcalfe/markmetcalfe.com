<template>
  <div class="roomlobby">
    <LinkButton
      v-if="store.isHost && store.players.length < 2"
      large
      text="Start Solo Game"
      @click="startGame"
    >
      <Icon name="bx:play" />
    </LinkButton>

    <div v-if="store.players.length > 1" class="roomlobby-players">
      <div
        v-for="player in store.players"
        :key="player.id"
        class="roomlobby-player"
      >
        <span class="roomlobby-player-name">{{ player.name }}</span>
        <span
          v-if="player.disconnectedAt"
          class="roomlobby-player-status"
          >reconnecting&hellip;</span
        >
        <span v-else-if="player.isHost" class="highlight">host</span>
      </div>
    </div>

    <div class="roomlobby-invite-wrapper">
      <h3 v-if="store.players.length < 2">Invite Others To Play:</h3>
      <div ref="inviteRef" class="roomlobby-invite">
        <span ref="urlRef" class="roomlobby-invite-url">{{
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

    <template v-if="store.isHost && store.players.length > 1">
      <RangeSlider
        v-model="gameLengthMinutes"
        label="Game length (min)"
        :min="1"
        :max="20"
        :step="1"
        class="roomlobby-settings"
      />

      <LinkButton large text="Start Game" @click="startGame">
        <Icon name="bx:play" />
      </LinkButton>
    </template>

    <p
      v-else-if="!store.isHost && store.players.length > 1"
      class="roomlobby-waiting"
    >
      Waiting for the host to start&hellip;
    </p>
  </div>
</template>

<script setup lang="ts">
import isMobile from "is-mobile";

const store = useCountryGuesserRoomStore();
const copied = ref(false);
const gameLengthMinutes = ref(5);

function startGame() {
  store.startGame(
    gameLengthMinutes.value * 60,
    store.players.length < 2,
  );
}

const roomUrl = computed(() =>
  typeof window !== "undefined" ? window.location.href : "",
);
const displayRoomUrl = computed(() =>
  isMobile()
    ? roomUrl.value.replace(/^https?:\/\//, "")
    : roomUrl.value,
);

function copyLink() {
  void navigator.clipboard.writeText(roomUrl.value).then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  });
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

.roomlobby {
  position: relative;
  z-index: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem 2rem;
  text-align: center;

  &-heading {
    font-size: 1.4rem;
    font-weight: 400;
  }

  &-players {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    min-width: 200px;
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

    &-status {
      color: var(--color-light);
      font-size: 0.85rem;
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
      margin-bottom: 1rem;
    }
  }

  @include vars.mobile-only {
    padding: 1.25rem 0;

    &-invite {
      max-width: none;
    }
  }

  &-settings {
    width: 100%;
    max-width: 280px;
  }

  &-waiting {
    color: var(--color-light);
    font-size: 0.9rem;
  }
}
</style>
