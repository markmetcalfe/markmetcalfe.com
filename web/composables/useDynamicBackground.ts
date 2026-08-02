const hidden = ref(false);

// app.vue reads this to decide whether to mount the generative background.
export function useDynamicBackgroundVisible() {
  const isPlaywrightTest = useRuntimeConfig().public.isPlaywrightTest;
  return computed(() => !isPlaywrightTest && !hidden.value);
}

// Pages with their own opaque full-viewport background call this to hide
// (and unmount, saving GPU/battery) the generative one behind them. Hides
// immediately by default; pass `false` (e.g. a ref that flips true once a
// slower-loading replacement background has actually rendered) to defer
// hiding until then, avoiding a flash of nothing in between.
export function useHideDynamicBackground(
  shouldHide: MaybeRefOrGetter<boolean> = true,
) {
  watch(
    () => toValue(shouldHide),
    value => {
      hidden.value = value;
    },
    { immediate: true },
  );
  onUnmounted(() => {
    hidden.value = false;
  });
}
