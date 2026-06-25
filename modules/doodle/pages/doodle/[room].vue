<template>
  <div class="doodleroom">
    <HeaderBar
      title="Doodle"
      back-href="/games"
      back-label="Leave game"
    >
      <span
        v-if="store.totalRounds > 0"
        class="doodleroom-header-round"
      >
        Round {{ store.roundNumber }}/{{ store.totalRounds }}
      </span>

      <span
        v-if="store.phase === 'drawing'"
        class="doodleroom-header-hint"
      >
        {{ store.amIDrawing ? store.myWord : store.formattedHint }}
      </span>

      <span
        v-if="store.phase === 'drawing'"
        :class="['doodleroom-header-timer', timerClass]"
      >
        {{ store.timeLeft }}s
      </span>
    </HeaderBar>

    <!-- Main canvas / lobby area -->
    <main class="doodleroom-main">
      <DoodleLobby v-if="store.phase === 'waiting'" />

      <template v-else>
        <div class="doodleroom-canvas-wrap">
          <DoodleCanvas />

          <RoundResult
            v-if="store.phase === 'round_end'"
          />
          <GameResult
            v-if="store.phase === 'game_end'"
          />
        </div>
      </template>
    </main>

    <!-- Sidebar: players + chat -->
    <aside class="doodleroom-sidebar">
      <PlayerList />
      <DoodleChat />
    </aside>

    <!-- Name prompt modal -->
    <div
      v-if="showNamePrompt"
      class="doodleroom-modal-overlay"
    >
      <div class="doodleroom-modal">
        <h2>Enter your name</h2>
        <form @submit.prevent="submitName">
          <input
            ref="nameInput"
            v-model="nameValue"
            type="text"
            maxlength="24"
            placeholder="Your name..."
            autocomplete="off"
          >
          <LinkButton
            type="submit"
            text="Join Game"
          >
            <Icon name="bx:log-in" />
          </LinkButton>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })

const route = useRoute()
const config = useRuntimeConfig()
const store = useDoodleStore()

const roomId = computed(() => route.params.room as string)
const showNamePrompt = ref(false)
const nameValue = ref(store.myName)
const nameInput = ref<HTMLInputElement>()

const timerClass = computed(() => {
  if (store.timeLeft > 30) return 'doodleroom-header-timer-ok'
  if (store.timeLeft > 10) return 'doodleroom-header-timer-warn'
  return 'doodleroom-header-timer-danger'
})

// Wait for you_are then show name prompt (if no name saved)
watch(() => store.myId, (id) => {
  if (!id) return
  if (store.myName) {
    store.send({ type: 'join', name: store.myName })
  }
  else {
    showNamePrompt.value = true
    nextTick(() => nameInput.value?.focus())
  }
})

function submitName() {
  const name = nameValue.value.trim()
  if (!name) return
  store.myName = name
  showNamePrompt.value = false
  store.send({ type: 'join', name })
}

onMounted(() => {
  store.connect(roomId.value, config.public.doodleApiUrl as string)
})

onUnmounted(() => {
  store.disconnect()
})
</script>

<style lang="scss">
@use "/variables" as vars;

.doodleroom {
  position: fixed;
  inset: 0;
  display: grid;
  grid-template: "header header" auto "main   sidebar" 1fr / 1fr 260px;
  background: var(--color-dark);
  z-index: 20;

  @include vars.mobile-only {
    grid-template: "header" auto "main" 1fr "sidebar" auto / 1fr;
  }

  &-header {
    &-round {
      font-size: 0.85rem;
      color: var(--color-light);
      flex-shrink: 0;
    }

    &-hint {
      flex: 1;
      text-align: center;
      font-size: 1.3rem;
      font-weight: 700;
      font-family: monospace;
      letter-spacing: 3px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &-timer {
      font-size: 1.1rem;
      font-weight: 700;
      min-width: 42px;
      text-align: right;
      flex-shrink: 0;

      &-ok { color: var(--color-light); }
      &-warn { color: #ffb300; }
      &-danger { color: var(--color-error); }
    }
  }

  &-main {
    grid-area: main;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  &-canvas-wrap {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &-sidebar {
    grid-area: sidebar;
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--color-light);
    overflow: hidden;

    @include vars.mobile-only {
      border-left: none;
      border-top: 1px solid var(--color-light);
      max-height: 220px;
    }
  }

  // Name prompt modal
  &-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 75%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 30;
    padding: 1rem;
  }

  &-modal {
    background: var(--color-dark);
    border: 1px solid var(--color-highlight);
    padding: 2rem;
    width: 100%;
    max-width: 360px;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;

    h2 {
      font-size: 1.3rem;
      font-weight: 400;
      text-align: center;
    }

    form {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    input[type='text'] {
      background: transparent;
      border: 1px solid var(--color-light);
      color: var(--color-light);
      font-size: 1rem;
      padding: 0.6rem 0.8rem;
      width: 100%;
      box-sizing: border-box;
      outline: none;
      transition: border-color 150ms;

      &:focus {
        border-color: var(--color-highlight);
      }
    }
  }
}
</style>
