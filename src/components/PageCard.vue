<template>
  <div
    class="pagecard"
    :class="{ 'pagecard-longform': longform, 'pagecard-simple': !longform }"
  >
    <div
      class="pagecard-inner"
      :class="{
        'pagecard-inner-backgroundvisible': backgroundVisible,
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
          v-if="sequencerStore.gridHasEntry"
          class="button-icon"
          :title="sequencerStore.isPlaying ? 'Pause' : 'Play'"
          @click="sequencerStore.togglePlay"
        >
          <font-awesome-icon
            :icon="
              'fa-solid ' + (sequencerStore.isPlaying ? 'fa-pause' : 'fa-play')
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

<script setup lang="ts">
import { computed } from 'vue'
import { isCardPreview } from '../util/site'
import { useSequencerStore } from '../stores/sequencer'

interface Props {
  backButtonPage?: string | null
  longform?: boolean
  backgroundHidden?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  backButtonPage: null,
  longform: false,
  backgroundHidden: true,
})

const sequencerStore = useSequencerStore()

const backgroundVisible = computed(
  () => !props.backgroundHidden || props.longform,
)
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
      font-size: 1rem;
      text-align: left;
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
