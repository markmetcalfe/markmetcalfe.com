<template>
  <div class="guessinput">
    <p class="guessinput-hint">{{ hint || " " }}</p>
    <form class="guessinput-form" @submit.prevent="handleSubmit">
      <TextField
        v-model="text"
        class="guessinput-field"
        :class="{ 'guessinput-field-shake': shake }"
        placeholder="Type a country..."
        autocomplete="off"
        :spellcheck="false"
        :disabled="disabled"
      />
      <LinkButton
        type="submit"
        text="Guess"
        :disabled="disabled || !text.trim()"
      >
        <Icon name="bx:right-arrow-alt" />
      </LinkButton>
      <LinkButton
        v-if="showSkip"
        text="Skip"
        :disabled="disabled"
        @click="emit('skip')"
      >
        <Icon name="bx:skip-next" />
      </LinkButton>
    </form>
  </div>
</template>

<script setup lang="ts">
interface Props {
  hint?: string;
  disabled?: boolean;
  showSkip?: boolean;
}

withDefaults(defineProps<Props>(), {
  hint: "",
  disabled: false,
  showSkip: true,
});

const emit = defineEmits<{
  submit: [text: string];
  skip: [];
}>();

const text = ref("");
const shake = ref(false);

function handleSubmit() {
  const value = text.value.trim();
  if (!value) {
    return;
  }
  emit("submit", value);
  text.value = "";
}

function flashIncorrect() {
  shake.value = false;
  requestAnimationFrame(() => {
    shake.value = true;
    setTimeout(() => {
      shake.value = false;
    }, 300);
  });
}

defineExpose({ flashIncorrect });
</script>

<style lang="scss">
.guessinput {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem 1.25rem;

  &-hint {
    font-family: monospace;
    font-size: 1.3rem;
    font-weight: 700;
    letter-spacing: 4px;
    text-align: center;
    min-height: 1.6rem;
  }

  &-form {
    display: flex;
    gap: 0.5rem;
    width: 100%;
    max-width: 420px;

    .textfield {
      flex: 1;
    }
  }

  &-field-shake {
    animation: guessinput-shake 0.3s ease-in-out;
  }
}

@keyframes guessinput-shake {
  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-6px);
  }

  75% {
    transform: translateX(6px);
  }
}
</style>
