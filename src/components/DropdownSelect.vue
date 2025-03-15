<template>
  <div class="dropdownselect" :class="{ disabled: disabled }">
    <label v-if="label" :id="labelId" class="dropdownselect-label" :for="id">{{
      label
    }}</label>
    <div
      :id="id"
      class="dropdownselect-container"
      :class="{
        'dropdownselect--active': isOpen,
        'dropdownselect--one': options.length < 2,
      }"
      tabindex="0"
      role="combobox"
      :aria-disabled="disabled"
      :aria-controls="listboxId"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @keydown.space.prevent="toggleDropdown"
      @keydown.enter.prevent="toggleDropdown"
    >
      <div class="dropdownselect-selected-option" @click="toggleDropdown">
        <span>{{ selectedOption ? selectedOption.label : placeholder }}</span>
        <span class="dropdownselect-arrow"
          ><font-awesome-icon icon="fas fa-caret-down"
        /></span>
      </div>

      <ul
        v-if="isOpen"
        :id="listboxId"
        class="dropdownselect-options-list"
        role="listbox"
        :aria-labelledby="labelId"
        tabindex="-1"
      >
        <li
          v-for="option in options.filter(
            o => o.value !== selectedOption?.value,
          )"
          :key="option.value"
          class="dropdownselect-option"
          role="option"
          @click="selectOption(option)"
          @keydown.space.prevent="selectOption(option)"
          @keydown.enter.prevent="selectOption(option)"
        >
          {{ option.label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { useId } from 'vue'

export default {
  name: 'DropdownSelect',

  props: {
    options: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: [String, Number, Object, Function],
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: 'Select an option',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:modelValue', 'change'],

  data() {
    return {
      isOpen: false,
      selectedOption: null,
      selectedOptionIndex: 0,
      id: useId(),
      labelId: useId(),
      listboxId: useId(),
    }
  },

  watch: {
    modelValue: {
      immediate: true,
      handler(newValue) {
        const newOption = this.options.find(option => option.value === newValue)
        const index = newOption
          ? this.options.indexOf(newOption)
          : Math.max(this.selectedOptionIndex - 1, 0)
        this.selectedOption = this.options[index]
        this.selectedOptionIndex = index
      },
    },
    options: {
      immediate: true,
      handler(newOptions) {
        const existingOption = newOptions.find(
          option => option.value === this.selectedOption,
        )
        const index = existingOption
          ? this.options.indexOf(existingOption)
          : Math.max(this.selectedOptionIndex - 1, 0)
        this.selectedOption = this.options[index]
        this.selectedOptionIndex = index
      },
    },
  },

  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },

  unmounted() {
    document.removeEventListener('click', this.handleClickOutside)
  },

  methods: {
    toggleDropdown() {
      if (this.options.length > 1) {
        this.isOpen = !this.isOpen
      }
    },

    selectOption(option) {
      this.selectedOption = option
      this.isOpen = false
      this.$emit('update:modelValue', option.value)
      this.$emit('change', option.value)
    },

    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.isOpen = false
      }
    },
  },
}
</script>

<style lang="scss">
@use '../variables' as vars;

.dropdownselect {
  display: flex;
  align-items: center;

  &-container {
    position: relative;
    width: 100%;
  }

  &-label {
    margin-right: 0.5rem;
    white-space: nowrap;
  }

  &-selected-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border: 1px solid var(--color-light);
    cursor: pointer;
    user-select: none;
  }

  &--one &-selected-option {
    cursor: auto;
  }

  &--active &-selected-option {
    border: 1px solid var(--color-highlight);
  }

  &-arrow {
    margin: 0 0.25rem;
    transition: all 0.2s ease;
  }

  &--one &-arrow {
    display: none;
  }

  &--active &-arrow {
    color: var(--color-highlight);
    transform: rotate(180deg);
  }

  &-options-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin: 0;
    padding: 0;
    list-style: none;
    text-align: left;
    border: 1px solid var(--color-highlight);
    border-top: none;
    max-height: 40vh;
    overflow-y: auto;
    background: var(--color-dark);
    z-index: 10;
  }

  &-option {
    padding: 0.5rem;
    cursor: pointer;

    &:hover {
      color: var(--color-dark);
      background-color: var(--color-highlight);
    }
  }
}
</style>
