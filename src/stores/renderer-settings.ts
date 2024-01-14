import { defineStore } from 'pinia'
import {
  Geometry,
  GeometryAttributes,
  GeometryType,
  geometryFactory,
} from '../3d/geometry'
import isMobile from 'is-mobile'
import { Vector3 } from 'three'

export enum AutoZoomMode {
  DISABLED = 'Disabled',
  SMOOTH = 'Smooth',
  JUMP = '4/4 Jump',
  RANDOM = 'Random',
}

export interface RendererSettings {
  initialiseRenderer: (() => Promise<void>) | undefined
  destroyRenderer: (() => void) | undefined
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
    mode: AutoZoomMode
    speed: number
    direction: 'in' | 'out'
    beat: number
  }
  randomisation: {
    bpm: number
    lastTime: Date
    taps: Date[]
    minRotationSpeed: number
    maxRotationSpeed: number
  }
  isMobile: boolean
  isDesktop: boolean
}

const defaultGeometry: GeometryAttributes[] = [
  {
    type: GeometryType.PARTIAL_SPHERE,
    color: 'green',
    solid: false,
    radius: 5,
    detail: 80,
  },
  {
    type: GeometryType.PARTIAL_SPHERE,
    color: 'blue',
    solid: false,
    radius: 5,
    detail: 90,
  },
  {
    type: GeometryType.PARTIAL_SPHERE,
    color: 'red',
    solid: false,
    radius: 5,
    detail: 100,
  },
]

const defaultSettings: RendererSettings = {
  initialiseRenderer: undefined,
  destroyRenderer: undefined,
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
    mode: AutoZoomMode.SMOOTH,
    speed: 0.01,
    direction: 'out',
    beat: 0,
  },
  randomisation: {
    bpm: 140 / 4, // 1 bar of 140s dub
    lastTime: new Date(0),
    taps: [],
    minRotationSpeed: 15,
    maxRotationSpeed: 20,
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
    addNewGeometryConfig() {
      this.geometry.config.push({
        type: GeometryType.CUBE,
        color: 'green',
        solid: false,
        radius: 5,
        detail: 30,
      })
    },
    deleteGeometryConfig(index: number) {
      this.geometry.config.splice(index, 1)
    },

    zoomIn() {
      this.zoom.current += 0.1
    },
    zoomOut() {
      this.zoom.current -= 0.1
    },

    tick(positionData: {
      mousePosition: Vector3 | undefined
      startingPosition: Vector3 | undefined
    }) {
      this.movementTick(positionData)
      this.autoZoomTick()
      this.randomiseTick()
    },

    movementTick({
      mousePosition,
      startingPosition,
    }: {
      mousePosition: Vector3 | undefined
      startingPosition: Vector3 | undefined
    }) {
      const objectScale = this.isMobile ? 0.9 : 1
      this.geometry.active.forEach(object => {
        object.rotate().setSize(objectScale)
        if (!this.isMobile && this.followCursor && mousePosition) {
          object.moveTowardPosition(mousePosition)
        } else if (startingPosition) {
          object.moveTowardPosition(startingPosition)
        }
      })
    },

    autoZoomTick() {
      if (this.autoZoom.mode !== AutoZoomMode.SMOOTH) {
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
        new Date().getTime() <=
        this.randomisation.lastTime.getTime() + intervalMs
      ) {
        return
      }

      this.geometry.active.forEach(geometry => {
        const randomRotationPosition = Math.floor(Math.random() * 100)
        const randomRotationSpeed =
          Math.random() *
            (this.randomisation.maxRotationSpeed / 10000 -
              this.randomisation.minRotationSpeed / 10000) +
          this.randomisation.minRotationSpeed / 10000

        geometry
          .setRotation(randomRotationPosition)
          .setRotationSpeed(randomRotationSpeed)
      })

      if (this.autoZoom.mode === AutoZoomMode.RANDOM) {
        this.zoom.current =
          Math.random() * (this.zoom.max - this.zoom.min) + this.zoom.min
      } else if (this.autoZoom.mode === AutoZoomMode.JUMP) {
        const zoomIncrement = (this.zoom.max - this.zoom.min) / 3
        this.zoom.current = this.zoom.max - zoomIncrement * this.autoZoom.beat
        this.autoZoom.beat++
        if (this.autoZoom.beat >= 4) {
          this.autoZoom.beat = 0
        }
      }

      this.randomisation.lastTime = new Date()
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

      if (this.autoZoom.mode === AutoZoomMode.JUMP) {
        this.autoZoom.beat = 0
        this.zoom.current = this.zoom.max
      }

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
