<template>
  <li class="listitem">
    <span class="listitem-inner">
      <slot />
    </span>
  </li>
</template>

<style lang="scss">
@use "~/variables" as vars;

.listitem {
  display: flex;

  /* Workaround for Safari */
  list-style-type: none;

  &::marker {
    display: none;
  }

  &::before {
    content: "> ";
    color: var(--color-highlight);
    padding-right: 0.25rem;
  }

  &-inner {
    & > *:first-child, & > p {
      margin-top: 0;
      padding-top: 0;
    }
  }
}
</style>
