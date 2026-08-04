<template>
  <div class="doodlegameresult">
    <h2 class="doodlegameresult-heading">Game Over!</h2>
    <p v-if="winner" class="doodlegameresult-winner">
      <span class="highlight">{{ winner.name }}</span> wins!
    </p>

    <ul
      class="doodlegameresult-scores"
      :class="{ 'doodlegameresult-scores-2col': sorted.length >= 4 }"
    >
      <li
        v-for="(player, i) in sorted"
        :key="player.id"
        class="doodlegameresult-score"
        :class="{ 'doodlegameresult-score-top': i === 0 }"
      >
        <span class="doodlegameresult-score-rank">{{ i + 1 }}</span>
        <span class="doodlegameresult-score-name">{{
          player.name
        }}</span>
        <span class="doodlegameresult-score-pts">{{
          player.score
        }}</span>
      </li>
    </ul>

    <LinkButton
      text="Back to Lobby"
      @click="playLobby.returnToLobby()"
    >
      <Icon name="bx:arrow-back" />
    </LinkButton>
  </div>
</template>

<script setup lang="ts">
const store = useDoodleStore();
const playLobby = usePlayLobbyStore();

const sorted = computed(() =>
  [...store.players].sort((a, b) => b.score - a.score),
);

const winner = computed(() => sorted.value[0]);
</script>

<style lang="scss">
.doodlegameresult {
  // Fixed, not absolute -- see the comment on .doodleroundresult in
  // RoundResult.vue, same underlying issue.
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 92%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  z-index: 10;
  padding: 1.5rem;
  text-align: center;

  &-heading {
    font-size: 2rem;
    font-weight: 400;
  }

  &-winner {
    font-size: 1.2rem;
  }

  &-scores {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    width: 100%;
    max-width: 300px;

    &-2col {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      max-width: 500px;

      // The winner keeps top billing -- spans both columns instead of
      // sharing a row with 2nd place.
      .doodlegameresult-score-top {
        grid-column: 1 / -1;
      }
    }
  }

  &-score {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    border: 1px solid var(--color-light);
    padding: 0.4rem 0.75rem;
    font-size: 0.95rem;

    &-top {
      border-color: var(--color-highlight);
    }

    &-rank {
      font-size: 0.75rem;
      color: var(--color-light);
      width: 16px;
      text-align: center;
      flex-shrink: 0;
    }

    &-name {
      flex: 1;
      font-weight: 500;
      text-align: left;
    }

    &-pts {
      color: var(--color-highlight);
      font-weight: 600;
    }
  }
}
</style>
