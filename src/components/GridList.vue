<template>
  <ul class="gridlist">
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
  },
})
</script>

<style lang="scss">
@use '../variables' as vars;

.gridlist {
  list-style: inside;
  display: grid;
  justify-items: start;

  @include vars.desktop-only {
    grid-template-columns: 1fr 1fr;
  }

  & li {
    padding: 0;
    margin: 0;
    font-weight: 300;

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
      font-size: 1.25rem;
    }

    @include vars.mobile-only {
      font-size: 1rem;
    }
  }
}
</style>
