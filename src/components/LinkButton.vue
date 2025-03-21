<template>
  <span class="linkbutton">
    <a
      v-if="external"
      :href="href"
      :disabled="disabled"
      :title="hideText ? text : undefined"
      target="_blank"
      rel="noopener noreferer"
      :class="{
        'linkbutton-large': large,
        'linkbutton-hidetext': hideText,
        disabled: disabled,
      }"
    >
      <span class="linkbutton-icon"><slot /></span>
      <span v-if="!hideText">{{ text }}</span>
    </a>
    <router-link
      v-else-if="href"
      :to="href"
      :disabled="disabled"
      :title="hideText ? text : undefined"
      :class="{
        'linkbutton-large': large,
        'linkbutton-hidetext': hideText,
        disabled: disabled,
      }"
    >
      <span class="linkbutton-icon"><slot /></span>
      <span v-if="!hideText">{{ text }}</span>
    </router-link>
    <button
      v-else
      :disabled="disabled"
      :title="hideText ? text : undefined"
      :class="{
        'linkbutton-large': large,
        'linkbutton-hidetext': hideText,
        disabled: disabled,
      }"
      @click="handleClick"
    >
      <span class="linkbutton-icon"><slot /></span>
      <span v-if="!hideText">{{ text }}</span>
    </button>
  </span>
</template>

<script setup lang="ts">
interface Props {
  external?: boolean
  href?: string
  text: string
  disabled?: boolean
  large?: boolean
  hideText?: boolean
}

withDefaults(defineProps<Props>(), {
  external: false,
  href: '',
  disabled: false,
  large: false,
  hideText: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

<style lang="scss">
@use '../variables' as vars;

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
    transition:
      border 0.4s,
      color 0.4s,
      background-color 0.4s;
    padding: 0.5rem;
    color: var(--color-light);
    border: var(--color-light) 1px solid;
    text-decoration: none;

    & svg * {
      stroke: var(--color-light);
      transition: stroke 0.4s;
    }

    &:hover:not(.disabled),
    &:focus:not(.disabled) {
      color: var(--color-highlight);
      border: var(--color-highlight) 1px solid;

      & svg * {
        stroke: var(--color-highlight);
      }
    }

    &.linkbutton-large {
      @include vars.desktop-only {
        font-size: 1.5rem;
        padding: 0.7rem 0.5rem;
      }

      @include vars.mobile-only {
        font-size: 1.25rem;
        padding: 0.4rem;
      }
    }
  }

  &-icon {
    display: flex;
    align-items: center;
    justify-content: center;

    @include vars.desktop-only {
      @include desktop-icon-size;

      margin-right: 0.75rem;
      margin-left: 0.25rem;

      & svg {
        @include desktop-icon-size;
      }
    }

    @include vars.mobile-only {
      @include mobile-icon-size;

      margin-right: 0.5rem;
      margin-left: 0.1rem;
      font-size: 1rem;

      & svg {
        @include mobile-icon-size;
      }
    }
  }

  &-large &-icon {
    @include vars.desktop-only {
      @include desktop-icon-size-large;

      margin-right: 0.75rem;
      margin-left: 0.25rem;

      & svg {
        @include desktop-icon-size-large;
      }
    }

    @include vars.mobile-only {
      @include mobile-icon-size-large;

      margin-right: 0.4rem;
      margin-left: 0.2rem;
      font-size: 1.25rem;

      & svg {
        @include mobile-icon-size-large;
      }
    }
  }

  &-hidetext &-icon {
    @include vars.desktop-only {
      margin-right: 0.25rem;
    }

    @include vars.mobile-only {
      margin-right: 0.1rem;
    }
  }

  &-hidetext.linkbutton-large &-icon {
    @include vars.desktop-only {
      margin-right: 0.25rem;
    }

    @include vars.mobile-only {
      margin-right: 0.2rem;
    }
  }
}
</style>
