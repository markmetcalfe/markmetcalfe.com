<template>
  <div class="fader" :class="{ disabled: disabled }">
    <label v-if="label" :id="labelId" class="fader-label" :for="id">{{
      label
    }}</label>
    <div class="fader-container" :class="{ 'fader--active': isFocused }">
      <div class="fader-track">
        <input
          :id="id"
          type="range"
          class="fader-input"
          :min="min"
          :max="max"
          step="0.001"
          :value="roundedValue"
          role="slider"
          :aria-valuemin="min"
          :aria-valuemax="max"
          :aria-valuenow="roundedValue"
          :aria-valuetext="roundedValue"
          :aria-labelledby="labelId"
          :disabled="disabled"
          @input="updateValue"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        <div
          class="fader-progress"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      <slot name="append" :disabled="disabled" />
      <TextField
        :model-value="roundedValue"
        :disabled="disabled"
        type="number"
        class="fader-value"
        small
        @update:model-value="updateTextValue"
      />
    </div>
  </div>
</template>

<script>
import { useId } from 'vue'
import TextField from './TextField.vue'

export default {
  name: 'SliderSelect',

  components: { TextField },

  props: {
    label: {
      type: String,
      default: null,
    },
    modelValue: {
      type: Number,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    decimalPlaces: {
      type: Number,
      default: 0,
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

  computed: {
    progressPercentage() {
      return ((this.modelValue - this.min) / (this.max - this.min)) * 100
    },
    roundedValue() {
      return this.modelValue.toFixed(this.decimalPlaces)
    },
  },

  methods: {
    updateValue(event) {
      const value = Number(event.target.value)
      this.$emit('update:modelValue', value)
      this.$emit('change', value)
    },
    updateTextValue(textValue) {
      const value = Number(textValue)
      this.$emit('update:modelValue', value)
      this.$emit('change', value)
    },
    handleFocus() {
      this.isFocused = true
    },
    handleBlur() {
      this.isFocused = false
    },
  },
}
</script>

<style lang="scss">
@use '../variables' as vars;

.fader {
  display: flex;
  align-items: center;

  &-label {
    margin-right: 0.5rem;
    white-space: nowrap;
  }

  &-container {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
  }

  &-track {
    position: relative;
    width: 100%;
    height: 1px;
    background-color: var(--color-light);
    margin-right: 1rem;
    font-size: small;
  }

  &-progress {
    position: absolute;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
  }

  &-input {
    position: relative;
    appearance: none;
    width: 100%;
    background-color: transparent;
    z-index: 2;
    transform: translateY(-0.5rem);

    &:focus {
      outline: none;
    }

    &::-webkit-slider-thumb,
    &::-moz-range-thumb {
      appearance: none;
      height: 100%;
      width: 0.5rem;
      border-radius: 0;
      background: var(--color-dark);
      border: 1px solid var(--color-light);
      transition: all 0.2s ease;
    }
  }

  &:not(.disabled) &-input:hover {
    cursor: pointer;

    &::-webkit-slider-thumb,
    &::-moz-range-thumb {
      border: 1px solid var(--color-highlight);
    }
  }

  &-value {
    min-width: 1rem;
    max-width: 3.5rem;
    text-align: right;

    @include vars.mobile-only {
      max-width: 4rem;
    }
  }
}
</style>
