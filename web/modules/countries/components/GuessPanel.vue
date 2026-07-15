<template>
  <GuessInput
    v-if="
      store.phase === 'playing' &&
      (!store.amIDone || store.players.length < 2)
    "
    ref="guessInputRef"
    :hint="store.hint"
    @submit="handleGuess"
    @skip="store.submitSkip()"
  />
  <div
    v-else-if="
      store.phase === 'playing' &&
      store.amIDone &&
      store.players.length > 1
    "
    class="guesspanel-waiting"
  >
    <p class="guesspanel-waiting-text">
      {{ store.lastGuessCorrect ? "Nice, you got it!" : "Skipped." }}
      Waiting for {{ remainingLabel }}&hellip;
    </p>
  </div>
</template>

<script setup lang="ts">
const store = useCountryGuesserRoomStore();

const guessInputRef = ref<{ flashIncorrect: () => void }>();

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

function handleGuess(text: string) {
  store.submitGuess(text);
}

defineExpose({
  flashIncorrect: () => guessInputRef.value?.flashIncorrect(),
});
</script>

<style lang="scss">
.guesspanel {
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
}
</style>
