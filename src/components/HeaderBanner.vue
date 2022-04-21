<template>
  <div class="headerbanner">
    <div class="headerbanner-inner">
      <header v-if="$slots.title" class="headerbanner-header">
        <router-link
          v-if="backButtonPage"
          :to="backButtonPage"
          class="headerbanner-back"
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
  width: 100vw;
  position: absolute;

  &-inner {
    box-sizing: border-box;
    padding: 2vmin;
    text-decoration: none;
    transition: color 0.4s;
    display: block;
    position: absolute;
    text-align: center;
    z-index: 10;
    width: 100%;
    height: 10vh;
    background-color: var(--color-light);
    color: var(--color-dark);
  }

  &-main {
    width: 100%;
    height: 90vh;
    position: absolute;
    top: 10vh;
    left: 0;
    text-align: center;
    font-size: 2.5vmin;
    line-height: 3.5vmin;
    margin: 0;
  }

  &-back {
    position: absolute;
    left: 3vmin;
    display: inline-block;
    color: var(--color-link);
  }

  &-title {
    display: inline-block;
    margin-top: 1vmin;
    margin-bottom: 3vmin;
    font-size: 4vmin;
    line-height: 4vmin;
    font-weight: 600;
  }
}
</style>
