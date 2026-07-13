<template>
  <div class="pulsarpage">
    <HeaderBar title="Pulsar" back-href="/" floating />
    <PulsarGame />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false });

useSeoMeta({ title: "Pulsar - Mark Metcalfe" });

usePulsarVisuals();
</script>

<style lang="scss">
.pulsarpage {
  position: fixed;
  inset: 0;
  display: grid;
  grid-template: "header" auto "main" 1fr / 1fr;
  z-index: 20;

  & > .headerbar {
    grid-area: header;
  }

  & > .pulsar-game {
    grid-area: main;
  }
}
</style>
