<template>
  <div class="doodlelobby">
    <h3 class="doodlelobby-heading">
      Waiting for players&hellip;
    </h3>

    <div class="doodlelobby-players">
      <div
        v-for="player in store.players"
        :key="player.id"
        class="doodlelobby-player"
      >
        <span class="doodlelobby-player-name">
          {{ player.name }}
        </span>
        <span
          v-if="player.isHost"
          class="highlight"
        >
          host
        </span>
      </div>
    </div>

    <div class="doodlelobby-invite">
      <span class="doodlelobby-invite-url">{{ roomUrl }}</span>
      <button
        class="doodlelobby-invite-copy"
        @click="copyLink"
      >
        {{ copied ? 'Copied!' : 'Copy Link' }}
      </button>
    </div>

    <button
      v-if="store.isHost"
      class="doodlelobby-start"
      :disabled="store.players.length < 2"
      @click="store.startGame()"
    >
      {{ store.players.length < 2 ? 'Need at least 2 players' : 'Start Game' }}
    </button>
    <p
      v-else
      class="doodlelobby-waiting"
    >
      Waiting for the host to start&hellip;
    </p>
  </div>
</template>

<script setup lang="ts">
import { useDoodleStore } from '~/stores/doodle'

const store = useDoodleStore()
const copied = ref(false)

const roomUrl = computed(() => typeof window !== 'undefined' ? window.location.href : '')

function copyLink() {
  navigator.clipboard.writeText(roomUrl.value).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  })
}
</script>

<style lang="scss">
@use "~/variables" as vars;

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
    border: 1px solid var(--color-disabled);
    border-radius: 4px;
    padding: 0.4rem 0.75rem;
    font-size: 0.95rem;

    &-name {
      font-weight: 500;
    }
  }

  &-invite {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    border: 1px solid var(--color-disabled);
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    max-width: 480px;
    width: 100%;
    box-sizing: border-box;

    &-url {
      flex: 1;
      font-size: 0.8rem;
      color: var(--color-disabled);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: left;
    }

    &-copy {
      background: none;
      border: 1px solid var(--color-highlight);
      color: var(--color-highlight);
      border-radius: 4px;
      font-size: 0.8rem;
      padding: 0.2rem 0.6rem;
      cursor: pointer;
      white-space: nowrap;
      transition: background 200ms, color 200ms;

      &:hover {
        background: var(--color-highlight);
        color: var(--color-dark);
      }
    }
  }

  &-start {
    background: var(--color-highlight);
    color: var(--color-dark);
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0.65rem 2rem;
    transition: opacity 200ms;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      opacity: 0.85;
    }
  }

  &-waiting {
    color: var(--color-disabled);
    font-size: 0.9rem;
  }
}
</style>
