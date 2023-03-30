<template>
  <div class="page-wrapper">
    <iframe
      src="https://home.markmetcalfe.io/minecraft/dynmap"
      title="Map of the Minecraft Server"
      class="mapframe"
    ></iframe>
    <div class="banner-overlay">
      <span class="graytext">Server IP: </span><span>markmetcalfe.io</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'MinecraftPage',
})
</script>

<style lang="scss">
@import '../variables';

.graytext {
  color: gray;
}

.page-wrapper {
  display: flex;
  justify-content: center;
}

.banner-overlay {
  position: absolute;
  background-color: var(--color-light);
  color: var(--color-dark);
  z-index: 10;

  @include desktop-only {
    bottom: 3rem;
    border-radius: 0.5rem;
    padding: 1rem 2rem;
    font-size: 2rem;
  }
  @include mobile-only {
    bottom: 2rem;
    border-radius: 0.5rem;
    padding: 0.75rem 1.25rem;
    font-size: 1.25rem;
  }
}

.mapframe {
  width: 100vw;
  height: 100vh;
  border: 0;
}
</style>
