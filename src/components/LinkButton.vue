<template>
  <span class="linkbutton">
    <a
      v-if="external"
      :href="href"
      :style="{
        // @ts-ignore
        '--color-hover': color,
      }"
      target="_blank"
      rel="noopener noreferer"
    >
      <span class="linkbutton-icon"><i :class="icon" /></span>
      <span>{{ text }}</span>
    </a>
    <router-link
      v-else
      :to="href"
      :style="{
        '--color-hover': color,
      }"
    >
      <span class="linkbutton-icon"><i :class="icon" /></span>
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
  },
})
</script>

<style lang="scss">
.linkbutton {
  a {
    display: block;
    padding: 1.5vmin;
    border-radius: 1vmin;
    text-align: left;
    line-height: 6vmin;
    background: rgb(85 81 106 / 15%);
    transition: border 0.4s, color 0.4s, background-color 0.4s;
    color: var(--color-dark);
    text-decoration: none;
    font-size: 3.5vmin;

    &:hover {
      color: var(--color-light);
      background: var(--color-hover);
    }
  }

  &-icon {
    height: 6vmin;
    width: 6vmin;
    float: left;
    margin-right: 1.5vmin;
    text-align: center;
    font-size: 6vmin;
  }
}
</style>
