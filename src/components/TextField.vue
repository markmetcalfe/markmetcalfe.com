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

<script>
import { useId } from 'vue'

export default {
  name: 'TextInput',

  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
    label: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: 'Enter text...',
    },
    type: {
      type: String,
      default: 'text',
      validator: value => {
        return ['text', 'email', 'password', 'number', 'tel', 'url'].includes(
          value,
        )
      },
    },
    small: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:modelValue', 'change'],

  data() {
    return {
      isFocused: false,
      id: useId(),
      labelId: useId(),
    }
  },

  methods: {
    onInput(event) {
      this.$emit('update:modelValue', event.target.value)
      this.$emit('change', event.target.value)
    },
  },
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
    background: transparent;
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
