const hidden = ref(false);

// app.vue reads this to decide whether to mount the generative background.
export function useDynamicBackgroundVisible() {
  return computed(() => !hidden.value);
}

// Pages with their own opaque full-viewport background call this to hide
// (and unmount, saving GPU/battery) the generative one behind them.
export function useHideDynamicBackground() {
  onMounted(() => {
    hidden.value = true;
  });
  onUnmounted(() => {
    hidden.value = false;
  });
}
