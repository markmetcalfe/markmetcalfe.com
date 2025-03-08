<template>
  <span class="linkbutton">
    <a v-if="external" :href="href" target="_blank" rel="noopener noreferer">
      <span class="linkbutton-icon"><font-awesome-icon :icon="icon" /></span>
      <span>{{ text }}</span>
    </a>
    <router-link v-else :to="href">
      <span class="linkbutton-icon"><font-awesome-icon :icon="icon" /></span>
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
  },
})
</script>

<style lang="scss">
@use '../variables' as vars;

.linkbutton {
  a {
    display: flex;
    align-items: center;
    transition:
      border 0.4s,
      color 0.4s,
      background-color 0.4s;
    color: var(--color-light);
    border: var(--color-light) 1px solid;
    text-decoration: none;

    &:hover {
      color: var(--color-link);
      border: var(--color-link) 1px solid;
    }

    @include vars.desktop-only {
      font-size: 1.5rem;
      padding: 0.5rem;
    }

    @include vars.mobile-only {
      font-size: 1.25rem;
      padding: 0.25rem;
    }
  }

  &-icon {
    display: flex;
    align-items: center;
    justify-content: center;

    @include vars.desktop-only {
      height: 1.75rem;
      width: 1.75rem;
      margin-right: 0.75rem;
      margin-left: 0.25rem;
      font-size: 1.75rem;
    }

    @include vars.mobile-only {
      height: 1.5rem;
      width: 1.5rem;
      margin-right: 0.5rem;
      margin-left: 0.25rem;
      font-size: 1.5rem;
    }
  }
}
</style>
