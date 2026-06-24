<template>
  <div class="doodlechat">
    <div
      ref="messagesEl"
      class="doodlechat-messages"
    >
      <div
        v-for="(msg, i) in store.messages"
        :key="i"
        :class="['doodlechat-msg', `doodlechat-msg-${msg.type}`]"
      >
        <span
          v-if="msg.name"
          class="doodlechat-msg-sender"
        >{{ msg.name }}:&nbsp;</span>
        {{ msg.text }}
      </div>
    </div>

    <div class="doodlechat-input">
      <input
        v-model="inputText"
        type="text"
        :placeholder="inputPlaceholder"
        maxlength="100"
        autocomplete="off"
        @keydown.enter="submit"
      >
      <button @click="submit">
        →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDoodleStore } from '~/stores/doodle'

const store = useDoodleStore()
const inputText = ref('')
const messagesEl = ref<HTMLElement>()

const inputPlaceholder = computed(() =>
  store.phase === 'drawing' && store.currentDrawerId !== store.myId
    ? 'Guess the word…'
    : 'Chat…',
)

function submit() {
  const text = inputText.value.trim()
  if (!text) return
  store.sendGuessOrChat(text)
  inputText.value = ''
}

watch(() => store.messages.length, async () => {
  await nextTick()
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
})
</script>

<style lang="scss">
@use "~/variables" as vars;

.doodlechat {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;

  &-messages {
    flex: 1;
    overflow-y: auto;
    padding: 0.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    scroll-behavior: smooth;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--color-disabled);
      border-radius: 2px;
    }
  }

  &-msg {
    font-size: 0.8rem;
    line-height: 1.4;
    word-break: break-word;

    &-sender {
      font-weight: 600;
    }

    &-system {
      color: var(--color-disabled);
      font-style: italic;
    }

    &-correct {
      color: var(--color-highlight);
      font-weight: 600;
    }
  }

  &-input {
    display: flex;
    gap: 0.4rem;
    padding: 0.5rem;
    border-top: 1px solid var(--color-disabled);
    flex-shrink: 0;

    input {
      flex: 1;
      background: transparent;
      border: 1px solid var(--color-disabled);
      border-radius: 4px;
      color: var(--color-light);
      font-size: 0.8rem;
      padding: 0.35rem 0.6rem;
      outline: none;
      transition: border-color 150ms;

      &:focus {
        border-color: var(--color-highlight);
      }

      &::placeholder {
        color: var(--color-disabled);
      }
    }

    button {
      background: none;
      border: 1px solid var(--color-highlight);
      color: var(--color-highlight);
      border-radius: 4px;
      font-size: 0.9rem;
      padding: 0 0.6rem;
      cursor: pointer;
      transition: background 150ms, color 150ms;

      &:hover {
        background: var(--color-highlight);
        color: var(--color-dark);
      }
    }
  }
}
</style>
