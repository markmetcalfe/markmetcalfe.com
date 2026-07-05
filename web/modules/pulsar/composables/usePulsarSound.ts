import type { PolySynth, Synth } from "tone";

export function usePulsarSound() {
  const store = usePulsarStore();

  let toneRef: typeof import("tone") | undefined;
  let jumpSynth: PolySynth<Synth> | undefined;
  let crashSynth: PolySynth<Synth> | undefined;
  let gameOverSynth: PolySynth<Synth> | undefined;
  let milestoneSynth: PolySynth<Synth> | undefined;

  let lastMilestone = 0;

  watch(
    () => store.isJumping,
    jumping => {
      if (!jumping || !jumpSynth || !toneRef) {
        return;
      }
      jumpSynth.triggerAttackRelease("E5", "16n", toneRef.now());
    },
  );

  watch(
    () => store.phase,
    phase => {
      if (!toneRef) {
        return;
      }
      const now = toneRef.now();
      if (phase === "dead") {
        crashSynth?.triggerAttackRelease("D4", "8n", now);
        crashSynth?.triggerAttackRelease("B3", "8n", now + 0.15);
        crashSynth?.triggerAttackRelease("G3", "4n", now + 0.3);
        gameOverSynth?.triggerAttackRelease("C5", "8n", now + 0.55);
        gameOverSynth?.triggerAttackRelease("A4", "8n", now + 0.75);
        gameOverSynth?.triggerAttackRelease("F4", "8n", now + 0.95);
        gameOverSynth?.triggerAttackRelease("C4", "2n", now + 1.15);
      } else if (phase === "playing") {
        lastMilestone = 0;
      }
    },
  );

  watch(
    () => store.score,
    score => {
      if (!milestoneSynth || !toneRef || store.phase !== "playing") {
        return;
      }
      const milestone = Math.floor(score / 500);
      if (milestone > lastMilestone && milestone > 0) {
        lastMilestone = milestone;
        const now = toneRef.now();
        milestoneSynth.triggerAttackRelease("C5", "16n", now);
        milestoneSynth.triggerAttackRelease("E5", "16n", now + 0.08);
        milestoneSynth.triggerAttackRelease("G5", "8n", now + 0.16);
      }
    },
  );

  onMounted(async () => {
    const Tone = await import("tone");
    toneRef = Tone;

    jumpSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.001,
        decay: 0.08,
        sustain: 0,
        release: 0.05,
      },
    }).toDestination();
    jumpSynth.volume.value = -10;

    crashSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sawtooth" },
      envelope: {
        attack: 0.001,
        decay: 0.12,
        sustain: 0,
        release: 0.1,
      },
    }).toDestination();
    crashSynth.volume.value = -6;

    gameOverSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.05,
        decay: 0.3,
        sustain: 0.1,
        release: 0.5,
      },
    }).toDestination();
    gameOverSynth.volume.value = -8;

    milestoneSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.01,
        decay: 0.15,
        sustain: 0.05,
        release: 0.3,
      },
    }).toDestination();
    milestoneSynth.volume.value = -12;
  });

  onUnmounted(() => {
    jumpSynth?.dispose();
    jumpSynth = undefined;
    crashSynth?.dispose();
    crashSynth = undefined;
    gameOverSynth?.dispose();
    gameOverSynth = undefined;
    milestoneSynth?.dispose();
    milestoneSynth = undefined;
  });
}
