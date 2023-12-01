<template>
  <section class="buttonsection">
    <div class="buttonsection-inner">
      <slot />
    </div>
  </section>
</template>

<style lang="scss">
@import '../variables';

.buttonsection {
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;

  &-inner {
    margin: 0;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
</style>
