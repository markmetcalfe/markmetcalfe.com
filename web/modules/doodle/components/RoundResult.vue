<template>
  <div class="doodleroundresult">
    <h2 class="doodleroundresult-heading">Round Over!</h2>
    <p class="doodleroundresult-word">
      The word was:
      <strong class="highlight">{{ store.wordHint }}</strong>
    </p>

    <ul
      class="doodleroundresult-scores"
      :class="{ 'doodleroundresult-scores-2col': sorted.length >= 4 }"
    >
      <li
        v-for="(player, i) in sorted"
        :key="player.id"
        class="doodleroundresult-score"
        :class="{ 'doodleroundresult-score-top': i === 0 }"
      >
        <span class="doodleroundresult-score-name">{{
          player.name
        }}</span>
        <span class="doodleroundresult-score-pts">{{
          player.score
        }}</span>
      </li>
    </ul>

    <p class="doodleroundresult-next">
      {{
        store.roundNumber >= store.totalRounds
          ? "Showing game results shortly"
          : "Next round starting shortly"
      }}&hellip;
    </p>
  </div>
</template>

<script setup lang="ts">
const store = useDoodleStore();

const sorted = computed(() =>
  [...store.players].sort((a, b) => b.score - a.score),
);
</script>

<style lang="scss">
.doodleroundresult {
  // Fixed, not absolute -- its DOM parent (.doodleroom-canvas-wrap) is
  // only as tall as the canvas itself on mobile (see DoodleGame.vue's
  // mobile grid, where "main" is sized to its content rather than
  // stretched), so an absolutely-positioned overlay there only covered
  // the canvas, leaving the player list/chat rows uncovered. Fixed
  // positioning covers the true viewport regardless of which grid row
  // it happens to be nested in.
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 85%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  z-index: 10;
  padding: 1.5rem;
  text-align: center;

  &-heading {
    font-size: 1.8rem;
    font-weight: 400;
  }

  &-word {
    font-size: 1rem;
    color: var(--color-light);
  }

  &-scores {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    width: 100%;

    // Same on mobile and desktop, using desktop's narrower width.
    // Same as .doodlegameresult-scores, so round-over and game-over
    // don't visibly change width between each other.
    max-width: 240px;

    &-2col {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      max-width: 380px;

      // The winner keeps top billing -- spans both columns instead of
      // sharing a row with 2nd place.
      .doodleroundresult-score-top {
        grid-column: 1 / -1;
      }
    }
  }

  &-score {
    display: flex;
    justify-content: space-between;
    background: var(--color-dark);
    border: 1px solid var(--color-light);
    padding: 0.4rem 0.75rem;
    font-size: 0.95rem;

    &-top {
      border-color: var(--color-highlight);
    }

    &-name {
      font-weight: 500;
    }

    &-pts {
      color: var(--color-highlight);
      font-weight: 600;
    }
  }

  &-next {
    font-size: 0.85rem;
    color: var(--color-light);
  }
}
</style>
