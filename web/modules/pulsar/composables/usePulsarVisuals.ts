export function usePulsarVisuals() {
  const visualsStore = useVisualsStore();
  const pulsarStore = usePulsarStore();

  onMounted(() => {
    visualsStore.setInfiniteEnabled(true);
    visualsStore.filters.blur = 25;
    visualsStore.infinite.popInDistance = 20;
    visualsStore.rotationSpeed.x = 50;
    visualsStore.rotationSpeed.y = 50;
    visualsStore.autoZoom.speed = 5;
  });

  onUnmounted(() => {
    visualsStore.setInfiniteEnabled(false);
  });

  watch(
    () => pulsarStore.targetTrack,
    (track, prevTrack) => {
      if (pulsarStore.phase === "playing" && track !== prevTrack) {
        visualsStore.randomiseShapeRotations(true);
      }
    },
  );

  watch(
    () => pulsarStore.isJumping,
    (isJumping, wasJumping) => {
      if (
        pulsarStore.phase === "playing" &&
        isJumping &&
        !wasJumping
      ) {
        visualsStore.randomiseShapeRotations(true);
      }
    },
  );
}
