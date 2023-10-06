<template>
  <div>
    <div>
      <router-link to="/" class="backbutton" aria-label="Back">
        <font-awesome-icon icon="fa-solid fa-chevron-left" />
      </router-link>
    </div>
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

<style lang="scss">
@import '../variables';

a.backbutton {
  position: absolute;
  display: inline-block;
  color: var(--color-green);

  &:hover {
    color: var(--color-white);
  }

  @include desktop-only {
    font-size: 2.25rem;
    left: 1.5rem;
    top: 1rem;
  }
  @include mobile-only {
    font-size: 1.75rem;
    left: 1rem;
    top: 0.5rem;
  }
}
</style>
