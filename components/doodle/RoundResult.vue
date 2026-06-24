<template>
  <div class="doodleroundresult">
    <h2 class="doodleroundresult-heading">
      Round Over!
    </h2>
    <p class="doodleroundresult-word">
      The word was: <strong class="highlight">{{ store.wordHint }}</strong>
    </p>

    <ul class="doodleroundresult-scores">
      <li
        v-for="(player, i) in sorted"
        :key="player.id"
        class="doodleroundresult-score"
        :class="{ 'doodleroundresult-score-top': i === 0 }"
      >
        <span class="doodleroundresult-score-name">{{ player.name }}</span>
        <span class="doodleroundresult-score-pts">{{ player.score }}</span>
      </li>
    </ul>

    <p class="doodleroundresult-next">
      Next round starting shortly&hellip;
    </p>
  </div>
</template>

<script setup lang="ts">
import { useDoodleStore } from '~/stores/doodle'

const store = useDoodleStore()

const sorted = computed(() =>
  [...store.players].sort((a, b) => b.score - a.score),
)
</script>

<style lang="scss">
.doodleroundresult {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 88%);
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
    color: var(--color-disabled);
  }

  &-scores {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    width: 100%;
    max-width: 280px;
  }

  &-score {
    display: flex;
    justify-content: space-between;
    border: 1px solid var(--color-disabled);
    border-radius: 4px;
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
    color: var(--color-disabled);
  }
}
</style>
