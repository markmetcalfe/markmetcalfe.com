<template>
  <header
    class="headerbar"
    :class="{ 'headerbar--floating': floating }"
  >
    <NuxtLink
      :to="backHref"
      class="headerbar-back"
      :aria-label="backLabel"
    >
      <Icon name="bx:arrow-back" />
    </NuxtLink>

    <span class="headerbar-title">{{ title }}</span>

    <slot />
  </header>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  backHref?: string;
  backLabel?: string;
  floating?: boolean;
}

withDefaults(defineProps<Props>(), {
  backHref: "/",
  backLabel: "Back",
  floating: false,
});
</script>

<style lang="scss">
@use "/variables" as vars;

.headerbar {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid var(--color-light);

  &--floating {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    border-bottom: none;
  }

  &-back {
    display: flex;
    align-items: center;
    color: var(--color-highlight);
    font-size: 1.4rem;
    line-height: 1;
    flex-shrink: 0;
  }

  &-title {
    font-weight: 600;
    color: var(--color-highlight);
    flex-shrink: 0;

    @include vars.mobile-only {
      display: none;
    }
  }
}
</style>
