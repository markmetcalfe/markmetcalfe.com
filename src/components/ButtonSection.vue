<template>
  <section class="buttonSection">
    <slot />
  </section>
</template>

<style lang="scss">
.buttonSection {
  width: 100%;
  height: auto;
  margin: 0;
  display: grid;
  grid-template-columns: auto auto;
  gap: 1.5vmin;
}
</style>
