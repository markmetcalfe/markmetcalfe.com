<template>
  <div class="doodlelobby">
    <h3 class="doodlelobby-heading">Waiting for players&hellip;</h3>

    <div class="doodlelobby-players">
      <div v-for="player in store.players" :key="player.id" class="doodlelobby-player">
        <span class="doodlelobby-player-name">
          {{ player.name }}
        </span>
        <span
          v-if="store.suggestedWordPlayerIds.includes(player.id)"
          class="doodlelobby-player-word highlight"
          title="Suggested a word"
        >
          word ready
        </span>
        <span v-else-if="player.isHost" class="highlight"> host </span>
      </div>
    </div>

    <form class="doodlelobby-suggest" @submit.prevent="submitWord">
      <TextField
        v-model="wordInput"
        placeholder="Suggest a word to draw…"
        :disabled="store.iHaveSubmittedWord"
      />
      <LinkButton
        type="submit"
        :text="store.iHaveSubmittedWord ? 'Word submitted!' : 'Submit'"
        :disabled="!canSubmitWord"
      >
        <Icon v-if="store.iHaveSubmittedWord" name="bx:check" />
        <Icon v-else name="bx:send" />
      </LinkButton>
    </form>

    <div class="doodlelobby-invite">
      <span class="doodlelobby-invite-url">{{ roomUrl }}</span>
      <LinkButton :text="copied ? 'Copied!' : 'Copy Link'" small @click="copyLink">
        <Icon v-if="copied" name="bx:check" />
        <Icon v-else name="bx:copy" />
      </LinkButton>
    </div>

    <RangeSlider
      v-if="store.isHost"
      v-model="store.roundLength"
      label="Round length"
      :min="30"
      :max="180"
      :step="10"
      class="doodlelobby-settings"
    />

    <LinkButton
      v-if="store.isHost"
      :text="store.players.length < 2 ? 'Need at least 2 players' : 'Start Game'"
      :disabled="store.players.length < 2"
      @click="store.startGame()"
    >
      <Icon name="bx:play" />
    </LinkButton>
    <p v-else class="doodlelobby-waiting">Waiting for the host to start&hellip;</p>
  </div>
</template>

<script setup lang="ts">
const store = useDoodleStore();
const copied = ref(false);
const wordInput = ref("");

const roomUrl = computed(() => (typeof window !== "undefined" ? window.location.href : ""));

const canSubmitWord = computed(() => {
  const len = wordInput.value.trim().length;
  return !store.iHaveSubmittedWord && len >= 3 && len <= 15;
});

function copyLink() {
  void navigator.clipboard.writeText(roomUrl.value).then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  });
}

function submitWord() {
  if (!canSubmitWord.value) {
    return;
  }
  store.suggestWord(wordInput.value.trim());
}
</script>

<style lang="scss">
@use "/variables" as vars;

.doodlelobby {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 1.5rem;
  padding: 2rem;
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
    padding: 0.4rem 0.75rem;
    font-size: 0.95rem;

    &-name {
      font-weight: 500;
    }

    &-word {
      font-size: 0.8rem;
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

  &-invite {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    border: 1px solid var(--color-light);
    padding: 0.5rem 0.75rem;
    max-width: 480px;
    width: 100%;
    box-sizing: border-box;

    &-url {
      flex: 1;
      font-size: 0.8rem;
      color: var(--color-light);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: left;
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
