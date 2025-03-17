<template>
  <Fader
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
  </Fader>
</template>

<script setup lang="ts">
import { useSiteStore } from '../stores/site'
import Fader from './Fader.vue'

const siteStore = useSiteStore()

defineProps({
  disabled: Boolean,
})
</script>

<style lang="scss">
@use '../variables' as vars;

.bpmfader {
  &-tap {
    color: var(--color-light);
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
