<template>
  <div class="doodleplayers">
    <h3 class="doodleplayers-heading">Players</h3>
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
      <span class="doodleplayers-item-avatar">
        {{ player.name.charAt(0).toUpperCase() }}
      </span>
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
  border-bottom: 1px solid var(--color-light);
  flex-shrink: 0;

  @include vars.mobile-only {
    grid-area: players;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.3rem 0.75rem;
    border-bottom: none;
    border-top: 1px solid var(--color-light);
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
    padding: 0.3rem 0;
    font-size: 0.875rem;

    &-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--color-light);
      color: var(--color-dark);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    &-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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

      .doodleplayers-item-avatar {
        background: var(--color-highlight);
      }
    }
  }
}
</style>
