import { defineStore } from 'pinia'
import { isMobile } from 'is-mobile'
import type { Vector3 } from 'three'
import { useSiteStore } from './site'
import {
  type GeometryAttributes,
  mapGeometryAttributes,
  PartialSphere,
} from '~/util/3d/geometry'
import type { Renderer } from '~/util/3d/renderer'
import {
  getRandomBool,
  getRandomGeometry,
  getRandomInt,
  getRandomNum,
  getRandomValue,
} from '~/util/random'
import { getRandomColor } from '~/util/color'

export enum AutoZoomMode {
  DISABLED = 'Disabled',
  SMOOTH = 'Smooth',
  JUMP = '4/4 Jump',
  RANDOM = 'Random',
}

export interface VisualStore {
  renderer: Renderer | undefined
  geometryConfig: GeometryAttributes[]
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
  scrollToZoom: boolean
  rotationSpeed: {
    x: number
    y: number
  }
  beatMatch: {
    enabled: boolean
    randomizeColors: boolean
    syncToBar: boolean
  }
  listeners: {
    onRandomise: (() => void) | undefined
  }
}

export const defaultGeometry: GeometryAttributes[] = [
  {
    type: PartialSphere.getName(),
    color: 'rgb(0, 128, 0)',
    solid: false,
    radius: 5,
    detail: 80,
    reverseRotation: false,
  },
  {
    type: PartialSphere.getName(),
    color: 'rgb(0, 0, 255)',
    solid: false,
    radius: 5,
    detail: 90,
    reverseRotation: false,
  },
  {
    type: PartialSphere.getName(),
    color: 'rgb(255, 0, 0)',
    solid: false,
    radius: 5,
    detail: 100,
    reverseRotation: false,
  },
]

const initialState: VisualStore = {
  renderer: undefined,
  geometryConfig: defaultGeometry,
  followCursor: true,
  zoom: {
    min: -2,
    max: 4,
    current: 4,
  },
  autoZoom: {
    mode: AutoZoomMode.SMOOTH,
    speed: 5,
    direction: 'out',
    beat: 0,
  },
  scrollToZoom: true,
  rotationSpeed: {
    x: 5,
    y: 5,
  },
  beatMatch: {
    enabled: true,
    randomizeColors: true,
    syncToBar: true,
  },
  listeners: {
    onRandomise: undefined,
  },
}

export const useVisualsStore = defineStore('visuals', {
  state: () => initialState,
  actions: {
    generateGeometry() {
      const geometry = this.geometryConfig.map(mapGeometryAttributes)
      this.renderer!.placeGeometry(geometry)
      this.syncRotationSpeed()
    },
    addRandomGeometryConfig() {
      this.geometryConfig.push(getRandomGeometry())
    },
    deleteGeometryConfig(index: number) {
      this.geometryConfig.splice(index, 1)
    },
    randomiseGeometry() {
      this.geometryConfig = []
      for (let i = 0; i < getRandomInt(1, 4); i++) {
        this.addRandomGeometryConfig()
      }
      this.generateGeometry()
    },

    randomise() {
      const siteStore = useSiteStore()

      this.randomiseZoom()

      this.setBeatMatchEnabled(getRandomBool())
      if (this.beatMatch.enabled) {
        siteStore.updateBpm(getRandomInt(90, 190))
      }
      this.beatMatch.syncToBar = this.beatMatch.enabled
        ? getRandomBool()
        : false
      this.beatMatch.randomizeColors = this.beatMatch.enabled

      this.randomiseGeometry()
      this.setRotationSpeed(getRandomNum(10, 25), getRandomNum(10, 25))

      this.listeners.onRandomise?.()
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
        this.autoZoom.speed = getRandomNum(1, 50)
      }

      this.setMinZoom(getRandomInt(-2, 2))
      this.setMaxZoom(getRandomInt(4, 8))
      this.autoZoom.direction = this.autoZoom.direction === 'in' ? 'out' : 'in'
    },

    tick(positionData: {
      mousePosition: Vector3 | undefined
      startingPosition: Vector3 | undefined
    }) {
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
      const objectScale = isMobile() ? 0.9 : 1
      this.renderer?.getGeometry()!.forEach((object) => {
        object.rotate()
        object.setSize(objectScale)
        if (!isMobile() && this.followCursor && mousePosition) {
          object.moveTowardPosition(mousePosition)
        }
        else if (startingPosition) {
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
      }
      else if (this.zoom.current <= this.zoom.min) {
        this.autoZoom.direction = 'in'
      }

      if (this.autoZoom.direction === 'in') {
        this.zoom.current += (this.autoZoom.speed / 1000)
      }
      else {
        this.zoom.current -= (this.autoZoom.speed / 1000)
      }
    },

    beatMatchTick() {
      const siteStore = useSiteStore()

      if (!this.beatMatch.enabled) {
        return
      }

      const bpm = this.beatMatch.syncToBar
        ? siteStore.beatMatch.bpm / siteStore.beatMatch.beatsPerBar
        : siteStore.beatMatch.bpm
      const intervalMs = (60 / bpm) * 1000
      if (
        new Date().getTime()
          <= siteStore.beatMatch.lastTime.getTime() + intervalMs
      ) {
        return
      }

      this.renderer?.getGeometry()!.forEach((geometry, index) => {
        const randomRotationPosition = getRandomNum(0, 100)
        geometry.setRotation(randomRotationPosition)

        if (this.beatMatch.randomizeColors) {
          const randomColor = getRandomColor()
          this.geometryConfig[index].color = `rgb(${randomColor.join(', ')})`
          geometry.setColor(...randomColor)
        }
      })

      if (this.autoZoom.mode === AutoZoomMode.RANDOM) {
        this.zoom.current = getRandomNum(this.zoom.min, this.zoom.max)
      }
      else if (this.autoZoom.mode === AutoZoomMode.JUMP) {
        const zoomIncrement = (this.zoom.max - this.zoom.min) / 3
        this.zoom.current = this.zoom.max - zoomIncrement * this.autoZoom.beat
        this.autoZoom.beat++
        if (this.autoZoom.beat >= siteStore.beatMatch.beatsPerBar) {
          this.autoZoom.beat = 0
        }
      }

      siteStore.updateLastBeatTime()
    },
    setBeatMatchEnabled(enabled: boolean | null) {
      const siteStore = useSiteStore()

      this.beatMatch.enabled = enabled ?? false
      if (
        !enabled
        && ![AutoZoomMode.DISABLED, AutoZoomMode.SMOOTH].includes(
          this.autoZoom.mode,
        )
      ) {
        this.autoZoom.mode = AutoZoomMode.SMOOTH
      }

      if (enabled) {
        siteStore.addBpmListener({
          consumer: 'visuals',
          onTap: () => {
            if (!this.beatMatch.enabled) {
              this.beatMatch.enabled = true
            }
          },
          onUpdate: () => {
            if (this.autoZoom.mode === AutoZoomMode.JUMP) {
              this.autoZoom.beat = 0
              this.zoom.current = this.zoom.max
            }
          },
        })
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
      this.renderer!.getGeometry()!.forEach((geometry) => {
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
    setFollowCursor(followCursor: boolean) {
      this.followCursor = followCursor
    },

    setAllRotation(x: number, y: number, z: number) {
      this.renderer!.getGeometry()!.forEach((geometry) => {
        geometry.setRotation(x, y, z)
      })
    },

    setRenderer(renderer: Renderer) {
      const siteStore = useSiteStore()
      this.renderer = renderer
      this.renderer
        .setGetZoom(() => this.zoom.current)
        .setOnRenderTick((_, positionData) => {
          this.tick(positionData)
        })
        .setOnInit(() => this.syncRotationSpeed())
        .setOnClick(() => this.randomise())
        .setOnKeyDown((renderer, event) => {
          if (event.code === 'Space') {
            siteStore.tapBpm()
          }
          else if (event.key === 'Shift') {
            renderer.randomiseColors()
          }
          else if (event.key === 'Control') {
            renderer.randomiseRotations()
          }
        })
        .setOnScroll((_renderer, event) => {
          if (!this.scrollToZoom) {
            return
          }
          if (event.deltaY > 0) {
            this.zoomOut()
          }
          else if (event.deltaY < 0) {
            this.zoomIn()
          }
        })
        .setGetDefaultGeometry(() => this.geometryConfig)
    },

    setListener(name: keyof VisualStore['listeners'], closure: () => void) {
      this.listeners[name] = closure
    },
    removeListener(name: keyof VisualStore['listeners']) {
      this.listeners[name] = undefined
    },
  },
})
