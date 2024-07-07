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
  rotation: {
    minSpeed: number
    maxSpeed: number
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
  rotation: {
    minSpeed: 15,
    maxSpeed: 20,
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
    randomiseGeometry() {
      const geometryAttributes: GeometryAttributes[] = []
      for (let i = 0; i < randomInt(1, 3); i++) {
        const color = `rgb(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(0, 255)})`

        geometryAttributes.push({
          type: getRandomValue(GeometryType),
          color,
          solid: false,
          radius: randomInt(4, 8),
          detail: randomInt(50, 100),
        })
      }

      this.geometry.config = geometryAttributes
      const geometry = this.geometry.config.map(geometry =>
        geometryFactory(geometry),
      )
      this.renderer?.placeGeometry(geometry)
    },

    randomise() {
      this.followCursor = false

      this.setMinRotationSpeed(randomInt(10, 30))
      this.setMaxRotationSpeed(randomInt(this.rotation.minSpeed, 100))

      this.randomiseZoom()

      this.setBeatMatchEnabled(randomBool())
      if (this.beatMatch.enabled) {
        this.beatMatch.bpm = randomInt(20, 140)
      }

      this.randomiseGeometry()
    },

    zoomIn() {
      this.zoom.current += 0.1
    },
    zoomOut() {
      this.zoom.current -= 0.1
    },
    randomiseZoom() {
      this.setCurrentZoom(randomInt(this.zoom.min, this.zoom.max))

      this.autoZoom.mode = getRandomValue([
        AutoZoomMode.SMOOTH,
        AutoZoomMode.RANDOM,
        AutoZoomMode.JUMP,
      ])

      if (this.autoZoom.mode === AutoZoomMode.SMOOTH) {
        this.autoZoom.speed = random(0.001, 0.1)
      }

      this.setMinZoom(randomInt(-4, 4))
      this.setMaxZoom(randomInt(8, 16))
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
        const randomRotationPosition = random(0, 100)
        const randomRotationSpeed = random(
          this.rotation.minSpeed / 10000,
          this.rotation.maxSpeed / 10000,
        )

        geometry
          .setRotation(randomRotationPosition)
          .setRotationSpeed(randomRotationSpeed)
      })

      if (this.autoZoom.mode === AutoZoomMode.RANDOM) {
        this.zoom.current = random(this.zoom.min, this.zoom.max)
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

    setMinRotationSpeed(rotationSpeed: number) {
      this.rotation.minSpeed = rotationSpeed
      if (this.rotation.maxSpeed < rotationSpeed) {
        this.rotation.maxSpeed = rotationSpeed
      }
    },

    setMaxRotationSpeed(rotationSpeed: number) {
      this.rotation.maxSpeed = rotationSpeed
      if (this.rotation.minSpeed > rotationSpeed) {
        this.rotation.minSpeed = rotationSpeed
      }
    },
  },
})

const random = (min: number, max: number) => Math.random() * (max - min) + min

const randomInt = (min: number, max: number) => Math.floor(random(min, max))

const randomBool = () => Math.random() >= 0.5

function getRandomValue<T>(values: object | T[]): T {
  if (typeof values === 'object') {
    const entries = Object.values(values)
    return entries[randomInt(0, entries.length)]
  } else {
    // @ts-expect-error Weirdly being inferred as 'never'
    return values[randomInt(0, values.length)]
  }
}
