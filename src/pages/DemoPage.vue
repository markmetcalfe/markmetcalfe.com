<template>
  <PageCard v-show="!isFullscreen" back-button-page="/">
    <template #title>3D Demo</template>

    <div class="demopage">
      <p class="desktop-only">Scroll to zoom in and out</p>
      <p class="desktop-only">Click to randomise the state</p>
      <p class="mobile-only">View this on desktop for more options</p>

      <div class="demopage-settings">
        <v-switch
          v-model="settings.followCursor"
          class="desktop-only"
          label="Follow Cursor"
          color="#00ff00"
          inset
          hide-details
        ></v-switch>

        <v-switch
          v-model="settings.autoZoom.enabled"
          label="Auto Zoom"
          color="#00ff00"
          inset
          hide-details
        ></v-switch>

        <v-slider
          v-show="autoZoomEnabled"
          v-model="settings.zoom.min"
          color="#00ff00"
          class="align-center"
          :min="-10"
          :max="20"
          hide-details
        >
          <template #prepend>
            <label for="settings-zoom-min">Min Zoom</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-zoom-min"
              v-model="settings.zoom.min"
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
          v-model="settings.zoom.max"
          color="#00ff00"
          class="align-center"
          :min="-10"
          :max="20"
          hide-details
        >
          <template #prepend>
            <label for="settings-zoom-max">Max Zoom</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-zoom-max"
              v-model="settings.zoom.max"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
            ></v-text-field>
          </template>
        </v-slider>

        <v-slider
          v-model="settings.zoom.current"
          color="#00ff00"
          class="align-center"
          :min="-10"
          :max="20"
          hide-details
        >
          <template #prepend>
            <label for="settings-zoom-current">Current Zoom</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-zoom-current"
              v-model="settings.zoom.current"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
            ></v-text-field>
          </template>
        </v-slider>

        <v-slider
          v-model="settings.randomisation.bpm"
          color="#00ff00"
          class="align-center"
          :min="0"
          :max="200"
          hide-details
        >
          <template #prepend>
            <label for="settings-randomisation-bpm">BPM</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-randomisation-bpm"
              v-model="settings.randomisation.bpm"
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
        class="desktop-only"
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
import { useRendererSettingsStore } from '../stores/renderer-settings'

export default defineComponent({
  name: 'DemoPage',
  components: { PageCard },

  data() {
    const store = storeToRefs(useRendererSettingsStore())

    return {
      isFullscreen: false,
      settings: store,
    }
  },

  computed: {
    autoZoomEnabled(): boolean {
      const store = useRendererSettingsStore()
      return store.autoZoom.enabled
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

  @include desktop-only {
    min-width: 500px;
  }

  @include mobile-only {
    min-width: calc(95vw - 1rem);
  }
}
</style>
