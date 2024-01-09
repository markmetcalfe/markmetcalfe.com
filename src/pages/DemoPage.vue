<template>
  <PageCard v-show="!isFullscreen" back-button-page="/">
    <template #title>3D Demo</template>

    <div class="demopage">
      <p>Scroll to zoom in and out</p>
      <p>Click to randomise the state</p>

      <div class="demopage-settings">
        <v-switch
          v-model="settings.followCursor"
          label="Follow Cursor"
          color="#00ff00"
          inset
          hide-details
        ></v-switch>

        <v-switch
          v-model="settings.autoZoom"
          label="Auto Zoom"
          color="#00ff00"
          inset
          hide-details
        ></v-switch>

        <v-slider
          v-show="autoZoomEnabled"
          v-model="settings.minZoom"
          color="#00ff00"
          class="align-center"
          :min="-10"
          :max="20"
          hide-details
        >
          <template #prepend>
            <label for="settings-min-zoom">Min Zoom</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-min-zoom"
              v-model="settings.minZoom"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
            ></v-text-field>
          </template>
        </v-slider>

        <v-slider
          v-show="autoZoomEnabled"
          v-model="settings.maxZoom"
          color="#00ff00"
          class="align-center"
          :min="-10"
          :max="20"
          hide-details
        >
          <template #prepend>
            <label for="settings-min-zoom">Max Zoom</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-max-zoom"
              v-model="settings.maxZoom"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
            ></v-text-field>
          </template>
        </v-slider>

        <v-slider
          v-model="settings.currentZoom"
          color="#00ff00"
          class="align-center"
          :min="-10"
          :max="20"
          hide-details
        >
          <template #prepend>
            <label for="settings-current-zoom">Current Zoom</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-current-zoom"
              v-model="settings.currentZoom"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
            ></v-text-field>
          </template>
        </v-slider>

        <v-slider
          v-model="settings.randomisationPerMinute"
          color="#00ff00"
          class="align-center"
          :min="0"
          :max="200"
          hide-details
        >
          <template #prepend>
            <label for="settings-bpm">BPM</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-bpm"
              v-model="settings.randomisationPerMinute"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
            ></v-text-field>
          </template>
        </v-slider>
      </div>

      <v-btn
        color="#00ff00"
        variant="flat"
        size="large"
        @click="requestFullscreen"
        >Fullscreen</v-btn
      >
    </div>
  </PageCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageCard from '../components/PageCard.vue'
import { storeToRefs } from 'pinia'
import {
  RendererSettings,
  useRendererSettingsStore,
} from '../stores/renderer-settings'
import { Ref } from 'vue'

export default defineComponent({
  name: 'DemoPage',
  components: { PageCard },

  data(): { isFullscreen: boolean; settings: Ref<RendererSettings> } {
    const { settings } = storeToRefs(useRendererSettingsStore())

    return {
      isFullscreen: false,
      settings,
    }
  },

  computed: {
    autoZoomEnabled() {
      const { settings } = useRendererSettingsStore()
      return settings.autoZoom
    },
  },

  mounted() {
    document.addEventListener('fullscreenchange', () => this.fullscreenEvent())
  },

  unmounted() {
    document.removeEventListener('fullscreenchange', () =>
      this.fullscreenEvent(),
    )
    document.body.style.cursor = 'auto'
  },

  methods: {
    requestFullscreen() {
      document.body.requestFullscreen()
    },

    fullscreenEvent() {
      if (this.isFullscreen) {
        this.isFullscreen = false
        document.body.style.cursor = 'auto'
      } else {
        this.isFullscreen = true
        document.body.style.cursor = 'none'
      }
    },
  },
})
</script>

<style lang="scss">
@import '../variables';

.demopage {
  &-settings {
    padding: 2rem 0;
  }

  & p {
    padding: 0.25rem 0;
  }

  & :first-child {
    padding-top: 0;
  }
}
</style>
