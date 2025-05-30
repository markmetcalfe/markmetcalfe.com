<template>
  <div class="resumeentry">
    <template v-if="!$slots.left && !left">
      <slot />
    </template>
    <template v-if="$slots.left || left">
      <div class="resumeentry-left">
        <p v-if="left">
          <strong>{{ left }}</strong>
        </p>
        <slot
          v-else
          name="left"
        />
      </div>
      <div class="resumeentry-right">
        <p v-if="right">
          {{ right }}
        </p>
        <slot
          v-else-if="$slots.right"
          name="right"
        />
        <slot v-else />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface Props {
  left?: string
  right?: string
}

defineProps<Props>()
</script>

<style lang="scss">
@use "~/variables" as vars;

.resumeentry {
  display: flex;

  @include vars.desktop-only {
    flex-direction: row;
  }

  @include vars.mobile-only {
    flex-direction: column;
  }

  &:not(:first-child) {
    @include vars.desktop-only {
      margin-top: 0.5rem;
      padding-top: 1rem;
    }

    @include vars.mobile-only {
      padding-top: 0.5rem;
    }
  }

  & p {
    margin: 0;

    &:not(:first-child) {
      margin-top: 0.5rem;
    }

    &:not(:last-child) {
      margin-bottom: 0.5rem;
    }
  }

  & ul {
    padding-left: 1rem;
    margin: 0;
  }

  & li {
    margin: 0.5rem 0;

    &::before {
      padding-right: 0.5rem;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  &-left {
    @include vars.desktop-only {
      flex: 1;
      min-width: 265px;
      max-width: 265px;
      text-align: right;
      padding-right: 1.5rem;
    }

    @include vars.mobile-only {
      max-width: 100%;
      text-align: left;
      font-size: 1rem;
      padding-bottom: 0.5rem;
    }
  }
}
</style>
