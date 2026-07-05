<template>
  <div class="modaldialog-overlay">
    <div class="modaldialog">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
.modaldialog {
  background: var(--color-dark);
  border: 1px solid var(--color-highlight);
  padding: 2rem;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;

  &-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 75%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 30;
    padding: 1rem;
  }
}
</style>
