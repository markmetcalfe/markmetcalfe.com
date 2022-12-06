<template>
  <router-link
    v-if="backButtonPage"
    :to="backButtonPage"
    class="floating-back-button"
  >
    <font-awesome-icon icon="fa-solid fa-chevron-left" />
  </router-link>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    backButtonPage: {
      type: String,
      default: null,
    },
  },
})
</script>

<style lang="scss">
.floating-back-button {
  position: absolute;
  top: 3vmin;
  left: 4vmin;
  border-radius: 1vmin;
  background-color: var(--color-light);
  color: var(--color-link);
  padding: 2vmin 3vmin;
  line-height: normal;
  font-size: 3vmin;
  z-index: 10;

  &:hover {
    background-color: var(--color-link);
    color: var(--color-light);
  }
}
</style>
