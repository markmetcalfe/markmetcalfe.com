<template>
  <div
    class="toggleswitch"
    :class="{ disabled: disabled }"
  >
    <label
      v-if="label"
      class="toggleswitch__label"
      :for="id"
    >{{
      label
    }}</label>
    <div
      :id="id"
      class="toggleswitch__switch"
      :class="{
        'toggleswitch--active': modelValue,
      }"
      tabindex="0"
      role="checkbox"
      :aria-checked="modelValue"
      :aria-disabled="disabled"
      :aria-labelledby="labelId"
      @click="toggle"
      @keydown.space.prevent="toggle"
      @keydown.enter.prevent="toggle"
    >
      <span
        :id="labelId"
        class="sr-only"
      >{{ label }}</span>
      <div class="toggleswitch-track">
        <div class="toggleswitch-thumb" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'

interface Props {
  modelValue?: boolean
  disabled?: boolean
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  label: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'change': [value: boolean]
}>()

const id = useId()
const labelId = useId()

const toggle = () => {
  if (props.disabled) return
  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<style lang="scss">
.toggleswitch {
  display: flex;
  align-items: center;

  &__switch {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  &__label {
    margin-right: 0.5rem;
    white-space: nowrap;
  }

  &-track {
    position: relative;
    width: 3rem;
    height: 1.5rem;
    background-color: var(--color-dark);
    border: var(--color-light) 1px solid;
    transition: background-color 0.3s;
  }

  &-thumb {
    position: absolute;
    top: 0.25rem;
    left: 0.25rem;
    width: 1rem;
    height: 1rem;
    background-color: var(--color-light);
    transition: transform 0.3s;
  }

  &--active &-track {
    background-color: var(--color-highlight);
  }

  &--active &-thumb {
    transform: translateX(1.5rem);
  }
}
</style>
