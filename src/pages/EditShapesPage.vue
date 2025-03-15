<template>
  <PageCard
    back-button-page="/visuals"
    :background-opacity="isMobile() ? 0.5 : 1"
  >
    <template #title>Edit Shapes</template>

    <DropdownSelect v-model="selectedShapeIndex" :options="geometryItems" />

    <div class="editshapes-settings">
      <DropdownSelect
        label="Type"
        :model-value="selectedShape.type.getName()"
        :options="geometryTypes"
        @change="setShapeType"
      />

      <TextField v-model="selectedShape.color" label="Colour" />

      <div class="editshapes-toggles">
        <ToggleSwitch v-model="selectedShape.solid" label="Solid" />

        <ToggleSwitch
          v-model="selectedShape.reverseRotation"
          label="Reverse Rotation"
        />
      </div>

      <TextField
        label="Radius"
        type="number"
        :model-value="selectedShape.radius.toFixed(0)"
        @update:model-value="
          (radius: string) => (selectedShape.radius = parseFloat(radius))
        "
      />

      <TextField v-model="selectedShape.detail" label="Detail" type="number" />
    </div>

    <div class="editshapes-buttons">
      <LinkButton text="Add" @click="addShape">
        <font-awesome-icon icon="fa-solid fa-plus" />
      </LinkButton>
      <LinkButton
        text="Delete"
        :style="{
          visibility: store.geometryConfig.length > 1 ? undefined : 'hidden',
        }"
        @click="deleteShape"
      >
        <font-awesome-icon icon="fa-solid fa-trash" style="max-height: 21px" />
      </LinkButton>
      <LinkButton text="Save" icon="fa-regular fa-floppy-disk" @click="save">
        <font-awesome-icon icon="fa-regular fa-floppy-disk" />
      </LinkButton>
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
      selectedShapeIndex: 0,
    }
  },

  computed: {
    store() {
      return useVisualSettingsStore()
    },

    selectedShape() {
      return this.store.geometryConfig[this.selectedShapeIndex]
    },

    geometryItems() {
      return this.store.geometryConfig.map((geometry, index) => ({
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

  mounted() {
    this.store.setListener('onRandomise', () => {
      this.selectedShapeIndex = 0
    })
  },

  unmounted() {
    this.store.removeListener('onRandomise')
  },

  methods: {
    isMobile,

    getShapeName(shape: GeometryAttributes) {
      return `${getColorName(shape.color)} ${shape.type.getName()}`
    },

    setShapeType(name: string) {
      this.selectedShape.type = getGeometryClassFromName(name)
    },

    addShape() {
      this.store.addRandomGeometryConfig()
      this.selectedShapeIndex = this.store.geometryConfig.length - 1
    },

    deleteShape() {
      const shapeToDelete = this.selectedShapeIndex
      if (this.selectedShapeIndex > 0) {
        this.selectedShapeIndex = this.selectedShapeIndex - 1
      }
      this.store.deleteGeometryConfig(shapeToDelete)
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
