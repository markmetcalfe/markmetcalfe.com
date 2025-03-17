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
            :model-value="settings.beatMatch.enabled"
            label="Beat Matching"
            @update:model-value="visualsStore.setBeatMatchEnabled"
          />

          <ToggleSwitch
            v-if="!isMobile()"
            v-model="settings.followCursor"
            label="Follow Cursor"
          />
        </div>

        <div class="visualspage-toggles">
          <ToggleSwitch
            v-model="settings.beatMatch.syncToBar"
            :disabled="!settings.beatMatch.enabled"
            label="Sync To Bar"
          />

          <ToggleSwitch
            v-model="settings.beatMatch.randomizeColors"
            :disabled="!settings.beatMatch.enabled"
            label="Colour Changes"
          />
        </div>

        <BpmFader :disabled="!settings.beatMatch.enabled" />

        <DropdownSelect
          v-model="settings.autoZoom.mode"
          :options="autoZoomOptions"
          label="Auto Zoom Mode"
        />

        <Fader
          v-model="settings.zoom.current"
          :min="-10"
          :max="20"
          :decimal-places="2"
          label="Current Zoom"
        />

        <Fader
          v-model="settings.zoom.min"
          :disabled="autoZoomDisabled"
          :min="-10"
          :max="20"
          label="Min Zoom"
        />

        <Fader
          v-model="settings.zoom.max"
          :disabled="autoZoomDisabled"
          :min="-10"
          :max="20"
          label="Max Zoom"
        />

        <Fader
          :model-value="settings.autoZoom.speed * 1000"
          :disabled="!autoZoomIsSmooth"
          :min="0"
          :max="100"
          label="Zoom Speed"
          @update:model-value="
            (value: number) => (visualsStore.autoZoom.speed = value / 1000)
          "
        />

        <Fader
          v-model="settings.rotationSpeed.x"
          :min="0"
          :max="100"
          :label="isMobile() ? 'X Rotation' : 'X-Axis Rotation Speed'"
        />

        <Fader
          v-model="settings.rotationSpeed.y"
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

<script lang="ts">
import { defineComponent } from 'vue'
import PageCard from '../components/PageCard.vue'
import { isMobile } from 'is-mobile'
import { storeToRefs } from 'pinia'
import { AutoZoomMode, useVisualsStore } from '../stores/visuals'
import GridList from '../components/GridList.vue'
import LinkButton from '../components/LinkButton.vue'
import ToggleSwitch from '../components/ToggleSwitch.vue'
import Fader from '../components/Fader.vue'
import BpmFader from '../components/BpmFader.vue'
import DropdownSelect from '../components/DropdownSelect.vue'
import { useSiteStore } from '../stores/site'

export default defineComponent({
  name: 'VisualsPage',
  components: {
    GridList,
    PageCard,
    LinkButton,
    ToggleSwitch,
    Fader,
    BpmFader,
    DropdownSelect,
  },

  data() {
    const store = storeToRefs(useVisualsStore())

    return {
      isFullscreen: false,
      settings: store,
    }
  },

  computed: {
    siteStore() {
      return useSiteStore()
    },
    visualsStore() {
      return useVisualsStore()
    },

    autoZoomOptions() {
      const options = this.visualsStore.beatMatch.enabled
        ? Object.values(AutoZoomMode)
        : [AutoZoomMode.DISABLED, AutoZoomMode.SMOOTH]
      return options.map(value => ({
        value,
        label: value,
      }))
    },
    autoZoomDisabled() {
      return this.visualsStore.autoZoom.mode === AutoZoomMode.DISABLED
    },
    autoZoomIsSmooth() {
      return this.visualsStore.autoZoom.mode === AutoZoomMode.SMOOTH
    },
  },

  mounted() {
    this.siteStore.hideBackgroundIfMobile()
    document.addEventListener('fullscreenchange', () => this.fullscreenEvent())
  },

  unmounted() {
    document.removeEventListener('fullscreenchange', () =>
      this.fullscreenEvent(),
    )
    document.body.style.cursor = 'auto'
  },

  methods: {
    isMobile,

    requestFullscreen() {
      document.body.requestFullscreen()
    },

    fullscreenEvent() {
      const dynamicBackground = document.querySelector(
        '.dynamicbackground',
      ) as HTMLElement
      if (this.isFullscreen) {
        this.isFullscreen = false
        document.body.style.cursor = ''
        dynamicBackground.style.cursor = ''
      } else {
        this.isFullscreen = true
        document.body.style.cursor = 'none'
        dynamicBackground.style.cursor = 'none'
      }
    },
  },
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
