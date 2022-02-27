<template>
  <router-view v-slot="{ Component, route }">
    <Transition name="slide">
      <component :is="Component" :key="route.path" />
    </Transition>
  </router-view>
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Roboto:300,600');

.slide-enter-from {
  transform: translateX(-100vw);
}
.slide-leave-to {
  transform: translateX(100vw);
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}

:root {
  --color-dark: #21252b;
  --color-light: #fdfdfd;
  --color-link: #d24545;
}

body {
  width: 100vw;
  height: 100vh;
  margin: 0;
  font-family: Roboto, OpenSans, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 3.5vmin;
  line-height: 6.5vmin;
  font-weight: 300;
  background-color: var(--color-dark);
  color: var(--color-light);
  transition: background 0.4s;
  overflow-x: hidden;
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
</style>
