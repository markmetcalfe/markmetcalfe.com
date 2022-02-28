<template>
  <section class="buttonsection">
    <slot />
  </section>
</template>

<style lang="scss">
.buttonsection {
  width: 100%;
  height: auto;
  margin: 0;
  display: grid;
  grid-template-columns: auto auto;
  gap: 1.5vmin;
}
</style>
