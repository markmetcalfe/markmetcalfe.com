import { defineStore } from 'pinia'
import * as Tone from 'tone'
import { Synth, allInstruments } from '../tone/synths'
import { useSiteStore } from './site'

export interface SequencerStore {
  allInstruments: Synth[] | undefined
  usedInstruments: Synth[] | undefined
  grid: boolean[][] | undefined
  gridRowCount: number
  barCount: number
  currentBeat: number
  isPlaying: boolean
}

const initialState: SequencerStore = {
  allInstruments: undefined,
  usedInstruments: undefined,
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
    init(barCount = 4) {
      if (this.allInstruments !== undefined) {
        this.updateBarCount(barCount)
        return
      }

      const siteStore = useSiteStore()

      const localInstruments = Object.values(allInstruments).map(
        instrument => new instrument(),
      )
      this.allInstruments = localInstruments
      this.usedInstruments = localInstruments

      this.resetGrid()
      if (barCount) {
        this.updateBarCount(barCount)
      }

      Tone.getTransport().scheduleRepeat(time => {
        this.grid!.forEach((instrument, instrumentIndex) => {
          if (instrument[this.currentBeat]) {
            localInstruments[instrumentIndex].triggerSound(time)
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

    toggleBeat(instrumentIndex: number, beatIndex: number) {
      this.grid![instrumentIndex][beatIndex] =
        !this.grid![instrumentIndex][beatIndex]
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
      Tone.getTransport().start()
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
      this.grid = Array(this.gridRowCount)
        .fill(false)
        .map(() => Array(this.beatCount).fill(false))
    },

    addGridRow() {
      this.grid!.push(Array(this.beatCount).fill(false))
      this.usedInstruments!.push(this.allInstruments![0])
      this.gridRowCount++
    },

    deleteGridRow(rowIndex: number) {
      this.grid!.splice(rowIndex, 1)
      this.usedInstruments!.splice(rowIndex, 1)
      this.gridRowCount--
    },

    isBeatPlaying(beat: number) {
      if (!this.isPlaying) {
        return false
      }
      return beat === this.currentBeat
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

    getInstrument(id: string) {
      return this.allInstruments!.find(instrument => instrument.getId() === id)
    },

    useInstrument(index: number, instrumentId: string) {
      this.usedInstruments![index] = this.getInstrument(instrumentId)!
    },

    copyInstrument(instrumentId: string) {
      const copy = this.getInstrument(instrumentId)!.clone()
      this.allInstruments!.push(copy)
      return copy
    },

    deleteInstrument(instrumentId: string) {
      this.allInstruments = this.allInstruments!.filter(
        instrument => instrument.getId() !== instrumentId,
      )
      this.usedInstruments = this.usedInstruments!.map(instrument => {
        if (instrument.getId() === instrumentId) {
          return this.allInstruments![0]
        }
        return instrument
      })
    },
  },
})
