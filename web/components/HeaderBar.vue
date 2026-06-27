<template>
  <header class="headerbar">
    <NuxtLink :to="backHref" class="headerbar-back" :aria-label="backLabel">
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
}

withDefaults(defineProps<Props>(), {
  backHref: "/",
  backLabel: "Back",
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
