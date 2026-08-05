import type { PolySynth, Synth } from "tone";

export function useDoodleSound() {
  const store = useDoodleStore();

  let toneRef: typeof import("tone") | undefined;
  let correctSynth: PolySynth<Synth> | undefined;

  watch(
    () => store.correctGuessers.length,
    (newLen, oldLen) => {
      if (newLen <= oldLen || !correctSynth || !toneRef) {
        return;
      }
      const now = toneRef.now();
      correctSynth.triggerAttackRelease("C5", "8n", now);
      correctSynth.triggerAttackRelease("G5", "4n", now + 0.12);
    },
  );

  watch(
    () => store.phase,
    phase => {
      if (!correctSynth || !toneRef) {
        return;
      }
      const now = toneRef.now();
      if (phase === "round_end") {
        correctSynth.triggerAttackRelease("E5", "8n", now);
        correctSynth.triggerAttackRelease("G5", "8n", now + 0.12);
        correctSynth.triggerAttackRelease("C6", "4n", now + 0.24);
      } else if (phase === "game_end") {
        correctSynth.triggerAttackRelease("C5", "8n", now);
        correctSynth.triggerAttackRelease("E5", "8n", now + 0.12);
        correctSynth.triggerAttackRelease("G5", "8n", now + 0.24);
        correctSynth.triggerAttackRelease("C6", "2n", now + 0.36);
      }
    },
  );

  onMounted(async () => {
    const Tone = await import("tone");
    toneRef = Tone;
    correctSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.02,
        decay: 0.15,
        sustain: 0.1,
        release: 0.4,
      },
    }).toDestination();
    correctSynth.volume.value = -8;
  });

  onUnmounted(() => {
    correctSynth?.dispose();
    correctSynth = undefined;
  });
}
