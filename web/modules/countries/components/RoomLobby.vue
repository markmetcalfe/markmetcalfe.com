<template>
  <div class="roomlobby">
    <LinkButton
      v-if="store.players.length < 2"
      large
      :disabled="startingSolo"
      :text="startingSolo ? 'Starting…' : 'Start Solo Game'"
      @click="startSoloGame"
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

      <DropdownSelect
        v-model="countryOrder"
        label="Country order"
        :options="countryOrderOptions"
        class="roomlobby-settings"
      />

      <LinkButton large text="Start Game" @click="startGame">
        <Icon name="bx:play" />
      </LinkButton>
    </template>

    <template v-else-if="!store.isHost && store.players.length > 1">
      <p class="roomlobby-settings-readonly">
        Game length:
        <span class="roomlobby-settings-value"
          >{{ store.roundLength / 60 }} min</span
        >
      </p>
      <p class="roomlobby-settings-readonly">
        Country order:
        <span class="roomlobby-settings-value">{{
          countryOrderLabel
        }}</span>
      </p>
      <p class="roomlobby-waiting">
        Waiting for the host to start&hellip;
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import isMobile from "is-mobile";
import type { CountryOrder } from "../stores/countryGuesserRoom";

const store = useCountryGuesserRoomStore();
const copied = ref(false);
const gameLengthMinutes = ref(5);
const startingSolo = ref(false);

const countryOrder = ref<CountryOrder>("random");
const countryOrderOptions: { label: string; value: CountryOrder }[] =
  [
    { label: "Random", value: "random" },
    { label: "Alphabetical", value: "alphabetical" },
    { label: "Population", value: "population" },
    { label: "Size", value: "size" },
  ];

const countryOrderLabel = computed(
  () =>
    countryOrderOptions.find(
      option => option.value === store.countryOrder,
    )?.label ?? "Random",
);

// Pushed live so a non-host player can see the host's picks as they're
// made, not just once the round starts (see the read-only display
// above and "update_settings" in game-room.ts, which ignores this from
// anyone but the host).
watch([gameLengthMinutes, countryOrder], () => {
  store.updateSettings(
    gameLengthMinutes.value * 60,
    countryOrder.value,
  );
});

function startGame() {
  store.startGame(
    gameLengthMinutes.value * 60,
    store.players.length < 2,
    countryOrder.value,
  );
}

// The button is shown immediately (rather than waiting on the WS
// connection + join round-trip to confirm host status, which solo start
// doesn't require server-side anyway) -- so if it's clicked before that
// connection is up, wait for it here instead of gating the button on it.
async function startSoloGame() {
  if (!store.connected) {
    startingSolo.value = true;
    await new Promise<void>(resolve => {
      const stop = watch(
        () => store.connected,
        connected => {
          if (connected) {
            stop();
            resolve();
          }
        },
      );
    });
    startingSolo.value = false;
  }
  startGame();
}

const roomUrl = computed(() =>
  typeof window !== "undefined" ? window.location.href : "",
);
const displayRoomUrl = computed(() =>
  isMobile()
    ? roomUrl.value.replace(/^https?:\/\//, "")
    : roomUrl.value,
);

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

  &-settings-readonly {
    margin: 0;
    color: var(--color-light);
    font-size: 0.9rem;
  }

  &-settings-value {
    color: var(--color-highlight);
    font-weight: 600;
  }
}
</style>
