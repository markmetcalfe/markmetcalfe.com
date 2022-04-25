<template>
  <div
    class="pagecard"
    :class="{ 'pagecard-longform': longform, 'pagecard-simple': !longform }"
  >
    <div class="pagecard-inner">
      <header v-if="$slots.title" class="pagecard-header">
        <router-link
          v-if="backButtonPage"
          :to="backButtonPage"
          class="pagecard-back"
        >
          <i class="fa-solid fa-chevron-left" />
        </router-link>
        <h2 class="pagecard-title">
          <slot name="title" />
        </h2>
      </header>
      <main class="pagecard-main">
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
    longform: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<style lang="scss">
.pagecard {
  display: flex;
  justify-content: center;
  width: 100vw;
  position: absolute;

  &-inner {
    box-sizing: border-box;
    padding: 3vmin;
    border-radius: 1vmin;
    text-decoration: none;
    transition: color 0.4s;
    display: block;
    position: relative;
    text-align: center;
    z-index: 10;
    width: 75vmin;
    background-color: var(--color-light);
    color: var(--color-dark);
  }

  &-simple {
    height: 100vh;
    overflow: hidden;
    align-items: center;
  }

  &-main {
    text-align: center;
    font-size: 2.5vmin;
    line-height: 3.5vmin;
    margin: 0;
  }

  &-longform {
    & .pagecard-inner {
      margin: 8vmin 0;
    }

    & .pagecard-main {
      font-size: 1.8vmin;
      line-height: 2vmin;
      text-align: left;
    }
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
    font-weight: 400;
  }
}
</style>
