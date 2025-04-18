<template>
  <div>
    <router-view v-slot="{ Component, route }">
      <Transition :name="getTransition(route)">
        <component :is="Component" :key="route.path" />
      </Transition>
    </router-view>
    <DynamicBackground />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted } from 'vue'
import { RouteLocationNormalized } from 'vue-router'
import DynamicBackground from './components/DynamicBackground.vue'

interface RouteWithTransition extends RouteLocationNormalized {
  meta: {
    transition?: string
  }
}

const getTransition = (route: RouteWithTransition): string | undefined => {
  return route.meta?.transition ?? undefined
}

onMounted(() => {
  nextTick(() => {
    // An insta link is in the DOM for SEO reasons, but we don't really want to show it
    document.getElementById('ga-insta-link')?.remove()
  })
})
</script>

<style lang="scss">
@use './variables' as vars;

:root {
  --color-dark: #000;
  --color-light: #fff;
  --color-highlight: #0f0;
  --color-error: #f00;
  --color-disabled: #aaa;
}

body {
  width: 100%;
  height: 100%;
  margin: 0;
  font-family: Inter, Roboto, OpenSans, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: 200;
  color: var(--color-light);
  overflow-x: hidden;

  @include vars.desktop-only {
    font-size: 1rem;
  }

  @include vars.mobile-only {
    font-size: 0.9rem;
  }
}

a,
button,
input,
span,
div,
main,
section,
header,
footer,
aside {
  font-weight: inherit;
  font-size: inherit;
  font-family: inherit;
  margin: 0;
  padding: 0;
}

a,
a:visited,
button {
  color: var(--color-highlight);
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-decoration: none;
  transition:
    color 250ms,
    border 250ms;
}

a:hover,
a:focus,
button:hover:not(:disabled),
button:focus:not(:disabled) {
  color: inherit;
  cursor: pointer;
}

.dark {
  color: var(--color-dark);
}

.light {
  color: var(--color-light);
}

.highlight {
  color: var(--color-highlight);
}

.success {
  color: var(--color-highlight);
}

.error {
  color: var(--color-error);
}

::selection {
  background: var(--color-highlight);
  color: var(--color-dark);
}

.no-padding {
  padding: 0;
  margin: 0;
}

.disabled {
  opacity: 0.6;
  cursor: unset;
}

.disabled .disabled {
  opacity: 1;
  cursor: auto;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
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
