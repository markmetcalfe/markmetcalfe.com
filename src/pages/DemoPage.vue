<template>
  <PageCard v-show="!isFullscreen" back-button-page="/">
    <template #title>3D Demo</template>

    <div class="demopage">
      <p v-if="store.isMobile">View this on desktop for more options</p>

      <div class="demopage-buttons">
        <v-btn color="primary" variant="flat" @click="store.randomise"
          ><template #prepend>
            <v-icon><font-awesome-icon icon="fas fa-dice" /></v-icon> </template
          >Randomise</v-btn
        >
        <GeometryConfig v-slot="{ modalOpen }">
          <v-btn color="primary" variant="flat" v-bind="modalOpen"
            ><template #prepend>
              <v-icon
                ><font-awesome-icon icon="fas fa-shapes"
              /></v-icon> </template
            >Edit Shapes</v-btn
          >
        </GeometryConfig>
        <v-btn
          v-if="store.isDesktop"
          color="primary"
          variant="flat"
          @click="requestFullscreen"
          ><template #prepend>
            <v-icon><font-awesome-icon icon="fas fa-play" /></v-icon> </template
          >Fullscreen</v-btn
        >
      </div>

      <div class="demopage-settings">
        <v-switch
          v-if="store.isDesktop"
          v-model="settings.followCursor"
          label="Follow Cursor"
          color="primary"
          inset
          hide-details
        ></v-switch>

        <v-slider
          v-model="settings.randomisation.bpm"
          color="primary"
          class="align-center"
          :min="0"
          :max="200"
          hide-details
        >
          <template #prepend>
            <label for="settings-randomisation-bpm">BPM</label>
          </template>
          <template #append>
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              style="margin-right: 1rem"
              @click="store.tap"
              >Tap</v-btn
            >
            <v-text-field
              id="settings-randomisation-bpm"
              :model-value="settings.randomisation.bpm.toFixed(0)"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
              @update:model-value="
                (value: string) => (store.randomisation.bpm = parseFloat(value))
              "
            ></v-text-field>
          </template>
        </v-slider>

        <v-slider
          :model-value="settings.randomisation.minRotationSpeed"
          color="primary"
          class="align-center"
          :min="0"
          :max="100"
          :ripple="false"
          hide-details
          @update:model-value="store.setMinRotationSpeed"
        >
          <template #prepend>
            <label for="settings-randomisation-min-rotation-speed"
              >Min Rotation Speed</label
            >
          </template>
          <template #append>
            <v-text-field
              id="settings-randomisation-min-rotation-speed"
              :model-value="settings.randomisation.minRotationSpeed.toFixed(0)"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
              @update:model-value="
                (value: string) => store.setMinRotationSpeed(parseFloat(value))
              "
            ></v-text-field>
          </template>
        </v-slider>

        <v-slider
          :model-value="settings.randomisation.maxRotationSpeed.toFixed(2)"
          color="primary"
          class="align-center"
          :min="0"
          :max="100"
          :ripple="false"
          hide-details
          @update:model-value="store.setMaxRotationSpeed"
        >
          <template #prepend>
            <label for="settings-randomisation-max-rotation-speed"
              >Max Rotation Speed</label
            >
          </template>
          <template #append>
            <v-text-field
              id="settings-randomisation-max-rotation-speed"
              :model-value="settings.randomisation.maxRotationSpeed.toFixed(0)"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
              @update:model-value="
                (value: string) => store.setMaxRotationSpeed(parseFloat(value))
              "
            ></v-text-field>
          </template>
        </v-slider>

        <v-slider
          :model-value="settings.zoom.current"
          color="primary"
          class="align-center"
          :min="-10"
          :max="20"
          :ripple="false"
          hide-details
          @update:model-value="store.setCurrentZoom"
        >
          <template #prepend>
            <label for="settings-zoom-current">Current Zoom</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-zoom-current"
              :model-value="settings.zoom.current.toFixed(2)"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
              @update:model-value="
                (value: string) => store.setCurrentZoom(parseFloat(value))
              "
            ></v-text-field>
          </template>
        </v-slider>

        <v-select
          v-model="settings.autoZoom.mode"
          label="Select"
          :items="autoZoomOptions"
        >
          <template #prepend>
            <label>Auto Zoom Mode</label>
          </template></v-select
        >

        <v-slider
          :disabled="autoZoomDisabled"
          :model-value="settings.zoom.min"
          color="primary"
          class="align-center"
          :min="-10"
          :max="20"
          :ripple="false"
          hide-details
          @update:model-value="store.setMinZoom"
        >
          <template #prepend>
            <label for="settings-zoom-min">Min Zoom</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-zoom-min"
              :disabled="autoZoomDisabled"
              :model-value="settings.zoom.min.toFixed(2)"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
              @update:model-value="
                (value: string) => (store.zoom.min = parseFloat(value))
              "
            ></v-text-field>
          </template>
        </v-slider>

        <v-slider
          :disabled="autoZoomDisabled"
          :model-value="settings.zoom.max"
          color="primary"
          class="align-center"
          :min="-10"
          :max="20"
          :ripple="false"
          hide-details
          @update:model-value="store.setMaxZoom"
        >
          <template #prepend>
            <label for="settings-zoom-max">Max Zoom</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-zoom-max"
              :disabled="autoZoomDisabled"
              :model-value="settings.zoom.max.toFixed(2)"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
              @update:model-value="
                (value: string) => store.setMaxZoom(parseFloat(value))
              "
            ></v-text-field>
          </template>
        </v-slider>

        <v-slider
          :disabled="!autoZoomIsSmooth"
          :model-value="settings.autoZoom.speed * 1000"
          color="primary"
          class="align-center"
          :min="0"
          :max="100"
          hide-details
          @update:model-value="
            (value: number) => (store.autoZoom.speed = value / 1000)
          "
        >
          <template #prepend>
            <label for="settings-autozoom-speed">Zoom Speed</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-autozoom-speed"
              :disabled="!autoZoomIsSmooth"
              :model-value="(settings.autoZoom.speed * 1000).toFixed(0)"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
              @update:model-value="
                (value: string) =>
                  (store.autoZoom.speed = parseFloat(value) / 1000)
              "
            ></v-text-field>
          </template>
        </v-slider>
      </div>

      <p v-if="store.isDesktop">Scroll to zoom in and out</p>
      <p v-if="store.isDesktop">
        When fullscreen, click to beatmatch the randomisation
      </p>
    </div>
  </PageCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import GeometryConfig from '../components/GeometryConfig.vue'
import PageCard from '../components/PageCard.vue'
import { storeToRefs } from 'pinia'
import {
  AutoZoomMode,
  useRendererSettingsStore,
} from '../stores/renderer-settings'

export default defineComponent({
  name: 'DemoPage',
  components: { GeometryConfig, PageCard },

  data() {
    const store = storeToRefs(useRendererSettingsStore())

    return {
      isFullscreen: false,
      settings: store,
    }
  },

  computed: {
    store() {
      return useRendererSettingsStore()
    },

    autoZoomOptions() {
      return Object.values(AutoZoomMode)
    },
    autoZoomDisabled() {
      return this.store.autoZoom.mode === AutoZoomMode.DISABLED
    },
    autoZoomIsSmooth() {
      return this.store.autoZoom.mode === AutoZoomMode.SMOOTH
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
      document.getElementById('ga-insta-link')?.remove()
    },
  },
})
</script>

<style lang="scss">
@import '../variables';

.demopage {
  & > * {
    padding: 0.5rem 0;
  }

  & > *:first-child {
    padding-top: 0;
  }

  & > *:last-child {
    padding-bottom: 0;
  }

  &-settings {
    padding-bottom: 1.5rem;
  }

  &-buttons {
    display: flex;
    flex: none;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  @include desktop-only {
    min-width: 500px;
  }

  @include mobile-only {
    min-width: calc(95vw - 1rem);
  }
}
</style>
