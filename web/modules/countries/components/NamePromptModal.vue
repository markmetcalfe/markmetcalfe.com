<template>
  <ModalDialog class="namepromptmodal">
    <h2>Enter your name</h2>
    <form @submit.prevent="submitName">
      <TextField
        ref="nameInput"
        v-model="nameValue"
        maxlength="24"
        placeholder="Your name..."
        aria-label="Your name"
        :autofill="false"
      />
      <LinkButton
        :disabled="!canSubmitName || submittingName"
        type="submit"
        text="Join Room"
      >
        <Icon name="bx:log-in" />
      </LinkButton>
    </form>
    <p v-if="nameError" class="namepromptmodal-error">
      {{ nameError }}
    </p>
  </ModalDialog>
</template>

<script setup lang="ts">
import { getPersistentPlayerName } from "../stores/countryGuesserRoom";

const emit = defineEmits<{ joined: [] }>();

const store = useCountryGuesserRoomStore();

const nameValue = ref(getPersistentPlayerName());
const nameInput = ref<{ focus: () => void }>();
const nameError = ref("");
const submittingName = ref(false);

const canSubmitName = computed(
  () =>
    nameValue.value.trim().length > 0 &&
    nameValue.value.trim().length <= 20,
);

async function submitName() {
  const name = nameValue.value.trim();
  if (!name || name.length > 20) {
    return;
  }
  nameError.value = "";
  submittingName.value = true;
  try {
    await store.join(name);
    emit("joined");
  } catch (message) {
    nameError.value = message as string;
  } finally {
    submittingName.value = false;
  }
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
