<template>
  <div class="toggleswitch" :class="{ disabled: disabled }">
    <label v-if="label" class="toggleswitch__label" :for="id">{{
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
      <span :id="labelId" class="sr-only">{{ label }}</span>
      <div class="toggleswitch__track">
        <div class="toggleswitch__thumb"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, useId } from 'vue'

export default defineComponent({
  name: 'ToggleSwitch',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
  },

  emits: ['update:modelValue', 'change'],

  data() {
    return {
      id: useId(),
      labelId: useId(),
    }
  },

  methods: {
    toggle() {
      if (this.disabled) return

      const newValue = !this.modelValue
      this.$emit('update:modelValue', newValue)
      this.$emit('change', newValue)
    },
  },
})
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

  &__track {
    position: relative;
    width: 3rem;
    height: 1.5rem;
    background: none;
    border: var(--color-light) 1px solid;
    transition: background-color 0.3s;
  }

  &__thumb {
    position: absolute;
    top: 0.25rem;
    left: 0.25rem;
    width: 1rem;
    height: 1rem;
    background-color: var(--color-light);
    transition: transform 0.3s;
  }

  &--active &__track {
    background-color: var(--color-highlight);
  }

  &--active &__thumb {
    transform: translateX(1.5rem);
  }
}
</style>
