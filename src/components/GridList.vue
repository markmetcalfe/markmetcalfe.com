<template>
  <ul class="gridlist" :class="{ 'gridlist--large': large }">
    <li v-for="(item, index) in items" :key="`${index}-${item}`">{{ item }}</li>
  </ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'GridList',

  props: {
    items: {
      type: Array,
      default: () => [],
    },
    large: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<style lang="scss">
@use '../variables' as vars;

.gridlist {
  list-style: inside;
  display: grid;
  justify-items: start;
  margin: 0;
  padding: 0;

  @include vars.desktop-only {
    grid-template-columns: 1fr 1fr;
  }

  & li {
    padding: 0;
    margin: 0;

    /* Workaround for Safari */
    list-style-type: none;

    &::marker {
      display: none;
    }

    &::before {
      content: '> ';
      color: var(--color-highlight);
    }

    @include vars.desktop-only {
      padding-top: 0.5rem;
      font-size: 1rem;
    }

    @include vars.mobile-only {
      font-size: 0.9rem;
    }
  }

  &--large li {
    font-weight: 300;

    @include vars.desktop-only {
      font-size: 1.25rem;
    }

    @include vars.mobile-only {
      font-size: 1rem;
    }
  }
}
</style>
