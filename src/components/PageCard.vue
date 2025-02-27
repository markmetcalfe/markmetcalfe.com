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
          aria-label="Back"
        >
          <font-awesome-icon icon="fa-solid fa-chevron-left" />
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
@use '../variables' as vars;

.pagecard {
  display: flex;
  justify-content: center;
  width: 100%;
  position: absolute;

  &-inner {
    box-sizing: border-box;
    text-decoration: none;
    transition: color 0.4s;
    display: block;
    position: relative;
    text-align: center;
    z-index: 10;
    background-color: none;
    color: var(--color-light);

    @include vars.desktop-only {
      padding: 1.5rem;
      border-radius: 0.75rem;
    }

    @include vars.mobile-only {
      padding: 1rem;
      border-radius: 0.5rem;
    }
  }

  &-simple {
    height: 100%;
    overflow: hidden;
    align-items: center;
  }

  &-main {
    text-align: center;
    margin: 0;

    @include vars.desktop-only {
      font-size: 1.25rem;
    }

    @include vars.mobile-only {
      font-size: 1rem;
    }
  }

  &-longform {
    & .pagecard-inner {
      @include vars.desktop-only {
        margin: 2rem;
      }

      @include vars.mobile-only {
        margin: 1rem;
      }
    }

    & .pagecard-main {
      font-size: 1rem;
      text-align: left;
    }
  }

  &-back {
    position: absolute;
    display: inline-block;
    color: var(--color-link);

    @include vars.desktop-only {
      font-size: 2.25rem;
      left: 1.5rem;
    }

    @include vars.mobile-only {
      font-size: 1.75rem;
      left: 1rem;
    }
  }

  &-title {
    font-weight: 400;
    margin-top: 0.5rem;

    @include vars.desktop-only {
      font-size: 2.25rem;
      margin-bottom: 2rem;
    }

    @include vars.mobile-only {
      font-size: 1.75rem;
      margin-bottom: 1.5rem;
    }
  }
}
</style>
