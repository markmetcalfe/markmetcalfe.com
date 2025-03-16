<template>
  <span class="linkbutton">
    <a
      v-if="external"
      :href="href"
      target="_blank"
      rel="noopener noreferer"
      :class="{ 'linkbutton-large': large }"
    >
      <span class="linkbutton-icon"><slot /></span>
      <span>{{ text }}</span>
    </a>
    <router-link
      v-else-if="href"
      :to="href"
      :class="{ 'linkbutton-large': large }"
    >
      <span class="linkbutton-icon"><slot /></span>
      <span>{{ text }}</span>
    </router-link>
    <button
      v-else
      :class="{ 'linkbutton-large': large }"
      @click="event => $emit('click', event)"
    >
      <span class="linkbutton-icon"><slot /></span>
      <span>{{ text }}</span>
    </button>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    external: {
      type: Boolean,
      default: false,
    },
    href: {
      type: String,
      required: false,
      default: '',
    },
    text: {
      type: String,
      required: true,
    },
    large: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['click'],
})
</script>

<style lang="scss">
@use '../variables' as vars;

.linkbutton {
  a,
  button {
    display: flex;
    align-items: center;
    transition:
      border 0.4s,
      color 0.4s,
      background-color 0.4s;
    padding: 0.5rem;
    color: var(--color-light);
    border: var(--color-light) 1px solid;
    text-decoration: none;

    & svg * {
      stroke: var(--color-light);
      transition: stroke 0.4s;
    }

    &:hover,
    &:focus {
      color: var(--color-highlight);
      border: var(--color-highlight) 1px solid;

      & svg * {
        stroke: var(--color-highlight);
      }
    }

    &.linkbutton-large {
      @include vars.desktop-only {
        font-size: 1.5rem;
        padding: 0.7rem 0.5rem;
      }

      @include vars.mobile-only {
        font-size: 1.25rem;
        padding: 0.4rem;
      }
    }
  }

  &-icon {
    display: flex;
    align-items: center;
    justify-content: center;

    @include vars.desktop-only {
      height: 1.5rem;
      width: 1.5rem;
      margin-right: 0.75rem;
      margin-left: 0.25rem;
      font-size: 1.5rem;

      & svg {
        height: 1.5rem;
        width: 1.5rem;
      }
    }

    @include vars.mobile-only {
      height: 1rem;
      width: 1rem;
      margin-right: 0.5rem;
      margin-left: 0.1rem;
      font-size: 1rem;

      & svg {
        height: 1rem;
        width: 1rem;
      }
    }
  }

  &-large &-icon {
    @include vars.desktop-only {
      height: 1.75rem;
      width: 1.75rem;
      margin-right: 0.75rem;
      margin-left: 0.25rem;
      font-size: 1.75rem;

      & svg {
        height: 1.75rem;
        width: 1.75rem;
      }
    }

    @include vars.mobile-only {
      height: 1.25rem;
      width: 1.25rem;
      margin-right: 0.4rem;
      margin-left: 0.2rem;
      font-size: 1.25rem;

      & svg {
        height: 1.25rem;
        width: 1.25rem;
      }
    }
  }
}
</style>
