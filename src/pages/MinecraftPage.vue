<template>
  <div class="page-wrapper">
    <iframe
      src="https://home.markmetcalfe.io/minecraft/map"
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
.graytext {
  color: gray;
}

.page-wrapper {
  display: flex;
  justify-content: center;
}

.banner-overlay {
  position: absolute;
  bottom: 5vmin;
  border-radius: 1vmin;
  background-color: var(--color-light);
  color: var(--color-dark);
  padding: 2vmin 3vmin;
  line-height: normal;
  font-size: 4vmin;
  z-index: 10;
}

.mapframe {
  width: 100vw;
  height: 100vh;
  border: 0;
}
</style>
