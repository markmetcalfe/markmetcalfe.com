import { defineStore } from 'pinia'
import * as Tone from 'tone'
import { useSiteStore } from './site'
import type { Synth } from '~/util/tone/synths'
import { allSynths } from '~/util/tone/synths'

interface SequencerRow {
  synthId: string
  beats: boolean[]
  muted: boolean
  visualsSynced: boolean
}

export interface SequencerStore {
  allSynths: Synth[] | undefined
  grid: SequencerRow[] | undefined
  gridRowCount: number
  barCount: number
  currentBeat: number
  isPlaying: boolean
}

const initialState: SequencerStore = {
  allSynths: undefined,
  grid: undefined,
  gridRowCount: 4,
  barCount: 4,
  currentBeat: 0,
  isPlaying: false,
}

export const useSequencerStore = defineStore('sequencer', {
  state: () => initialState,
  getters: {
    beatCount(): number {
      const siteStore = useSiteStore()
      return this.barCount * siteStore.beatMatch.beatsPerBar
    },
    beatNumbers(): number[] {
      return Array.from({ length: this.beatCount }, (_, i) => i)
    },
    gridHasEntry(): boolean {
      return (
        this.grid !== undefined
        && this.grid.some(row => row.beats.some(beats => beats !== false))
      )
    },
  },
  actions: {
    init() {
      if (this.allSynths !== undefined) {
        return
      }

      const siteStore = useSiteStore()
      const visualStore = useVisualsStore()

      const localSynths: Record<string, Synth> = {}
      allSynths.forEach((synthClass) => {
        const synth = new synthClass()
        localSynths[synth.getId()] = synth
      })
      this.allSynths = Object.values(localSynths)

      this.initGrid(Object.values(localSynths))

      Tone.setContext(new Tone.Context({ latencyHint: 'playback' }))

      Tone.getTransport().scheduleRepeat((time) => {
        this.grid!.forEach((row) => {
          if (!row.muted && row.beats[this.currentBeat]) {
            localSynths[row.synthId].triggerSound(time)
            if (row.visualsSynced) {
              visualStore.beatMatchTick(true)
            }
          }
        })
        this.nextBeat()
      }, this.beatCount + 'n')

      siteStore.addBpmListener({
        consumer: 'sequencer',
        onUpdate: (bpm: number) => {
          Tone.getTransport().bpm.value = bpm
        },
      })
    },

    nextBeat() {
      this.currentBeat = (this.currentBeat + 1) % this.beatCount
    },

    togglePlay() {
      if (this.isPlaying) {
        this.stop()
      }
      else {
        this.start()
      }
    },

    start() {
      const siteStore = useSiteStore()
      this.isPlaying = true
      this.currentBeat = 0
      Tone.start()
      Tone.getTransport().bpm.value = siteStore.beatMatch.bpm
      Tone.getTransport().start('+0.1')
    },

    stop() {
      this.isPlaying = false
      this.currentBeat = 0
      Tone.getTransport().stop()
    },

    initGrid(synths: Synth[]) {
      this.grid = synths.map((synth, index) => ({
        synthId: synth.getId(),
        beats: Array(this.beatCount).fill(false),
        muted: false,
        visualsSynced: index === 0,
      }))
    },

    resetGrid() {
      this.stop()
      this.grid = this.grid!.map(row => ({
        ...row,
        beats: Array(this.beatCount).fill(false),
      }))
    },

    addGridRow(synthId?: string) {
      const synth = synthId ? this.getSynth(synthId) : this.allSynths![0]
      if (!synth) {
        throw new Error('No valid synth found')
      }
      this.grid!.push({
        synthId: synth.getId(),
        beats: Array(this.beatCount).fill(false),
        muted: false,
        visualsSynced: false,
      })
      this.gridRowCount++
    },

    deleteGridRow(rowIndex: number) {
      this.grid!.splice(rowIndex, 1)
      this.gridRowCount--
    },

    isBeatPlaying(beat: number) {
      if (!this.isPlaying) {
        return false
      }

      const currentBeatOffset = (this.currentBeat + 1) % this.beatCount
      return beat === currentBeatOffset
    },

    isBarStart(beat: number) {
      const siteStore = useSiteStore()
      return beat % siteStore.beatMatch.beatsPerBar === 0
    },

    updateBarCount(barCount: number) {
      const wasPlaying = this.isPlaying
      if (this.isPlaying) {
        this.stop()
      }

      this.barCount = barCount

      this.grid = this.grid!.map((row) => {
        const currentBeats = row.beats.length
        let beats = row.beats
        if (currentBeats < this.beatCount) {
          beats = [
            ...beats,
            ...Array(this.beatCount - currentBeats).fill(false),
          ]
        }
        else if (currentBeats > this.beatCount) {
          beats = beats.slice(0, this.beatCount)
        }
        return {
          ...row,
          beats,
        }
      })

      if (wasPlaying) {
        this.start()
      }
    },

    addBar() {
      this.updateBarCount(this.barCount + 1)
    },

    deleteBar() {
      this.updateBarCount(this.barCount - 1)
    },

    getSynth(id: string) {
      return this.allSynths!.find(synth => synth.getId() === id)
    },

    copySynth(synthId: string) {
      const copy = this.getSynth(synthId)!.clone()
      this.allSynths!.push(copy)
      return copy
    },

    deleteSynth(synthId: string) {
      this.allSynths = this.allSynths!.filter(
        synth => synth.getId() !== synthId,
      )
      this.grid = this.grid!.map(row => ({
        ...row,
        synthId:
          row.synthId === synthId ? this.allSynths![0].getId() : row.synthId,
      }))
    },

    syncVisuals(rowIndex: number) {
      const currentState = this.grid![rowIndex].visualsSynced === true
      this.grid!.forEach(row => row.visualsSynced = false)
      this.grid![rowIndex].visualsSynced = !currentState
      console.log({ grid: this.grid })
    },
  },
})
