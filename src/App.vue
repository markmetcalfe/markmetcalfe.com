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

<script lang="ts">
import { defineComponent } from 'vue'
import { RouteLocationNormalized } from 'vue-router'
import DynamicBackground from './components/DynamicBackground.vue'

type RouteWithTransition = RouteLocationNormalized & {
  meta: {
    transition?: string
  }
}

export default defineComponent({
  name: 'App',
  components: { DynamicBackground },
  mounted() {
    this.$nextTick(() => {
      // An insta link is in the DOM for SEO reasons, but we don't really want to show it
      document.getElementById('ga-insta-link')?.remove()
    })
  },
  methods: {
    getTransition(route: RouteWithTransition): string | undefined {
      return route.meta?.transition ?? undefined
    },
  },
})
</script>

<style lang="scss">
@use './variables' as vars;

:root {
  --color-dark: #000;
  --color-light: #fff;
  --color-highlight: #0f0;
  --color-error: #f00;
  --color-link: var(--color-highlight);
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
    font-size: 1.15rem;
  }

  @include vars.mobile-only {
    font-size: 0.9rem;
  }
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
a:visited,
button.button-icon {
  color: var(--color-link);
  text-decoration: none;
  transition: all 250ms;
}

a:hover,
a:focus,
button.button-icon:hover {
  color: inherit;
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
