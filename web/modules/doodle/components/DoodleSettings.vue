<template>
  <form class="gamelobby-suggest" @submit.prevent="submitWord">
    <TextField
      v-model="wordInput"
      placeholder="Suggest a word to draw…"
      aria-label="Suggest a word"
      :disabled="store.mySubmittedWord"
    />
    <LinkButton
      type="submit"
      :text="store.mySubmittedWord ? 'Word submitted!' : 'Submit'"
      :disabled="!canSubmitWord"
    >
      <Icon v-if="store.mySubmittedWord" name="bx:check" />
      <Icon v-else name="bx:send" />
    </LinkButton>
  </form>
  <p v-if="wordError" class="gamelobby-error">{{ wordError }}</p>

  <RangeSlider
    v-if="store.isHost"
    v-model="roundLengthSeconds"
    label="Round length (sec)"
    :min="30"
    :max="180"
    :step="10"
    class="gamelobby-settings"
  />
  <p v-else class="gamelobby-settings-readonly">
    Round length:
    <span class="gamelobby-settings-value">{{
      roundLengthLabel
    }}</span>
  </p>

  <p class="gamelobby-settings-readonly">
    Game length:
    <span class="gamelobby-settings-value">{{
      totalGameLengthLabel
    }}</span>
  </p>
</template>

<script setup lang="ts">
const store = usePlayLobbyStore();

// Proxies straight onto the store (the single source of truth, synced
// from the server) rather than a separate local ref -- a reload/reconnect
// then just shows whatever's already saved server-side for free, with
// nothing to resync by hand.
const roundLengthSeconds = computed({
  get: () => store.roundLength,
  set: (value: number) =>
    store.updateSettings(value, store.countryOrder),
});

const wordInput = ref("");
const wordError = ref("");

const canSubmitWord = computed(() => {
  const trimmed = wordInput.value.trim();
  return (
    !store.mySubmittedWord &&
    trimmed.length >= 3 &&
    trimmed.length <= 15
  );
});

async function submitWord() {
  if (!canSubmitWord.value) {
    return;
  }
  wordError.value = "";
  try {
    await store.submitWord(wordInput.value.trim());
  } catch (message) {
    wordError.value = message as string;
  }
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) {
    return `${seconds}s`;
  }
  if (seconds === 0) {
    return `${minutes} min`;
  }
  return `${minutes} min ${seconds}s`;
}

const roundLengthLabel = computed(() =>
  formatDuration(store.roundLength),
);

// Doodle plays one round per player (see api/doodle/src/game-room.ts's
// doStartGame), so the total is just the per-round length times the
// number of players -- purely informational, not a separate setting.
const totalGameLengthLabel = computed(() =>
  formatDuration(store.players.length * store.roundLength),
);
</script>
