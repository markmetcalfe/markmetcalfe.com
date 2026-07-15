<template>
  <div class="scorebar">
    <span :class="['scorebar-timer', timerClass]">
      {{ secondsLeft }}s
    </span>

    <span v-if="!players" class="scorebar-progress">
      {{ guessedCount }} / {{ totalCount }} guessed
    </span>
    <ul v-else class="scorebar-players">
      <li
        v-for="player in sortedPlayers"
        :key="player.id"
        class="scorebar-player"
        :class="{ 'scorebar-player-me': player.id === myPlayerId }"
      >
        <span class="scorebar-player-name">{{ player.name }}</span>
        <span class="scorebar-player-score">{{ player.score }}</span>
      </li>
    </ul>

    <span v-if="!players" class="scorebar-score"
      >{{ score }} pts</span
    >
  </div>
</template>

<script setup lang="ts">
interface Player {
  id: string;
  name: string;
  score: number;
}

interface Props {
  secondsLeft: number;
  score?: number;
  guessedCount?: number;
  totalCount?: number;
  players?: Player[];
  myPlayerId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  score: 0,
  guessedCount: 0,
  totalCount: 0,
  players: undefined,
  myPlayerId: "",
});

const sortedPlayers = computed(() =>
  [...(props.players ?? [])].sort((a, b) => b.score - a.score),
);

const timerClass = computed(() => {
  if (props.secondsLeft > 30) {
    return "scorebar-timer-ok";
  }
  if (props.secondsLeft > 10) {
    return "scorebar-timer-warn";
  }
  return "scorebar-timer-danger";
});
</script>

<style lang="scss">
@use "/variables" as vars;

.scorebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  // Not flex-shrink: 0 -- in the header, this needs to shrink to fit
  // next to the back button on mobile instead of wrapping onto its own
  // line. The timer/progress/score text protect their own width below,
  // and .scorebar-players scrolls horizontally instead of shrinking.
  min-width: 0;

  &-timer {
    font-size: 1.1rem;
    font-weight: 700;
    min-width: 42px;

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

  &-progress,
  &-score {
    font-size: 0.9rem;
    color: var(--color-light);
    flex-shrink: 0;
  }

  &-score {
    font-weight: 700;
    color: var(--color-highlight);
  }

  &-players {
    list-style: none;
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    flex: 1;
    justify-content: flex-end;
    margin: 0;
  }

  &-player {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    border: 1px solid var(--color-light);
    padding: 0.2rem 0.5rem;
    font-size: 0.8rem;
    white-space: nowrap;

    &-score {
      font-weight: 700;
      color: var(--color-highlight);
    }

    &-me {
      border-color: var(--color-highlight);
    }
  }
}
</style>
