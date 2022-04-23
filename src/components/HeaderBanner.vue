<template>
  <div class="headerbanner">
    <header v-if="$slots.title" class="headerbanner-header">
      <router-link
        v-if="backButtonPage"
        :to="backButtonPage"
        class="headerbanner-back"
        aria-label="Back"
      >
        <i class="fa-solid fa-chevron-left" />
      </router-link>
      <h2 class="headerbanner-title">
        <slot name="title" />
      </h2>
    </header>

    <main class="headerbanner-main">
      <slot />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    backButtonPage: {
      type: String,
      default: null,
    },
  },
})
</script>

<style lang="scss">
.headerbanner {
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: absolute;

  &-header {
    box-sizing: border-box;
    padding: 2vmin;
    text-decoration: none;
    transition: color 0.4s;
    display: block;
    position: absolute;
    text-align: center;
    z-index: 10;
    width: 100%;
    height: 10vmin;
    background-color: var(--color-light);
    color: var(--color-dark);
  }

  &-back {
    position: absolute;
    left: 3vmin;
    display: inline-block;
    color: var(--color-link);
  }

  &-title {
    display: inline-block;
    margin: 0;
    font-size: 4vmin;
    line-height: 4vmin;
    font-weight: 400;
  }

  &-main {
    width: 100%;
    height: calc(100% - 10vmin);
    position: absolute;
    top: 10vmin;
    left: 0;
    right: 0;
    bottom: 0;
    font-size: 2.5vmin;
    line-height: 3.5vmin;
    margin: 0;
  }
}
</style>
