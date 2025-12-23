<template>
  <section class="sectionblock">
    <h2 class="sectionblock-heading">
      {{ title }}
    </h2>
    <div
      class="sectionblock-content"
      :class="{ 'sectionblock-flex': flex, 'sectionblock-larger-text': largerText }"
    >
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title: string
  flex?: boolean
  largerText?: boolean
}

withDefaults(defineProps<Props>(), {
  flex: true,
  largerText: false,
})
</script>

<style lang="scss">
@use "~/variables" as vars;

.sectionblock {
  margin-top: 1rem;

  &-heading {
    display: flex;
    text-align: left;
    font-weight: 300;
    margin: 0;
    padding: 0;
    color: var(--color-light);
    align-items: baseline;

    @include vars.desktop-only {
      font-size: 1.25rem;
      padding-bottom: 1rem;
    }

    @include vars.mobile-only {
      font-size: 1rem;
      padding-bottom: 0.75rem;
    }

    &::before {
      content: ">";
      color: var(--color-highlight);
      margin-right: 0.25rem;
    }

    &::after {
      content: "";
      display: block;
      height: 1px;
      background-color: var(--color-highlight);
      flex-grow: 1;
      margin-left: 0.25rem;
    }
  }

  &-flex {
    display: flex;
    justify-content: start;
    gap: 1rem;
  }

  &-larger-text {
    display: flex;
    flex-wrap: wrap;
    text-align: left;

    @include vars.desktop-only {
      max-width: 450px;
      font-size: 1.1rem;
      gap: 0.75rem;
    }

    @include vars.mobile-only {
      max-width: 325px;
      font-size: 0.9rem;
      gap: 0.5rem;
    }

    p {
      margin: 0;
    }
  }
}
</style>
