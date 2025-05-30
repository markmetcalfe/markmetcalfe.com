<template>
  <section class="resumesection">
    <h2 class="resumesection-heading">
      <span class="resumesection-heading-caret">></span>
      {{ title }}
    </h2>
    <div class="resumesection-content">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>

<style lang="scss">
@use "~/variables" as vars;

.resumesection {
  &:not(:first-child) {
    @include vars.desktop-only {
      margin-top: 2rem;
    }

    @include vars.mobile-only {
      margin-top: 1rem;
    }
  }

  &-heading {
    display: flex;
    font-size: 1.5rem;
    text-align: left;
    font-weight: 300;
    margin: 0;
    padding: 0;
    color: var(--color-light);
    align-items: baseline;
    transform: translateY(0.4rem);

    &-caret {
      color: var(--color-highlight);
      margin-right: 0.25rem;
    }

    &::before, &::after {
      content: "";
      display: block;
      height: 1px;
      background-color: var(--color-highlight);
      flex-grow: 1;
    }

    &::before {
      margin-right: 0.25rem;

      @include vars.desktop-only {
        max-width: calc(265px + 1.5rem + 5rem);
      }
    }

    &::after {
      margin-left: 0.25rem;
    }
  }

  &-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background-color: var(--color-dark);
    border: var(--color-highlight) 1px solid;
    border-top: none;

    @include vars.desktop-only {
      margin: 0;
      padding: 2rem 5rem;
    }

    @include vars.mobile-only {
      padding: 1.5rem;
    }
  }
}
</style>
