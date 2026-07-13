<template>
  <div
    class="textfield"
    :class="{ 'textfield--small': small, disabled: disabled }"
  >
    <label
      v-if="label"
      :id="labelId"
      class="textfield-label"
      :for="id"
    >
      {{ label }}
    </label>
    <div class="textfield-container">
      <input
        :id="id"
        ref="inputRef"
        class="textfield-field"
        :type="effectiveType"
        :value="modelValue"
        :aria-labelledby="label ? labelId : undefined"
        :aria-label="!label ? ariaLabel : undefined"
        :disabled="disabled"
        :name="name"
        v-bind="autofillAttrs"
        @input="onInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
      <!--
        Rendered as an overlay rather than the input's native
        `placeholder` attribute -- iOS Safari heuristically scans that
        attribute for address/contact-like keywords and offers to
        autofill the field from the user's Contacts card regardless of
        autocomplete="off". This shows the same text with nothing for
        that heuristic to read.
      -->
      <span
        v-if="!modelValue"
        class="textfield-visual-placeholder"
        aria-hidden="true"
        >{{ placeholder }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from "vue";

type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search";

interface Props {
  modelValue?: string | number;
  label?: string | null;
  placeholder?: string;
  type?: InputType;
  small?: boolean;
  disabled?: boolean;
  // Native keyboard/autofill suggestions. Set to false to turn off
  // autocomplete, spellcheck, autocorrect and autocapitalize together --
  // callers that care about one of these almost always want all four
  // off at once.
  autofill?: boolean;
  name?: string;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  label: null,
  placeholder: "Enter text...",
  type: "text",
  small: false,
  disabled: false,
  autofill: true,
  name: undefined,
  ariaLabel: undefined,
});

const autofillAttrs = computed(() =>
  props.autofill
    ? {}
    : {
        autocomplete: "off",
        spellcheck: false,
        autocorrect: "off",
        autocapitalize: "off",
      },
);

// `type="search"` fields are treated differently by mobile browsers'
// personal-data-fill heuristics than `type="text"`, so bundle it in
// whenever autofill is turned off rather than making callers set both.
const effectiveType = computed(() =>
  props.autofill ? props.type : "search",
);

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
  change: [value: string | number];
}>();

const isFocused = ref(false);
const id = useId();
const labelId = useId();
const inputRef = ref<HTMLInputElement>();

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
  emit("change", target.value);
};

defineExpose({
  focus: () => inputRef.value?.focus(),
});
</script>

<style lang="scss">
@use "/variables" as vars;

.textfield {
  display: flex;
  align-items: center;

  &-container {
    position: relative;
    display: flex;
    width: 100%;
  }

  &-label {
    margin-right: 0.5rem;
    white-space: nowrap;
  }

  &-field {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-light);
    background: var(--color-dark);
    color: inherit;
    border-radius: 0;
    font-size: inherit;
    font-weight: inherit;

    // iOS Safari auto-zooms the page when focusing an input with a
    // computed font-size under 16px; the site's mobile body font-size
    // is smaller than that, so force it back up on every field.
    @include vars.mobile-only {
      font-size: 16px;
    }

    &:focus {
      outline: none;
      border-color: var(--color-highlight);
    }
  }

  &--small &-field {
    padding: 0.25rem;
  }

  &-visual-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    padding: 0 calc(0.5rem + 1px);
    color: var(--color-light);
    opacity: 0.5;
    pointer-events: none;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &--small &-visual-placeholder {
    padding: 0 calc(0.25rem + 1px);
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    appearance: none;
    margin: 0;
  }

  input[type="number"] {
    appearance: textfield;
  }

  input[type="search"] {
    appearance: none;

    &::-webkit-search-cancel-button,
    &::-webkit-search-decoration {
      appearance: none;
    }
  }
}
</style>
