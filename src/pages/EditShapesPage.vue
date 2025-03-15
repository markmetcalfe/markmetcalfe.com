<template>
  <PageCard
    back-button-page="/visuals"
    :background-opacity="isMobile() ? 0.5 : 1"
  >
    <template #title>Edit Shapes</template>

    <DropdownSelect v-model="selectedShape" :options="geometryItems" />

    <div class="editshapes-settings">
      <DropdownSelect
        label="Type"
        :model-value="config[selectedShape].type.getName()"
        :options="geometryTypes"
        @change="setShapeType"
      />

      <TextField v-model="config[selectedShape].color" label="Colour" />

      <div class="editshapes-toggles">
        <ToggleSwitch v-model="config[selectedShape].solid" label="Solid" />

        <ToggleSwitch
          v-model="config[selectedShape].reverseRotation"
          label="Reverse Rotation"
        />
      </div>

      <TextField
        label="Radius"
        type="number"
        :model-value="config[selectedShape].radius.toFixed(0)"
        @update:model-value="
          (radius: string) =>
            (config[selectedShape].radius = parseFloat(radius))
        "
      />

      <TextField
        v-model="config[selectedShape].detail"
        label="Detail"
        type="number"
      />
    </div>

    <div class="editshapes-buttons">
      <LinkButton text="Add" icon="fa-solid fa-plus" @click="addShape" />
      <LinkButton
        v-if="store.geometryConfig.length > 1"
        text="Delete"
        icon="fa-solid fa-trash"
        @click="deleteShape"
      />
      <LinkButton text="Save" icon="fa-regular fa-floppy-disk" @click="save" />
    </div>
  </PageCard>
</template>

<script lang="ts">
import PageCard from '../components/PageCard.vue'
import { defineComponent } from 'vue'
import { useVisualSettingsStore } from '../stores/visual-settings'
import {
  GeometryAttributes,
  geometryClasses,
  getGeometryClassFromName,
} from '../3d/geometry'
import { getColorName } from '../util/color'
import { isMobile } from 'is-mobile'
import LinkButton from '../components/LinkButton.vue'
import ToggleSwitch from '../components/ToggleSwitch.vue'
import DropdownSelect from '../components/DropdownSelect.vue'
import TextField from '../components/TextField.vue'

export default defineComponent({
  name: 'EditShapesPage',
  components: { PageCard, LinkButton, ToggleSwitch, TextField, DropdownSelect },

  data() {
    return {
      loading: false,
      selectedShape: 0,
    }
  },

  computed: {
    store() {
      return useVisualSettingsStore()
    },

    config() {
      return this.store.geometryConfig
    },

    geometryItems() {
      return this.config.map((geometry, index) => ({
        value: index,
        label: this.getShapeName(geometry),
      }))
    },

    geometryTypes() {
      return geometryClasses.map(geometryClass => ({
        value: geometryClass.getName(),
        label: geometryClass.getName(),
      }))
    },
  },

  methods: {
    isMobile,

    getShapeName(shape: GeometryAttributes) {
      return `${getColorName(shape.color)} ${shape.type.getName()}`
    },

    setShapeType(name: string) {
      this.config[this.selectedShape].type = getGeometryClassFromName(name)
    },

    addShape() {
      this.store.addRandomGeometryConfig()
      setTimeout(() => {
        this.selectedShape = this.store.geometryConfig.length - 1
      }, 50)
    },

    deleteShape() {
      const shapeToDelete = this.selectedShape
      if (this.selectedShape > 0) {
        this.selectedShape = this.selectedShape - 1
      }
      setTimeout(() => {
        this.store.deleteGeometryConfig(shapeToDelete)
      }, 50)
    },

    save() {
      this.loading = true
      setTimeout(() => {
        this.loading = false
      }, 250)
      this.store.generateGeometry()
    },
  },
})
</script>

<style lang="scss">
.editshapes {
  &-settings {
    padding: 1rem 0;

    & > * {
      padding: 0.5rem 0;
    }
  }

  &-buttons,
  &-toggles {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }
}
</style>
