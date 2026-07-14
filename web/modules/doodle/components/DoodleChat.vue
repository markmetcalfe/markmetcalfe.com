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
      <TextField
        v-model="inputText"
        :placeholder="inputPlaceholder"
        aria-label="Chat message"
        maxlength="100"
        :autofill="false"
        @keydown.enter="submit"
      />
      <LinkButton @click="submit">
        <Icon name="bx:send" />
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
  if (!text || text.length > 100) {
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
    height: 38px;
    gap: 0.4rem;
    padding: 0.5rem;
    border-top: 1px solid var(--color-light);
    flex-shrink: 0;

    .textfield,
    .linkbutton {
      display: flex;

      input,
      button {
        flex: 1;
      }
    }
  }
}
</style>
