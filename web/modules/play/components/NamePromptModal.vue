<template>
  <ModalDialog class="namepromptmodal">
    <h2>Enter your name</h2>
    <form @submit.prevent="onSubmit">
      <TextField
        ref="nameInput"
        v-model="nameValue"
        maxlength="24"
        placeholder="Your name..."
        aria-label="Your name"
        :autofill="false"
      />
      <LinkButton
        :disabled="!canSubmit || submitting"
        type="submit"
        text="Join"
      >
        <Icon name="bx:log-in" />
      </LinkButton>
    </form>
    <p v-if="error" class="namepromptmodal-error">{{ error }}</p>
  </ModalDialog>
</template>

<script setup lang="ts">
import { getPersistentPlayerName } from "../composables/usePersistentPlayer";

interface Props {
  error?: string;
  submitting?: boolean;
}

withDefaults(defineProps<Props>(), {
  error: "",
  submitting: false,
});

const emit = defineEmits<{ submit: [name: string] }>();

const nameValue = ref(getPersistentPlayerName());
const nameInput = ref<{ focus: () => void }>();

const canSubmit = computed(
  () =>
    nameValue.value.trim().length > 0 &&
    nameValue.value.trim().length <= 20,
);

function onSubmit() {
  const name = nameValue.value.trim();
  if (!name || name.length > 20) {
    return;
  }
  emit("submit", name);
}

onMounted(() => {
  void nextTick(() => nameInput.value?.focus());
});
</script>

<style lang="scss">
.namepromptmodal {
  h2 {
    margin: 0;
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

  &-error {
    margin: 0.5rem 0 0;
    color: var(--color-error);
    font-size: 0.85rem;
    text-align: center;
  }
}
</style>
