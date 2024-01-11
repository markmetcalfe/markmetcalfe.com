import { defineStore } from 'pinia'
import {
  Geometry,
  GeometryAttributes,
  GeometryType,
  geometryFactory,
} from '../3d/geometry'
import isMobile from 'is-mobile'
import { Vector3 } from 'three'

export interface RendererSettings {
  initialiseRenderer: (() => void) | undefined
  geometry: {
    config: GeometryAttributes[]
    active: Geometry[]
  }
  followCursor: boolean
  zoom: {
    min: number
    max: number
    current: number
  }
  autoZoom: {
    enabled: boolean
    speed: number
    direction: 'in' | 'out'
  }
  randomisation: {
    bpm: number
    lastTime: Date
    taps: Date[]
  }
  isMobile: boolean
  isDesktop: boolean
}

const defaultGeometry: GeometryAttributes[] = [
  {
    type: GeometryType.PartialSphere,
    color: 'green',
    radius: 5,
    detail: 80,
  },
  {
    type: GeometryType.PartialSphere,
    color: 'blue',
    radius: 5,
    detail: 90,
  },
  {
    type: GeometryType.PartialSphere,
    color: 'red',
    radius: 5,
    detail: 100,
  },
]

const defaultSettings: RendererSettings = {
  initialiseRenderer: undefined,
  geometry: {
    config: defaultGeometry,
    active: [],
  },
  followCursor: true,
  zoom: {
    min: -2,
    max: 7,
    current: 10,
  },
  autoZoom: {
    enabled: true,
    speed: 0.01,
    direction: 'out',
  },
  randomisation: {
    bpm: 140 / 4, // 1 bar of 140s dub
    lastTime: new Date(0),
    taps: [],
  },
  isMobile: isMobile(),
  isDesktop: !isMobile(),
}

export const useRendererSettingsStore = defineStore('renderer-settings', {
  state: () => defaultSettings,
  actions: {
    generateGeometry(callback: (geometry: Geometry[]) => void) {
      const geometry = this.geometry.config.map(geometry =>
        geometryFactory(geometry),
      )

      callback(geometry)

      this.geometry.active = geometry
    },

    zoomIn() {
      this.zoom.current += 0.1
    },
    zoomOut() {
      this.zoom.current -= 0.1
    },

    tick(data: { targetPosition: Vector3 | undefined }) {
      this.movementTick(data.targetPosition)
      this.autoZoomTick()
      this.randomiseTick()
    },

    movementTick(targetPosition: Vector3 | undefined) {
      const objectScale = this.isMobile ? 0.9 : 1
      this.geometry.active.forEach(object => {
        object.rotate().setSize(objectScale)
        if (!this.isMobile && this.followCursor && targetPosition) {
          object.moveTowardPosition(targetPosition)
        }
      })
    },

    autoZoomTick() {
      if (!this.autoZoom.enabled) {
        return
      }

      if (this.zoom.current >= this.zoom.max) {
        this.autoZoom.direction = 'out'
      } else if (this.zoom.current <= this.zoom.min) {
        this.autoZoom.direction = 'in'
      }

      if (this.autoZoom.direction === 'in') {
        this.zoom.current += this.autoZoom.speed
      } else {
        this.zoom.current -= this.autoZoom.speed
      }
    },

    randomiseTick() {
      const intervalMs = (60 / this.randomisation.bpm) * 1000
      if (
        new Date().getTime() >
        this.randomisation.lastTime.getTime() + intervalMs
      ) {
        this.geometry.active.forEach(geometry => {
          const randomRotationPosition = Math.floor(Math.random() * 100)
          const randomRotationSpeed = Math.random() * 0.002
          geometry
            .setRotation(randomRotationPosition)
            .setRotationSpeed(randomRotationSpeed)
        })
        this.randomisation.lastTime = new Date()
      }
    },
    tap() {
      const now = new Date()

      // We only care about the latest 4 taps
      if (this.randomisation.taps.length >= 4) {
        this.randomisation.taps.shift()
      }

      // If the last tap was over 2 seconds ago we ignore all previous taps
      const lastTap =
        this.randomisation.taps[this.randomisation.taps.length - 1]
      if (lastTap && now.getTime() - lastTap.getTime() > 2000) {
        this.randomisation.taps = []
      }

      this.randomisation.taps.push(now)
      this.randomisation.lastTime = new Date(0) // Set last time to 0 to force randomisation

      if (this.randomisation.taps.length < 2) {
        return
      }

      const timesBetween = []
      for (let i = 1; i < this.randomisation.taps.length; i++) {
        const a = this.randomisation.taps[i - 1].getTime()
        const b = this.randomisation.taps[i].getTime()
        timesBetween.push(b - a)
      }

      const averageTimeBetween =
        timesBetween.reduce((a, b) => a + b) / timesBetween.length
      this.randomisation.bpm = (60 / averageTimeBetween) * 1000
    },
  },
})
