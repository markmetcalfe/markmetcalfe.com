<template>
  <div
    class="pagecard"
    :class="{ 'pagecard-longform': longform, 'pagecard-simple': !longform }"
  >
    <div
      class="pagecard-inner"
      :class="{
        'pagecard-inner-backgroundvisible': showBackground,
      }"
    >
      <header
        v-if="$slots.title"
        class="pagecard-header"
      >
        <router-link
          v-if="backButtonPage"
          :to="backButtonPage"
          class="pagecard-back"
          aria-label="Back"
        >
          <Icon name="fa6-solid:chevron-left" />
        </router-link>

        <h2 class="pagecard-title">
          <slot name="title" />
        </h2>

        <div
          v-if="$slots.titleright"
          class="pagecard-title-right"
        >
          <slot name="titleright" />
        </div>
      </header>

      <main class="pagecard-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVisualsStore } from '~/stores/visuals'

interface Props {
  backButtonPage?: string | null
  longform?: boolean
  showBackground?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  backButtonPage: null,
  longform: false,
  showBackground: false,
})

const visualsStore = useVisualsStore()

onMounted(() => {
  visualsStore.scrollToZoom = !props.longform
})
</script>

<style lang="scss">
@use "~/variables" as vars;

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
    color: var(--color-light);
    visibility: visible;
    margin: 1rem;

    &-backgroundvisible {
      background-color: var(--color-dark);
      border: var(--color-highlight) 1px solid;

      @include vars.desktop-only {
        margin: 0;
        padding: 2rem 5rem;
      }

      @include vars.mobile-only {
        padding: 1rem;
      }
    }
  }

  &-simple {
    height: 100%;
    align-items: center;
  }

  &-main {
    text-align: center;
    margin: 0;
  }

  &-longform {
    & .pagecard-inner {
      @include vars.desktop-only {
        max-width: 1000px;
        margin: 2rem;
      }

      @include vars.mobile-only {
        margin: 1rem;
      }
    }

    & .pagecard-main {
      text-align: left;

      @include vars.desktop-only {
        font-size: 1rem;
      }

      @include vars.mobile-only {
        font-size: 0.9rem;
      }
    }
  }

  &-back {
    position: absolute;
    left: 0;
    display: inline-block;
    color: var(--color-highlight);

    @include vars.desktop-only {
      font-size: 2.25rem;
    }

    @include vars.mobile-only {
      font-size: 1.75rem;
    }
  }

  &-inner-backgroundvisible &-back {
    @include vars.desktop-only {
      left: 5rem;
    }

    @include vars.mobile-only {
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

    &-right {
      position: absolute;
      top: 0;
      right: 0;
    }
  }
}
</style>
