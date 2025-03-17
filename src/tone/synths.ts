import * as Tone from 'tone'

export abstract class Synth {
  private synth: Tone.Synth | Tone.NoiseSynth | Tone.MetalSynth | undefined

  private hasChanges = false

  protected deleteable = false

  protected id: string

  public name = 'Synth'

  public note: string | undefined

  public octave: number | undefined

  public duration = 8

  protected envelope = {
    attack: 0.1,
    decay: 0.1,
    sustain: 0.1,
    release: 0.1,
  }

  constructor() {
    this.id =
      this.constructor.name + '-' + Math.random().toString(36).substring(2)
  }

  public getId() {
    return this.id
  }

  public clone() {
    const Constructor = this.constructor as new () => this
    const clone = new Constructor()
    clone.name = this.name + ' (copy)'
    clone.deleteable = true
    clone.note = this.note
    clone.octave = this.octave
    clone.duration = this.duration
    clone.envelope = Object.assign({}, this.envelope)
    return clone
  }

  protected abstract initSynth(): Tone.Synth | Tone.NoiseSynth | Tone.MetalSynth

  public getSynth(): Tone.Synth | Tone.NoiseSynth | Tone.MetalSynth {
    if (!this.synth || this.hasChanges) {
      this.synth = this.initSynth()
      this.hasChanges = false
    }
    return this.synth
  }

  public canDelete() {
    return this.deleteable
  }

  public canSetNote() {
    return false
  }

  public triggerSound(time: number): void {
    const synth = this.getSynth()
    if (this.canSetNote() && this.note && this.octave) {
      synth.triggerAttackRelease(
        this.note + this.octave,
        this.duration + 'n',
        time,
      )
    } else {
      synth.triggerAttackRelease(this.duration + 'n', time)
    }
  }

  public getEnvelopeValue(key: keyof Synth['envelope']) {
    return this.envelope[key]
  }

  public setEnvelopeValue(key: keyof Synth['envelope'], value: number) {
    this.envelope[key] = value
    this.hasChanges = true
  }
}

class MembraneSynth extends Synth {
  public name = 'Kick'

  public note = 'C'

  public octave = 1

  protected envelope = {
    attack: 0.01,
    decay: 0.2,
    sustain: 0.1,
    release: 0.8,
  }

  public canSetNote(): boolean {
    return true
  }

  protected initSynth(): Tone.MembraneSynth {
    return new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: { ...this.envelope, attackCurve: 'exponential' },
    }).toDestination()
  }
}

class NoiseSynth extends Synth {
  public name = 'Snare'

  protected envelope = {
    attack: 0.001,
    decay: 0.2,
    sustain: 0.01,
    release: 0.2,
  }

  protected initSynth(): Tone.NoiseSynth {
    return new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: this.envelope,
    }).toDestination()
  }
}

class MetalSynth extends Synth {
  public name = 'Hi-hat'

  public duration = 32

  protected envelope = {
    attack: 0.001,
    decay: 0.1,
    release: 0.1,
    sustain: 0.1,
  }

  protected initSynth(): Tone.MetalSynth {
    return new Tone.MetalSynth({
      envelope: this.envelope,
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).toDestination()
  }
}

class MembraneSynth2 extends Synth {
  public name = 'Tom'

  public note = 'G'

  public octave = 2

  protected envelope = {
    attack: 0.001,
    decay: 0.3,
    sustain: 0.01,
    release: 0.3,
  }

  public canSetNote(): boolean {
    return true
  }

  protected initSynth(): Tone.MembraneSynth {
    return new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      oscillator: { type: 'sine' },
      envelope: this.envelope,
    }).toDestination()
  }
}

export const allInstruments = [
  MembraneSynth,
  NoiseSynth,
  MetalSynth,
  MembraneSynth2,
]
