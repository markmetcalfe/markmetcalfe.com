<template>
  <FaderInput
    :model-value="siteStore.beatMatch.bpm"
    :disabled="disabled"
    :min="0"
    :max="200"
    label="BPM"
    @update:model-value="siteStore.updateBpm"
  >
    <template #append>
      <button
        class="bpmfader-tap"
        :disabled="disabled"
        @click="siteStore.tapBpm"
      >
        Tap
      </button>
    </template>
  </FaderInput>
</template>

<script setup lang="ts">
import { useSiteStore } from '../stores/site'
import FaderInput from './FaderInput.vue'

const siteStore = useSiteStore()

interface Props {
  disabled?: boolean
}

defineProps<Props>()
</script>

<style lang="scss">
@use '../variables' as vars;

.bpmfader {
  &-tap {
    color: var(--color-light);
    background-color: var(--color-dark);
    border: var(--color-light) 1px solid;
    padding: 0.25rem 0.4rem;
    margin-right: 0.5rem;

    &:hover:not(:disabled) {
      color: var(--color-highlight);
      border: var(--color-highlight) 1px solid;
    }
  }
}
</style>
