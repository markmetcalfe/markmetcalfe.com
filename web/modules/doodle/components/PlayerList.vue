<template>
  <div
    class="doodleplayers"
    :class="{ 'doodleplayers-3col': store.players.length > 4 }"
  >
    <div
      v-for="player in store.players"
      :key="player.id"
      :class="[
        'doodleplayers-item',
        {
          'doodleplayers-item-drawing': isDrawing(player.id),
          'doodleplayers-item-guessed':
            store.correctGuessers.includes(player.id),
        },
      ]"
    >
      <span class="doodleplayers-item-name"
        >{{ player.name }}
        <Icon
          v-if="player.isHost"
          name="bx:crown"
          class="doodleplayers-item-icon"
        />
        <Icon
          v-if="isDrawing(player.id)"
          name="bx:pencil"
          class="doodleplayers-item-icon"
        />
      </span>
      <span class="doodleplayers-item-score">
        {{ player.score }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const store = useDoodleStore();

function isDrawing(playerId: string) {
  return (
    store.phase === "drawing" && store.currentDrawerId === playerId
  );
}
</script>

<style lang="scss">
@use "/variables" as vars;

.doodleplayers {
  padding: 0.75rem;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  @include vars.desktop-only {
    padding-left: 0;
  }

  @include vars.mobile-only {
    grid-area: players;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  &-3col {
    @include vars.mobile-only {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &-heading {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--color-light);
    font-weight: 400;
    margin-bottom: 0.5rem;

    @include vars.mobile-only {
      display: none;
    }
  }

  &-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid var(--color-highlight);
    padding: 0.3rem 0.6rem;
    font-size: 0.875rem;

    &-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      @include vars.mobile-only {
        font-size: 0.8rem;
      }
    }

    &-icon {
      margin-left: 0.3rem;
      vertical-align: -2px;
    }

    &-score {
      font-weight: 600;
      font-size: 0.8rem;
      color: var(--color-light);
    }

    &-guessed {
      .doodleplayers-item-name {
        color: var(--color-highlight);
      }
    }
  }
}
</style>
