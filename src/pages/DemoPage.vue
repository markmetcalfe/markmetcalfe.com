<template>
  <PageCard v-show="showSettings" back-button-page="/">
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

      <p>Press <code>Esc</code> to show and hide these settings</p>
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

  data(): { showSettings: boolean; settings: Ref<RendererSettings> } {
    const { settings } = storeToRefs(useRendererSettingsStore())

    return {
      showSettings: true,
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
    document.addEventListener('keyup', e => this.toggleSettingsOnKey(e))
  },

  unmounted() {
    document.removeEventListener('keyup', e => this.toggleSettingsOnKey(e))
    document.body.style.cursor = 'auto'
  },

  methods: {
    toggleSettingsOnKey(event: KeyboardEvent) {
      if (event.code === 'Escape') {
        this.showSettings = !this.showSettings
        document.body.style.cursor = this.showSettings ? 'auto' : 'none'
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
