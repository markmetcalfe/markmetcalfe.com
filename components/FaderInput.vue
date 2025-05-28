<template>
  <div
    class="fader"
    :class="{ disabled: disabled }"
  >
    <label
      v-if="label"
      :id="labelId"
      class="fader-label"
      :for="id"
    >{{
      label
    }}</label>
    <div
      class="fader-container"
      :class="{ 'fader--active': isFocused }"
    >
      <div class="fader-track">
        <input
          :id="id"
          type="range"
          class="fader-input"
          :min="min"
          :max="max"
          :step="1 / 10 ** decimalPlaces"
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
        >
        <div
          class="fader-progress"
          :style="{ width: `${progressPercentage}%` }"
        />
      </div>
      <slot name="append" />
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

<script setup lang="ts">
import { ref, computed, useId } from 'vue'

interface Props {
  label?: string | null
  modelValue: number
  disabled?: boolean
  min?: number
  max?: number
  decimalPlaces?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: null,
  disabled: false,
  min: 0,
  max: 100,
  decimalPlaces: 0,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  'change': [value: number]
}>()

const isFocused = ref(false)
const id = useId()
const labelId = useId()

const progressPercentage = computed((): number => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100
})

const roundedValue = computed((): string => {
  return props.modelValue.toFixed(props.decimalPlaces)
})

const updateValue = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const value = Number(target.value)
  emit('update:modelValue', value)
  emit('change', value)
}

const updateTextValue = (textValue: string | number): void => {
  const value = Number(textValue)
  emit('update:modelValue', value)
  emit('change', value)
}

const handleFocus = (): void => {
  isFocused.value = true
}

const handleBlur = (): void => {
  isFocused.value = false
}
</script>

<style lang="scss">
@use "~/variables" as vars;

@mixin slider-thumb {
  appearance: none;
  width: 0.5rem;
  height: 1.25rem;
  border-radius: 0;
  background: var(--color-dark);
  border: 1px solid var(--color-light);
  transition: all 0.2s ease;
  z-index: 100;
}

@mixin slider-thumb-hover {
  border: 1px solid var(--color-highlight);
}

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

    &::-moz-range-thumb {
      @include slider-thumb;
    }
  }

  &:not(.disabled) &-input:hover {
    cursor: pointer;

    &::-moz-range-thumb {
      @include slider-thumb-hover;
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

// Webkit one has to go down here for some reason
.fader-input::-webkit-slider-thumb {
  @include slider-thumb;

  transform: translateY(-1px);
}

.fader:not(.disabled) .fader-input:hover::-webkit-slider-thumb {
  @include slider-thumb-hover;
}
</style>
