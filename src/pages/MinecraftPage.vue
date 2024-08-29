<template>
  <div class="page-wrapper">
    <iframe
      src="https://requests.markmetcalfe.com/minecraft/dynmap"
      title="Map of the Minecraft Server"
      class="mapframe"
    ></iframe>
    <div class="banner-overlay">
      <span class="white">Server IP: </span
      ><span class="green">minecraft.markmetcalfe.com</span>
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

.page-wrapper {
  display: flex;
  justify-content: center;
}

.banner-overlay {
  position: absolute;
  background-color: var(--color-black);
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
