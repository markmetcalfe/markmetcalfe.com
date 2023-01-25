<template>
  <section class="buttonsection">
    <slot />
  </section>
</template>

<style lang="scss">
@import '../variables';

.buttonsection {
  width: 100%;
  height: auto;
  margin: 0;
  display: grid;

  @include desktop-only {
    grid-template-columns: auto auto;
    gap: 0.75rem;
  }
  @include mobile-only {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
</style>
