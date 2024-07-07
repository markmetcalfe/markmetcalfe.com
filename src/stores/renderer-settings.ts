import { defineStore } from 'pinia'
import {
  Geometry,
  GeometryAttributes,
  GeometryType,
  geometryFactory,
} from '../3d/geometry'
import isMobile from 'is-mobile'
import { Vector3 } from 'three'
import { ThreeJSRenderer } from '../3d'
import {
  getRandomBool,
  getRandomGeometry,
  getRandomInt,
  getRandomNum,
  getRandomValue,
} from '../util/random'

export enum AutoZoomMode {
  DISABLED = 'Disabled',
  SMOOTH = 'Smooth',
  JUMP = '4/4 Jump',
  RANDOM = 'Random',
}

export interface RendererSettings {
  renderer: ThreeJSRenderer | undefined
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
  rotationSpeed: {
    x: number
    y: number
  }
  beatMatch: {
    enabled: boolean
    bpm: number
    lastTime: Date
    taps: Date[]
  }
  isMobile: boolean
  isDesktop: boolean
}

const defaultGeometry: GeometryAttributes[] = [
  {
    type: GeometryType.PARTIAL_SPHERE,
    color: 'rgb(0, 128, 0)',
    solid: false,
    radius: 5,
    detail: 80,
    reverseRotation: false,
  },
  {
    type: GeometryType.PARTIAL_SPHERE,
    color: 'rgb(0, 0, 255)',
    solid: false,
    radius: 5,
    detail: 90,
    reverseRotation: false,
  },
  {
    type: GeometryType.PARTIAL_SPHERE,
    color: 'rgb(255, 0, 0)',
    solid: false,
    radius: 5,
    detail: 100,
    reverseRotation: false,
  },
]

const defaultSettings: RendererSettings = {
  renderer: undefined,
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
  rotationSpeed: {
    x: 20,
    y: 20,
  },
  beatMatch: {
    enabled: true,
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
    generateGeometry() {
      const geometry = this.geometry.config.map(geometry =>
        geometryFactory(geometry),
      )
      this.renderer?.placeGeometry(geometry)
      this.syncRotationSpeed()
    },
    addRandomGeometryConfig() {
      this.geometry.config.push(getRandomGeometry())
    },
    deleteGeometryConfig(index: number) {
      this.geometry.config.splice(index, 1)
    },
    randomiseGeometry() {
      this.geometry.config = []
      for (let i = 0; i < getRandomInt(1, 4); i++) {
        this.addRandomGeometryConfig()
      }

      const geometry = this.geometry.config.map(geometry =>
        geometryFactory(geometry),
      )
      this.renderer?.placeGeometry(geometry)
    },

    randomise() {
      this.followCursor = false

      this.randomiseZoom()

      this.setBeatMatchEnabled(getRandomBool())
      this.setBeatMatchBpm(getRandomInt(20, 140))

      this.randomiseGeometry()
      this.setRotationSpeed(getRandomNum(10, 25), getRandomNum(10, 25))
    },

    zoomIn() {
      this.zoom.current += 0.1
    },
    zoomOut() {
      this.zoom.current -= 0.1
    },
    randomiseZoom() {
      this.setCurrentZoom(getRandomInt(this.zoom.min, this.zoom.max))

      this.autoZoom.mode = getRandomValue([
        AutoZoomMode.SMOOTH,
        AutoZoomMode.RANDOM,
        AutoZoomMode.JUMP,
      ])

      if (this.autoZoom.mode === AutoZoomMode.SMOOTH) {
        this.autoZoom.speed = getRandomNum(0.001, 0.1)
      }

      this.setMinZoom(getRandomInt(-1, 4))
      this.setMaxZoom(getRandomInt(8, 16))
      this.autoZoom.direction = this.autoZoom.direction === 'in' ? 'out' : 'in'
    },

    tick(positionData: {
      mousePosition: Vector3 | undefined
      startingPosition: Vector3 | undefined
    }) {
      if (localStorage.getItem('is_playwright_test')) {
        // Playwright test is running, skipping renderer state tick
        return
      }
      this.movementTick(positionData)
      this.autoZoomTick()
      this.beatMatchTick()
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
        object.rotate()
        object.setSize(objectScale)
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

    beatMatchTick() {
      if (!this.beatMatch.enabled) {
        return
      }

      const intervalMs = (60 / this.beatMatch.bpm) * 1000
      if (
        new Date().getTime() <=
        this.beatMatch.lastTime.getTime() + intervalMs
      ) {
        return
      }

      this.geometry.active.forEach(geometry => {
        const randomRotationPosition = getRandomNum(0, 100)
        geometry.setRotation(randomRotationPosition)
      })

      if (this.autoZoom.mode === AutoZoomMode.RANDOM) {
        this.zoom.current = getRandomNum(this.zoom.min, this.zoom.max)
      } else if (this.autoZoom.mode === AutoZoomMode.JUMP) {
        const zoomIncrement = (this.zoom.max - this.zoom.min) / 3
        this.zoom.current = this.zoom.max - zoomIncrement * this.autoZoom.beat
        this.autoZoom.beat++
        if (this.autoZoom.beat >= 4) {
          this.autoZoom.beat = 0
        }
      }

      this.beatMatch.lastTime = new Date()
    },
    tapBpm() {
      if (!this.beatMatch.enabled) {
        return
      }

      const now = new Date()

      // We only care about the latest 4 taps
      if (this.beatMatch.taps.length >= 4) {
        this.beatMatch.taps.shift()
      }

      // If the last tap was over 2 seconds ago we ignore all previous taps
      const lastTap = this.beatMatch.taps[this.beatMatch.taps.length - 1]
      if (lastTap && now.getTime() - lastTap.getTime() > 2000) {
        this.beatMatch.taps = []
      }

      this.beatMatch.taps.push(now)
      this.beatMatch.lastTime = new Date(0) // Set last time to 0 to force randomisation

      if (this.autoZoom.mode === AutoZoomMode.JUMP) {
        this.autoZoom.beat = 0
        this.zoom.current = this.zoom.max
      }

      if (this.beatMatch.taps.length < 2) {
        return
      }

      const timesBetween = []
      for (let i = 1; i < this.beatMatch.taps.length; i++) {
        const a = this.beatMatch.taps[i - 1].getTime()
        const b = this.beatMatch.taps[i].getTime()
        timesBetween.push(b - a)
      }

      const averageTimeBetween =
        timesBetween.reduce((a, b) => a + b) / timesBetween.length
      this.beatMatch.bpm = (60 / averageTimeBetween) * 1000
    },
    setBeatMatchEnabled(enabled: boolean) {
      this.beatMatch.enabled = enabled
      if (
        !enabled &&
        ![AutoZoomMode.DISABLED, AutoZoomMode.SMOOTH].includes(
          this.autoZoom.mode,
        )
      ) {
        this.autoZoom.mode = AutoZoomMode.SMOOTH
      }
    },
    setBeatMatchBpm(bpm: number) {
      if (this.beatMatch.enabled) {
        this.beatMatch.bpm = bpm
      }
    },

    setMinZoom(zoom: number) {
      this.zoom.min = zoom
      if (this.zoom.max < zoom) {
        this.zoom.max = zoom
      }
    },

    setMaxZoom(zoom: number) {
      this.zoom.max = zoom
      if (this.zoom.min > zoom) {
        this.zoom.min = zoom
      }
    },

    setCurrentZoom(zoom: number) {
      this.zoom.current = zoom
      if (this.zoom.min > zoom) {
        this.zoom.min = zoom
      }
      if (this.zoom.max < zoom) {
        this.zoom.max = zoom
      }
    },

    syncRotationSpeed() {
      this.geometry.active.forEach(geometry => {
        geometry.setRotationSpeed(this.rotationSpeed)
      })
    },
    setRotationSpeed(x: number, y: number) {
      this.rotationSpeed = { x, y }
      this.syncRotationSpeed()
    },
    setXRotationSpeed(speed: number) {
      this.rotationSpeed.x = speed
      this.syncRotationSpeed()
    },
    setYRotationSpeed(speed: number) {
      this.rotationSpeed.y = speed
      this.syncRotationSpeed()
    },
  },
})
