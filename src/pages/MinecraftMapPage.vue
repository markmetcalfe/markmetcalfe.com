<template>
  <HeaderBanner back-button-page="/minecraft">
    <template #title>Minecraft {{ serverName }} Server Map</template>
    <iframe
      :src="`https://minecraft-maps.markmetcalfe.io/${server}`"
      :title="`Map of the ${serverName} Minecraft Server`"
      class="mapframe"
    ></iframe>
  </HeaderBanner>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HeaderBanner from '../components/HeaderBanner.vue'
export default defineComponent({
  name: 'MinecraftMapPage',
  components: { HeaderBanner },
  computed: {
    server(): string {
      return this.$route.params.server.toString()
    },
    serverName(): string {
      return this.server.charAt(0).toUpperCase() + this.server.slice(1)
    },
  },
})
</script>

<style lang="scss">
.mapframe {
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
