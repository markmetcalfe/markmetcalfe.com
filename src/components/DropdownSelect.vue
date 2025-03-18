<template>
  <div class="dropdownselect" :class="{ disabled: disabled }">
    <label v-if="label" :id="labelId" class="dropdownselect-label" :for="id">{{
      label
    }}</label>
    <div
      :id="id"
      ref="dropdownContainer"
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
        ref="optionsList"
        class="dropdownselect-options-list"
        :class="{ 'dropdownselect-options-list--up': showAbove }"
        role="listbox"
        :aria-labelledby="labelId"
        tabindex="-1"
      >
        <li
          v-for="option in options"
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
    maxHeight: {
      type: Number,
      default: 300,
    },
  },

  emits: ['update:modelValue', 'change'],

  data() {
    return {
      isOpen: false,
      selectedOption: null,
      id: useId(),
      labelId: useId(),
      listboxId: useId(),
      showAbove: false,
    }
  },

  watch: {
    modelValue: {
      immediate: true,
      handler(newValue) {
        this.selectedOption =
          this.options.find(option => option.value === newValue) ??
          this.options[0]
      },
    },
    options: {
      immediate: true,
      handler(newOptions) {
        if (this.selectedOption) {
          this.selectedOption =
            newOptions.find(
              option => option.value === this.selectedOption.value,
            ) ?? newOptions[0]
        } else {
          this.selectedOption = newOptions[0]
        }
      },
    },
    isOpen(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.checkPosition()
          window.addEventListener('scroll', this.checkPosition)
          window.addEventListener('resize', this.checkPosition)
        })
      } else {
        window.removeEventListener('scroll', this.checkPosition)
        window.removeEventListener('resize', this.checkPosition)
      }
    },
  },

  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },

  unmounted() {
    document.removeEventListener('click', this.handleClickOutside)
    window.removeEventListener('scroll', this.checkPosition)
    window.removeEventListener('resize', this.checkPosition)
  },

  methods: {
    toggleDropdown() {
      if (this.disabled || this.options.length < 2) {
        return
      }

      this.isOpen = !this.isOpen
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

    checkPosition() {
      if (!this.$refs.optionsList || !this.$refs.dropdownContainer) return

      const optionsList = this.$refs.optionsList
      const container = this.$refs.dropdownContainer
      const rect = container.getBoundingClientRect()

      // Calculate available space
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top

      // Get the current height of the options list
      const listHeight = optionsList.scrollHeight

      // Limit the height to maxHeight
      const effectiveHeight = Math.min(listHeight, this.maxHeight)

      // Determine if we should show above or below
      if (spaceBelow < effectiveHeight && spaceAbove > spaceBelow) {
        this.showAbove = true
        optionsList.style.maxHeight = `${Math.min(spaceAbove, this.maxHeight)}px`
      } else {
        this.showAbove = false
        optionsList.style.maxHeight = `${Math.min(spaceBelow, this.maxHeight)}px`
      }

      // Check if we need horizontal adjustment
      const rightEdge = rect.left + optionsList.offsetWidth
      if (rightEdge > window.innerWidth) {
        const overflow = rightEdge - window.innerWidth
        optionsList.style.left = `-${overflow}px`
      } else {
        optionsList.style.left = '0'
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
  flex: auto;

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
    white-space: nowrap;
    overflow-x: hidden;
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
    position: absolute;

    @include vars.desktop-only {
      right: 0.5rem;
    }

    @include vars.mobile-only {
      right: 0.25rem;
    }
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
    overflow-y: auto;
    background: var(--color-dark);
    z-index: 10;

    &--up {
      top: auto;
      bottom: 100%;
      border-top: 1px solid var(--color-highlight);
      border-bottom: none;
    }
  }

  &-option {
    padding: 0.5rem;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      color: var(--color-dark);
      background-color: var(--color-highlight);
    }
  }
}
</style>
