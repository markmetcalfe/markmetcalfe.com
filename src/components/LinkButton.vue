<template>
  <span class="linkbutton">
    <a
      v-if="external"
      :href="href"
      :style="{
        // @ts-ignore
        '--color-hover': color,
        '--color-text': textColor,
      }"
      target="_blank"
      rel="noopener noreferer"
    >
      <span
        :class="
          extraPadding
            ? 'linkbutton-icon linkbutton-icon-extrapadding'
            : 'linkbutton-icon'
        "
        ><font-awesome-icon :icon="icon"
      /></span>
      <span>{{ text }}</span>
    </a>
    <router-link
      v-else
      :to="href"
      :style="{
        '--color-hover': color,
        '--color-text': textColor,
      }"
    >
      <span
        :class="
          extraPadding
            ? 'linkbutton-icon linkbutton-icon-extrapadding'
            : 'linkbutton-icon'
        "
        ><font-awesome-icon :icon="icon"
      /></span>
      <span>{{ text }}</span>
    </router-link>
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
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: false,
      default: () => 'var(--color-dark)',
    },
    textColor: {
      type: String,
      required: false,
      default: () => 'var(--color-light)',
    },
    extraPadding: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
})
</script>

<style lang="scss">
@use '../variables' as vars;

.linkbutton {
  a {
    display: flex;
    align-items: center;
    background: rgb(217 212 242 / 20%);
    transition:
      border 0.4s,
      color 0.4s,
      background-color 0.4s;
    color: rgb(255 255 255 / 75%);
    text-decoration: none;

    &:hover {
      color: var(--color-text);
      background: var(--color-hover);
    }

    @include vars.desktop-only {
      border-radius: 0.5rem;
      font-size: 2rem;
      padding: 0.75rem;
    }

    @include vars.mobile-only {
      border-radius: 0.25rem;
      font-size: 1.5rem;
      padding: 0.5rem;
    }
  }

  &-icon {
    display: flex;
    align-items: center;
    justify-content: center;

    @include vars.desktop-only {
      height: 3.25rem;
      width: 3.25rem;
      margin-right: 0.75rem;
      font-size: 3.25rem;
    }

    @include vars.mobile-only {
      height: 2.5rem;
      width: 2.5rem;
      margin-right: 0.5rem;
      font-size: 2.5rem;
    }

    &-extrapadding {
      @include vars.desktop-only {
        height: 3rem;
        width: auto;
        font-size: 3rem;
      }

      @include vars.mobile-only {
        height: 2rem;
        width: auto;
        font-size: 2rem;
      }
    }
  }
}
</style>
