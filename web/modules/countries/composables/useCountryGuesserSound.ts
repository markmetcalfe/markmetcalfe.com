import type { PolySynth, Synth } from "tone";

export function useCountryGuesserSound() {
  let toneRef: typeof import("tone") | undefined;
  let correctSynth: PolySynth<Synth> | undefined;
  let incorrectSynth: PolySynth<Synth> | undefined;
  let roundEndSynth: PolySynth<Synth> | undefined;
  let nextTargetSynth: PolySynth<Synth> | undefined;

  onMounted(async () => {
    const Tone = await import("tone");
    toneRef = Tone;

    correctSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.05,
        release: 0.2,
      },
    }).toDestination();
    correctSynth.volume.value = -8;

    incorrectSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sawtooth" },
      envelope: {
        attack: 0.001,
        decay: 0.15,
        sustain: 0,
        release: 0.1,
      },
    }).toDestination();
    incorrectSynth.volume.value = -14;

    roundEndSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.02,
        decay: 0.15,
        sustain: 0.1,
        release: 0.4,
      },
    }).toDestination();
    roundEndSynth.volume.value = -8;

    nextTargetSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.005,
        decay: 0.12,
        sustain: 0,
        release: 0.15,
      },
    }).toDestination();
    nextTargetSynth.volume.value = -14;
  });

  onUnmounted(() => {
    correctSynth?.dispose();
    correctSynth = undefined;
    incorrectSynth?.dispose();
    incorrectSynth = undefined;
    roundEndSynth?.dispose();
    roundEndSynth = undefined;
    nextTargetSynth?.dispose();
    nextTargetSynth = undefined;
  });

  function playCorrect() {
    if (!correctSynth || !toneRef) {
      return;
    }
    const now = toneRef.now();
    correctSynth.triggerAttackRelease("C5", "16n", now);
    correctSynth.triggerAttackRelease("E5", "16n", now + 0.08);
    correctSynth.triggerAttackRelease("G5", "8n", now + 0.16);
  }

  function playIncorrect() {
    if (!incorrectSynth || !toneRef) {
      return;
    }
    const now = toneRef.now();
    incorrectSynth.triggerAttackRelease("A3", "16n", now);
    incorrectSynth.triggerAttackRelease("Ab3", "8n", now + 0.09);
  }

  function playRoundEnd() {
    if (!roundEndSynth || !toneRef) {
      return;
    }
    const now = toneRef.now();
    roundEndSynth.triggerAttackRelease("C5", "8n", now);
    roundEndSynth.triggerAttackRelease("E5", "8n", now + 0.12);
    roundEndSynth.triggerAttackRelease("G5", "8n", now + 0.24);
    roundEndSynth.triggerAttackRelease("C6", "2n", now + 0.36);
  }

  // Multiplayer only: everyone has guessed or skipped, moving on to
  // the next target. Neutral (neither celebratory nor negative) since
  // it fires regardless of whether the local player got it right.
  function playNextTarget() {
    if (!nextTargetSynth || !toneRef) {
      return;
    }
    const now = toneRef.now();
    nextTargetSynth.triggerAttackRelease("A4", "32n", now);
    nextTargetSynth.triggerAttackRelease("D5", "16n", now + 0.07);
  }

  return {
    playCorrect,
    playIncorrect,
    playRoundEnd,
    playNextTarget,
  };
}
