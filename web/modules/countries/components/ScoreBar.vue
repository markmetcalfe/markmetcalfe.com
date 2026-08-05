<template>
  <div class="scorebar">
    <span v-if="!players" class="scorebar-progress">
      {{ guessedCount }} / {{ totalCount }} guessed
    </span>
    <ul
      v-else
      class="scorebar-players"
      :class="{ 'scorebar-players-grid': sortedPlayers.length > 4 }"
    >
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

    <CountdownTimer
      :seconds-left="props.secondsLeft"
      class="scorebar-timer"
    />
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
</script>

<style lang="scss">
@use "/variables" as vars;

.scorebar {
  display: flex;
  align-items: center;
  gap: 1rem;

  // Not flex-shrink: 0 -- in the header, this needs to shrink to fit
  // next to the back button on mobile instead of wrapping onto its own
  // line. The timer/progress/score text protect their own width below.
  min-width: 0;

  &-timer {
    // Always the last flex item in source order, so it lands on the
    // header's right edge -- in multiplayer, .scorebar-players is
    // absolutely positioned (see below) and so no longer occupies a
    // flex slot, leaving this the row's only item either way.
    margin-left: auto;
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

    // True centre of the header, ignoring the back button/timer's
    // widths -- same reasoning as .scorebar-players below.
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  &-players {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin: 0;

    // Centred against the header as a whole (the floating header is
    // already position: absolute, so this resolves its containing
    // block up to that rather than .scorebar's own box) -- centring
    // within .scorebar's own remaining flex space instead would still
    // be off, since that space itself starts to the right of the back
    // button rather than at the header's true left edge. Taken out of
    // the flex flow entirely, so it shares the header's line with the
    // back button/timer whenever it fits within max-width below, and
    // only grows onto extra rows (via flex-wrap/grid) once it doesn't --
    // rather than always claiming a whole line of its own regardless.
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    max-width: calc(100% - 9rem);

    &-grid {
      // A single wrapped row only stops being enough room past 4
      // players -- switch to a 4-per-row grid, which grows vertically
      // as needed, instead. Desktop never needs this: there's enough
      // width there for one row regardless of player count.
      @include vars.mobile-only {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
      }
    }
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
