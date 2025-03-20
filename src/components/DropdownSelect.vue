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

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, useId } from 'vue'

export interface Option {
  label: string
  value: string | number
}

interface Props {
  options: Option[]
  modelValue?: string | number | null
  label?: string | null
  placeholder?: string
  disabled?: boolean
  maxHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: null,
  placeholder: 'Select an option',
  disabled: false,
  maxHeight: 300,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number]
}>()

const isOpen = ref(false)
const selectedOption = ref<Option | null>(null)
const id = useId()
const labelId = useId()
const listboxId = useId()
const showAbove = ref(false)
const dropdownContainer = ref<HTMLElement | null>(null)
const optionsList = ref<HTMLElement | null>(null)

watch(
  () => props.modelValue,
  newValue => {
    selectedOption.value =
      props.options.find(option => option.value === newValue) ??
      props.options[0] ??
      null
  },
  { immediate: true },
)

watch(
  () => props.options,
  newOptions => {
    if (selectedOption.value) {
      selectedOption.value =
        newOptions.find(
          option => option.value === selectedOption.value?.value,
        ) ??
        newOptions[0] ??
        null
    } else {
      selectedOption.value = newOptions[0] ?? null
    }
  },
  { immediate: true },
)

watch(isOpen, newVal => {
  if (newVal) {
    nextTick(() => {
      checkPosition()
      window.addEventListener('scroll', checkPosition)
      window.addEventListener('resize', checkPosition)
    })
  } else {
    window.removeEventListener('scroll', checkPosition)
    window.removeEventListener('resize', checkPosition)
  }
})

const toggleDropdown = () => {
  if (props.disabled || props.options.length < 2) {
    return
  }
  isOpen.value = !isOpen.value
}

const selectOption = (option: Option) => {
  selectedOption.value = option
  isOpen.value = false
  emit('update:modelValue', option.value)
  emit('change', option.value)
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (dropdownContainer.value && !dropdownContainer.value.contains(target)) {
    isOpen.value = false
  }
}

const checkPosition = () => {
  if (!optionsList.value || !dropdownContainer.value) return

  const optionsListEl = optionsList.value
  const container = dropdownContainer.value
  const rect = container.getBoundingClientRect()

  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  const listHeight = optionsListEl.scrollHeight

  const effectiveHeight = Math.min(listHeight, props.maxHeight)

  if (spaceBelow < effectiveHeight && spaceAbove > spaceBelow) {
    showAbove.value = true
    optionsListEl.style.maxHeight = `${Math.min(spaceAbove, props.maxHeight)}px`
  } else {
    showAbove.value = false
    optionsListEl.style.maxHeight = `${Math.min(spaceBelow, props.maxHeight)}px`
  }

  const rightEdge = rect.left + optionsListEl.offsetWidth
  if (rightEdge > window.innerWidth) {
    const overflow = rightEdge - window.innerWidth
    optionsListEl.style.left = `-${overflow}px`
  } else {
    optionsListEl.style.left = '0'
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', checkPosition)
  window.removeEventListener('resize', checkPosition)
})
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
