<template>
  <router-view />
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Roboto:300,600');

:root {
  --color-dark: #21252b;
  --color-light: #fdfdfd;
  --color-link: #d24545;
}

body {
  width: 100vw;
  height: 100vh;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Roboto, OpenSans, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 3.5vmin;
  line-height: 6.5vmin;
  font-weight: 300;
  background-color: var(--color-dark);
  color: var(--color-light);
  overflow: hidden;
  transition: background 0.4s;
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
