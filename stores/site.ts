import { defineStore } from 'pinia'

interface TapListener {
  consumer: string
  onTap?: () => void
  onUpdate?: (bpm: number) => void
}

export interface SiteStore {
  beatMatch: {
    beatsPerBar: number
    bpm: number
    lastTime: Date
    taps: Date[]
    tapListeners: TapListener[]
  }
}

const initialState: SiteStore = {
  beatMatch: {
    beatsPerBar: 4,
    bpm: 108,
    lastTime: new Date(0),
    taps: [],
    tapListeners: [],
  },
}

export const useSiteStore = defineStore('site', {
  state: () => initialState,
  actions: {
    tapBpm() {
      this.beatMatch.tapListeners.forEach(listener => listener.onTap?.())

      const now = new Date()

      // We only care about the latest bar
      if (this.beatMatch.taps.length >= this.beatMatch.beatsPerBar) {
        this.beatMatch.taps.shift()
      }

      // If the last tap was over 2 seconds ago we ignore all previous taps
      const lastTap = this.beatMatch.taps[this.beatMatch.taps.length - 1]
      if (lastTap && now.getTime() - lastTap.getTime() > 2000) {
        this.beatMatch.taps = []
      }

      this.beatMatch.taps.push(now)
      this.beatMatch.lastTime = new Date(0) // Set last time to 0 to force randomisation

      if (this.beatMatch.taps.length < 2) {
        return
      }

      const timesBetween = []
      for (let i = 1; i < this.beatMatch.taps.length; i++) {
        const a = this.beatMatch.taps[i - 1].getTime()
        const b = this.beatMatch.taps[i].getTime()
        timesBetween.push(b - a)
      }

      const averageTimeBetween
        = timesBetween.reduce((a, b) => a + b) / timesBetween.length
      const bpm = (60 / averageTimeBetween) * 1000
      this.beatMatch.bpm = bpm
      this.beatMatch.tapListeners.forEach(listener => listener.onUpdate?.(bpm))
    },
    updateBpm(bpm: number) {
      this.beatMatch.bpm = bpm
      this.beatMatch.tapListeners.forEach(listener => listener.onUpdate?.(bpm))
    },
    updateLastBeatTime() {
      this.beatMatch.lastTime = new Date()
    },
    addBpmListener(listener: TapListener) {
      this.beatMatch.tapListeners.push(listener)
    },
    removeBpmListeners(consumer: string) {
      this.beatMatch.tapListeners = this.beatMatch.tapListeners.filter(
        listener => listener.consumer !== consumer,
      )
    },
  },
})
