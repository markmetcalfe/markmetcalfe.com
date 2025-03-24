<template>
  <div
    class="textfield"
    :class="{ 'textfield--small': small, disabled: disabled }"
  >
    <label v-if="label" :id="labelId" class="textfield-label" :for="id">
      {{ label }}
    </label>
    <div class="textfield-container">
      <input
        :id="id"
        class="textfield-field"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :aria-labelledby="labelId"
        :disabled="disabled"
        @input="onInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'

interface Props {
  modelValue?: string | number
  label?: string | null
  placeholder?: string
  type?: InputType
  small?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: null,
  placeholder: 'Enter text...',
  type: 'text',
  small: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number]
}>()

const isFocused = ref(false)
const id = useId()
const labelId = useId()

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('change', target.value)
}
</script>

<style lang="scss">
@use '../variables' as vars;

.textfield {
  display: flex;
  align-items: center;

  &-container {
    position: relative;
    display: flex;
    width: 100%;
  }

  &-label {
    margin-right: 0.5rem;
    white-space: nowrap;
  }

  &-field {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-light);
    background: var(--color-dark);
    color: inherit;
    border-radius: 0;
    font-size: inherit;
    font-weight: inherit;

    &:focus {
      outline: none;
      border-color: var(--color-highlight);
    }
  }

  &--small &-field {
    padding: 0.25rem;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    appearance: none;
    margin: 0;
  }

  input[type='number'] {
    appearance: textfield;
  }
}
</style>
