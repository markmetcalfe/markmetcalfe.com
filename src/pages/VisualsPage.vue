<template>
  <PageCard v-show="!isFullscreen" back-button-page="/">
    <template #title>3D Visuals</template>

    <div class="visualspage">
      <div class="visualspage-buttons">
        <LinkButton text="Randomise" @click="visualsStore.randomise">
          <font-awesome-icon icon="fas fa-dice" />
        </LinkButton>
        <LinkButton href="/visuals/shapes" text="Edit Shapes">
          <inline-svg src="/favicon.svg" />
        </LinkButton>
        <LinkButton
          v-if="!isMobile()"
          text="Fullscreen"
          @click="requestFullscreen"
        >
          <font-awesome-icon icon="fas fa-play" />
        </LinkButton>
      </div>

      <div class="visualspage-settings">
        <div class="visualspage-toggles">
          <ToggleSwitch
            :model-value="visualsStore.beatMatch.enabled"
            label="Beat Matching"
            @update:model-value="visualsStore.setBeatMatchEnabled"
          />

          <ToggleSwitch
            v-if="!isMobile()"
            v-model="visualsStore.followCursor"
            label="Follow Cursor"
          />
        </div>

        <div class="visualspage-toggles">
          <ToggleSwitch
            v-model="visualsStore.beatMatch.syncToBar"
            :disabled="!visualsStore.beatMatch.enabled"
            label="Sync To Bar"
          />

          <ToggleSwitch
            v-model="visualsStore.beatMatch.randomizeColors"
            :disabled="!visualsStore.beatMatch.enabled"
            label="Colour Changes"
          />
        </div>

        <BpmFader :disabled="!visualsStore.beatMatch.enabled" />

        <DropdownSelect
          v-model="visualsStore.autoZoom.mode"
          :options="autoZoomOptions"
          label="Auto Zoom Mode"
        />

        <FaderInput
          v-model="visualsStore.zoom.current"
          :min="-10"
          :max="20"
          :decimal-places="2"
          label="Current Zoom"
        />

        <FaderInput
          v-model="visualsStore.zoom.min"
          :disabled="autoZoomDisabled"
          :min="-10"
          :max="20"
          label="Min Zoom"
        />

        <FaderInput
          v-model="visualsStore.zoom.max"
          :disabled="autoZoomDisabled"
          :min="-10"
          :max="20"
          label="Max Zoom"
        />

        <FaderInput
          :model-value="visualsStore.autoZoom.speed * 1000"
          :disabled="!autoZoomIsSmooth"
          :min="0"
          :max="100"
          label="Zoom Speed"
          @update:model-value="
            (value: number) => (visualsStore.autoZoom.speed = value / 1000)
          "
        />

        <FaderInput
          v-model="visualsStore.rotationSpeed.x"
          :min="0"
          :max="100"
          :label="isMobile() ? 'X Rotation' : 'X-Axis Rotation Speed'"
        />

        <FaderInput
          v-model="visualsStore.rotationSpeed.y"
          :min="0"
          :max="100"
          :label="isMobile() ? 'Y Rotation' : 'Y-Axis Rotation Speed'"
        />
      </div>

      <GridList
        v-if="!isMobile()"
        class="visualspage-footnote"
        :items="[
          'Scroll to Zoom In & Out',
          'Click to Randomise Shapes',
          'Space to Beatmatch BPM',
          'Shift to Change Colours',
        ]"
      />
    </div>
  </PageCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import PageCard from '../components/PageCard.vue'
import { isMobile } from 'is-mobile'
import { AutoZoomMode, useVisualsStore } from '../stores/visuals'
import GridList from '../components/GridList.vue'
import LinkButton from '../components/LinkButton.vue'
import ToggleSwitch from '../components/ToggleSwitch.vue'
import FaderInput from '../components/FaderInput.vue'
import BpmFader from '../components/BpmFader.vue'
import DropdownSelect from '../components/DropdownSelect.vue'
import { useSiteStore } from '../stores/site'

const siteStore = useSiteStore()
const visualsStore = useVisualsStore()

const isFullscreen = ref(false)

const autoZoomOptions = computed(() => {
  const options = visualsStore.beatMatch.enabled
    ? Object.values(AutoZoomMode)
    : [AutoZoomMode.DISABLED, AutoZoomMode.SMOOTH]
  return options.map(value => ({
    value,
    label: value,
  }))
})

const autoZoomDisabled = computed(() => {
  return visualsStore.autoZoom.mode === AutoZoomMode.DISABLED
})

const autoZoomIsSmooth = computed(() => {
  return visualsStore.autoZoom.mode === AutoZoomMode.SMOOTH
})

const requestFullscreen = (): void => {
  document.body.requestFullscreen()
}

const fullscreenEvent = (): void => {
  const dynamicBackground = document.querySelector(
    '.dynamicbackground',
  ) as HTMLElement

  if (isFullscreen.value) {
    isFullscreen.value = false
    document.body.style.cursor = ''
    dynamicBackground.style.cursor = ''
  } else {
    isFullscreen.value = true
    document.body.style.cursor = 'none'
    dynamicBackground.style.cursor = 'none'
  }
}

onMounted(() => {
  siteStore.hideBackgroundIfMobile()
  document.addEventListener('fullscreenchange', fullscreenEvent)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', fullscreenEvent)
  document.body.style.cursor = 'auto'
})
</script>

<style lang="scss">
@use '../variables' as vars;

.visualspage {
  &-buttons,
  &-toggles {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }

  &-buttons {
    margin-bottom: 1rem;
  }

  &-settings {
    & > * {
      padding: 0.5rem 0;
    }
  }

  &-footnote {
    padding-top: 1.5rem;
  }
}
</style>
