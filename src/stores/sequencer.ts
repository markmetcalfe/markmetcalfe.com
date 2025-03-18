import { defineStore } from 'pinia'
import * as Tone from 'tone'
import { Synth, allSynths } from '../tone/synths'
import { useSiteStore } from './site'

export interface SequencerStore {
  allSynths: Synth[] | undefined
  usedSynths: Synth[] | undefined
  grid: boolean[][] | undefined
  gridRowCount: number
  barCount: number
  currentBeat: number
  isPlaying: boolean
}

const initialState: SequencerStore = {
  allSynths: undefined,
  usedSynths: undefined,
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
        this.grid !== undefined &&
        this.grid.some(row => row.some(col => col !== false))
      )
    },
  },
  actions: {
    init() {
      if (this.allSynths !== undefined) {
        this.updateBarCount(4)
        return
      }

      const siteStore = useSiteStore()

      const localSynths = allSynths.map(synth => new synth())
      this.usedSynths = localSynths
      this.allSynths = [...localSynths]

      this.resetGrid()
      this.updateBarCount(4)

      Tone.setContext(new Tone.Context({ latencyHint: 'playback' }))

      Tone.getTransport().scheduleRepeat(time => {
        this.grid!.forEach((synth, index) => {
          if (synth[this.currentBeat]) {
            localSynths[index].triggerSound(time)
          }
        })
        this.nextBeat()
      }, this.beatCount + 'n')

      siteStore.addBpmListener({
        consumer: 'sequencer',
        onTap: () => this.syncBpm(),
        onUpdate: () => this.syncBpm(),
      })
    },

    toggleBeat(synthIndex: number, beatIndex: number) {
      this.grid![synthIndex][beatIndex] = !this.grid![synthIndex][beatIndex]
    },

    nextBeat() {
      this.currentBeat = (this.currentBeat + 1) % this.beatCount
    },

    togglePlay() {
      this.isPlaying ? this.stop() : this.start()
    },

    start() {
      this.isPlaying = true
      this.currentBeat = 0
      Tone.start()
      this.syncBpm()
      Tone.getTransport().start('+0.1')
    },

    stop() {
      this.isPlaying = false
      this.currentBeat = 0
      Tone.getTransport().stop()
    },

    syncBpm() {
      const siteStore = useSiteStore()
      Tone.getTransport().bpm.value = siteStore.beatMatch.bpm
    },

    resetGrid() {
      this.stop()
      this.grid = Array(this.gridRowCount)
        .fill(false)
        .map(() => Array(this.beatCount).fill(false))
    },

    addGridRow(synthId?: string) {
      const synth = synthId ? this.getSynth(synthId) : this.allSynths![0]
      if (!synth) {
        throw new Error('No valid synth found')
      }

      this.grid!.push(Array(this.beatCount).fill(false))
      this.usedSynths!.push(synth)
      this.gridRowCount++
    },

    deleteGridRow(rowIndex: number) {
      this.grid!.splice(rowIndex, 1)
      this.usedSynths!.splice(rowIndex, 1)
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

      this.grid = this.grid?.map(row => {
        const currentColumns = row.length
        if (currentColumns < this.beatCount) {
          return [...row, ...Array(this.beatCount - currentColumns).fill(false)]
        } else if (currentColumns > this.beatCount) {
          return row.slice(0, this.beatCount)
        } else {
          return row
        }
      })

      if (wasPlaying) {
        this.start()
      }
    },

    addBars() {
      this.updateBarCount(this.barCount + 1)
    },

    deleteBars() {
      this.updateBarCount(this.barCount - 1)
    },

    getSynth(id: string) {
      return this.allSynths!.find(synth => synth.getId() === id)
    },

    useSynth(index: number, synthId: string) {
      this.usedSynths![index] = this.getSynth(synthId)!
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
      this.usedSynths = this.usedSynths!.map(synth => {
        if (synth.getId() === synthId) {
          return this.allSynths![0]
        }
        return synth
      })
    },
  },
})
