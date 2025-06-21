<template>
  <span class="linkbutton">
    <a
      v-if="external"
      :href="href"
      :disabled="disabled"
      :title="title"
      :aria-label="title"
      target="_blank"
      rel="noopener noreferer"
      :class="{
        'linkbutton-large': large,
        'linkbutton-hidetext': !text,
        'disabled': disabled,
      }"
    >
      <span class="linkbutton-icon"><slot /></span>
      <span v-if="text">{{ text }}</span>
    </a>
    <NuxtLink
      v-else-if="href"
      :to="href"
      :disabled="disabled"
      :title="title"
      :aria-label="title"
      :class="{
        'linkbutton-large': large,
        'linkbutton-hidetext': !text,
        'disabled': disabled,
      }"
    >
      <span class="linkbutton-icon"><slot /></span>
      <span v-if="text">{{ text }}</span>
    </NuxtLink>
    <button
      v-else
      :disabled="disabled"
      :title="title"
      :aria-label="title"
      :class="{
        'linkbutton-large': large,
        'linkbutton-hidetext': !text,
        'linkbutton-on': on,
        'disabled': disabled,
      }"
      @click="handleClick"
    >
      <span class="linkbutton-icon"><slot /></span>
      <span v-if="text">{{ text }}</span>
    </button>
  </span>
</template>

<script setup lang="ts">
interface Props {
  external?: boolean
  href?: string
  text?: string
  title?: string
  disabled?: boolean
  large?: boolean
  on?: boolean
}

withDefaults(defineProps<Props>(), {
  external: false,
  href: '',
  disabled: false,
  large: false,
  on: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

<style lang="scss">
@use "~/variables" as vars;

@mixin desktop-icon-size {
  height: 1.25rem;
  width: 1.25rem;
  font-size: 1.25rem;
}

@mixin mobile-icon-size {
  height: 1rem;
  width: 1rem;
  font-size: 1rem;
}

@mixin desktop-icon-size-large {
  height: 1.75rem;
  width: 1.75rem;
  font-size: 1.75rem;
}

@mixin mobile-icon-size-large {
  height: 1.25rem;
  width: 1.25rem;
  font-size: 1.25rem;
}

.linkbutton {
  a,
  button {
    display: flex;
    align-items: center;
    transition: border 0.4s, color 0.4s;
    padding: 0.5rem;
    color: var(--color-light);
    background-color: var(--color-dark);
    border: var(--color-light) 1px solid;
    text-decoration: none;

    & svg * {
      stroke: var(--color-light);
      transition: stroke 0.4s;
    }

    &:hover:not(.disabled),
    &.linkbutton-on:not(.disabled) {
      color: var(--color-highlight);
      border: var(--color-highlight) 1px solid;

      & svg * {
        stroke: var(--color-highlight);
      }
    }

    &.linkbutton-large {
      @include vars.desktop-only {
        font-size: 1.4rem;
        padding: 0.75rem;
      }

      @include vars.mobile-only {
        font-size: 1rem;
        padding: 0.5rem;
      }
    }
  }

  &-icon {
    display: flex;
    align-items: center;
    justify-content: center;

    @include vars.desktop-only {
      margin-right: 0.4rem;

      @include desktop-icon-size;

      & svg {
        @include desktop-icon-size;
      }
    }

    @include vars.mobile-only {
      font-size: 1rem;
      margin-right: 0.25rem;

      @include mobile-icon-size;

      & svg {
        @include mobile-icon-size;
      }
    }
  }

  &-large &-icon {
    @include vars.desktop-only {
      @include desktop-icon-size-large;

      margin-right: 0.5rem;

      & svg {
        @include desktop-icon-size-large;
      }
    }

    @include vars.mobile-only {
      @include mobile-icon-size-large;

      margin-right: 0.3rem;
      font-size: 1.25rem;

      & svg {
        @include mobile-icon-size-large;
      }
    }
  }

  &-hidetext &-icon {
    margin: 0;
  }
}
</style>
