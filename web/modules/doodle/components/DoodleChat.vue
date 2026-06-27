<template>
  <div class="doodlechat">
    <div ref="messagesEl" class="doodlechat-messages">
      <div
        v-for="(msg, i) in store.messages"
        :key="i"
        :class="['doodlechat-msg', `doodlechat-msg-${msg.type}`]"
      >
        <span v-if="msg.name" class="doodlechat-msg-sender"
          >{{ msg.name }}:&nbsp;</span
        >
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
      />
      <LinkButton small @click="submit">
        <Icon name="bx:right-arrow-alt" />
      </LinkButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const store = useDoodleStore();
const inputText = ref("");
const messagesEl = ref<HTMLElement>();

const inputPlaceholder = computed(() =>
  store.phase === "drawing" && store.currentDrawerId !== store.myId
    ? "Guess the word…"
    : "Chat…",
);

function submit() {
  const text = inputText.value.trim();
  if (!text) {
    return;
  }
  store.sendGuessOrChat(text);
  inputText.value = "";
}

watch(
  () => store.messages.length,
  async () => {
    await nextTick();
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
    }
  },
);
</script>

<style lang="scss">
@use "/variables" as vars;

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
      background: var(--color-light);
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
    border-top: 1px solid var(--color-light);
    flex-shrink: 0;

    input {
      flex: 1;
      background: transparent;
      border: 1px solid var(--color-light);
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

    .linkbutton {
      display: flex;

      button {
        flex: 1;
      }
    }
  }
}
</style>
