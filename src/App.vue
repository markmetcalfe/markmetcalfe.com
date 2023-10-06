<template>
  <router-view v-slot="{ Component, route }">
    <Transition :name="getTransition(route)">
      <component :is="Component" :key="route.path" />
    </Transition>
  </router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouteLocationNormalized } from 'vue-router'

type RouteWithTransition = RouteLocationNormalized & {
  meta: {
    transition?: string
  }
}

export default defineComponent({
  name: 'App',
  methods: {
    getTransition(route: RouteWithTransition): string | undefined {
      return route.meta?.transition ?? undefined
    },
  },
})
</script>

<style lang="scss">
@import './variables';

:root {
  --color-dark: #21252b;
  --color-light: #fdfdfd;
  --color-link: #d24545;
  --color-green: #0f0;
  --color-white: #fff;
  --color-black: #000;
}

body {
  width: 100%;
  height: 100%;
  margin: 0;
  font-family: Roboto, OpenSans, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: 300;
  background-color: var(--color-dark);
  color: var(--color-light);
  overflow-x: hidden;
  font-size: 6rem;
}

h1,
h2,
h3,
h4,
h5,
strong,
b {
  font-weight: 400;
}

a,
a:visited {
  color: var(--color-link);
  text-decoration: none;
  transition: all 250ms;
}

a:hover,
a:focus {
  color: inherit;
}

::selection {
  background: var(--color-dark);
  color: var(--color-light);
}

/* Transition Animations */
.slide-left-enter-from,
.slide-right-leave-to {
  transform: translateX(-100vw);
}

.slide-left-leave-to,
.slide-right-enter-from {
  transform: translateX(100vw);
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.5s ease;
}
</style>
