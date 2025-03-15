<template>
  <div
    class="pagecard"
    :class="{ 'pagecard-longform': longform, 'pagecard-simple': !longform }"
  >
    <div
      class="pagecard-inner"
      :style="{
        backgroundColor: `rgba(0, 0, 0, ${store.backgroundHidden ? 0 : backgroundOpacity})`,
        border: store.backgroundHidden
          ? ''
          : 'var(--color-highlight) 1px solid',
      }"
    >
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

      <div v-if="!isCardPreview()" class="pagecard-cornerbuttons">
        <button
          class="button-icon"
          title="See through"
          @click="store.toggleBackground"
        >
          <font-awesome-icon
            :icon="
              (store.backgroundHidden ? 'fa-solid' : 'fa-regular') + ' fa-eye'
            "
          />
        </button>
      </div>

      <main class="pagecard-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useSiteSettingsStore } from '../stores/site-settings'
import { isCardPreview } from '../util/site'

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
    backgroundOpacity: {
      type: Number,
      default: 1,
    },
  },

  computed: {
    store() {
      return useSiteSettingsStore()
    },
  },

  methods: {
    isCardPreview,
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
  visibility: hidden;

  &-inner {
    box-sizing: border-box;
    text-decoration: none;
    transition: color 0.4s;
    display: block;
    position: relative;
    text-align: center;
    z-index: 10;
    background-color: var(--color-dark);
    color: var(--color-light);
    visibility: visible;

    @include vars.desktop-only {
      padding: 2rem 5rem;
    }

    @include vars.mobile-only {
      padding: 1rem;
      margin: 1rem;
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
    color: var(--color-highlight);

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
    font-weight: inherit;
    padding: 0;
    margin-top: 0;

    @include vars.desktop-only {
      font-size: 2.25rem;
      margin-bottom: 2rem;
    }

    @include vars.mobile-only {
      font-size: 1.75rem;
      margin-bottom: 1.5rem;
    }
  }

  &-cornerbuttons {
    position: absolute;
    right: 0;
    top: 0;
    padding: 0.5rem 0.75rem;
    display: flex;
    gap: 0.5rem;
    z-index: 100;

    & button {
      font-size: 1rem;
    }
  }
}
</style>
