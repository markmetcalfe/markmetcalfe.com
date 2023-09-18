<template>
  <div>
    <div id="3d"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { initRenderer } from '../3d/main'

export default defineComponent({
  name: '3DPage',

  mounted() {
    const container = document.getElementById('3d')
    if (!container) {
      return
    }
    initRenderer(container)
  },
})
</script>
