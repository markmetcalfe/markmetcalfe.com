<template>
  <div
    class="guessinput"
    @focusin="startResetScroll"
    @focusout="stopResetScroll"
  >
    <p class="guessinput-hint">{{ hint || " " }}</p>
    <form
      class="guessinput-form"
      autocomplete="off"
      @submit.prevent="handleSubmit"
    >
      <TextField
        ref="textFieldRef"
        v-model="text"
        class="guessinput-field"
        :class="{ 'guessinput-field-shake': shake }"
        name="guess"
        aria-label="Guess"
        placeholder="Type a country..."
        :autofill="false"
        :disabled="disabled"
      />
      <LinkButton
        type="submit"
        text="Guess"
        :disabled="disabled || !text.trim()"
        @mousedown.prevent
      >
        <Icon name="bx:right-arrow-alt" />
      </LinkButton>
      <LinkButton
        v-if="showSkip"
        text="Skip"
        :disabled="disabled"
        @mousedown.prevent
        @click="handleSkip"
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
const textFieldRef = ref<{ focus: () => void }>();

// Mobile browsers scroll a focused input into view while the on-screen
// keyboard opens/animates, which on this fixed-layout page just reveals
// dead space below it. That scroll can happen at any point during the
// keyboard's open animation, so a single reset can still land before it
// -- keep re-snapping to the top on an interval for as long as the
// field stays focused instead of just once.
let resetScrollInterval: ReturnType<typeof setInterval> | undefined;

function startResetScroll() {
  window.scrollTo(0, 0);
  clearInterval(resetScrollInterval);
  resetScrollInterval = setInterval(() => {
    window.scrollTo(0, 0);
  }, 100);
}

function stopResetScroll() {
  clearInterval(resetScrollInterval);
}

// The buttons' mousedown is prevented (see template) so tapping them
// doesn't blur the field and cycle the on-screen keyboard closed/open --
// that briefly resizes the visual viewport and shakes the fixed-layout
// page. Keyboard activation (Tab+Enter/Space) still moves focus though,
// so refocus here to keep typing the next guess uninterrupted either way.
function handleSubmit() {
  const value = text.value.trim();
  if (!value) {
    return;
  }
  emit("submit", value);
  text.value = "";
  textFieldRef.value?.focus();
}

function handleSkip() {
  emit("skip");
  textFieldRef.value?.focus();
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

onMounted(() => {
  textFieldRef.value?.focus();
});

onUnmounted(() => {
  clearInterval(resetScrollInterval);
});

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
