<template>
  <button
    type="button"
    class="gamepickerbutton"
    :class="{
      'gamepickerbutton-selected': selected,
      'gamepickerbutton-readonly': !interactive,
    }"
    :disabled="!interactive"
    @click="emit('click')"
  >
    <Icon
      v-if="selected"
      name="bx:check-circle"
      class="gamepickerbutton-check"
    />
    <span class="gamepickerbutton-icon"><slot /></span>
    <span class="gamepickerbutton-title">{{ title }}</span>
    <span class="gamepickerbutton-desc">{{ description }}</span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  description: string;
  selected?: boolean;
  // False for a non-host viewer -- shows the current pick without
  // letting them change it, same convention as the read-only settings
  // shown to non-hosts elsewhere in the lobby.
  interactive?: boolean;
}

withDefaults(defineProps<Props>(), {
  selected: false,
  interactive: true,
});

const emit = defineEmits<{ click: [] }>();
</script>

<style lang="scss">
@use "/variables" as vars;

.gamepickerbutton {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 200px;
  height: 200px;
  box-sizing: border-box;
  padding: 1rem;
  text-align: center;
  color: var(--color-light);
  background: var(--color-dark);
  border: 1px solid var(--color-light);

  &:not(:disabled):hover {
    border-color: var(--color-highlight);
  }

  &-selected {
    border-color: var(--color-highlight);
  }

  &-readonly {
    cursor: default;
  }

  &-check {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    color: var(--color-highlight);
    font-size: 1.3rem;
  }

  &-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    line-height: 1;
  }

  &-title {
    font-size: 1.2rem;
    font-weight: 600;
  }

  &-desc {
    font-size: 0.8rem;
    color: var(--color-light);
  }

  @include vars.mobile-only {
    width: 160px;
    height: 160px;
    gap: 0.7rem;
    padding: 0.5rem;

    &-title {
      font-size: 1rem;
    }

    &-desc {
      font-size: 0.7rem;
    }
  }
}
</style>
