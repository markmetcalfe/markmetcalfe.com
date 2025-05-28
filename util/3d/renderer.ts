import * as THREE from 'three'
import {
  mapGeometryAttributes } from './geometry'
import type { GeometryAttributes,
  Geometry } from './geometry'
import { getRandomColor } from '~/util/color'
import { getRandomInt } from '~/util/random'

export class Renderer {
  protected container: HTMLElement
  protected scene: THREE.Scene | undefined
  protected camera: THREE.PerspectiveCamera | undefined
  protected renderer: THREE.WebGLRenderer | undefined
  protected geometry: Geometry[] | undefined

  protected mousePosX = 0
  protected mousePosY = 0

  protected onClick = (_renderer: this, _event: MouseEvent) => {}
  protected onScroll = (_renderer: this, _event: WheelEvent) => {}
  protected onMouseMove = (_renderer: this, event: MouseEvent) => {
    this.mousePosX = event.clientX
    this.mousePosY = event.clientY
  }

  protected onKeyDown = (_renderer: this, _event: KeyboardEvent) => {}
  protected onRenderTick = (
    _renderer: this,
    _positionData: {
      mousePosition: THREE.Vector3 | undefined
      startingPosition: THREE.Vector3 | undefined
    },
  ) => {}

  protected onInit = (_renderer: this) => {}

  protected getZoom = () => 1
  protected getPixelRatio = () => (window.devicePixelRatio > 1 ? 2 : 1)
  protected getWidth = () => this.container.clientWidth * this.getPixelRatio()
  protected getHeight = () =>
    this.container.clientHeight * this.getPixelRatio()

  protected getDefaultGeometry = (): GeometryAttributes[] => []

  constructor(container: HTMLElement) {
    this.container = container
  }

  public setOnMouseMove(
    onMouseMove: (renderer: this, event: MouseEvent) => void,
  ): this {
    this.onMouseMove = onMouseMove
    return this
  }

  public setOnClick(
    onClick: (renderer: this, event: MouseEvent) => void,
  ): this {
    this.onClick = onClick
    return this
  }

  public setOnScroll(
    onScroll: (renderer: this, event: WheelEvent) => void,
  ): this {
    this.onScroll = onScroll
    return this
  }

  public setOnKeyDown(
    onKeyDown: (renderer: this, event: KeyboardEvent) => void,
  ): this {
    this.onKeyDown = onKeyDown
    return this
  }

  public setOnRenderTick(
    onRenderTick: (
      renderer: this,
      positionData: {
        mousePosition: THREE.Vector3 | undefined
        startingPosition: THREE.Vector3 | undefined
      }
    ) => void,
  ): this {
    this.onRenderTick = onRenderTick
    return this
  }

  public setOnInit(onInit: (_renderer: this) => void) {
    this.onInit = onInit
    return this
  }

  public setGetZoom(getZoom: () => number): this {
    this.getZoom = getZoom
    return this
  }

  public setGetHeight(getHeight: () => number): this {
    this.getHeight = getHeight
    return this
  }

  public setGetDefaultGeometry(
    getDefaultGeometry: () => GeometryAttributes[],
  ): this {
    this.getDefaultGeometry = getDefaultGeometry
    return this
  }

  public initialise(): this {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      50,
      this.getWidth() / this.getHeight(),
    )

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(this.getWidth(), this.getHeight())

    this.initialiseEventListeners()

    this.container.appendChild(this.renderer.domElement)

    if (this.getPixelRatio() > 1) {
      this.renderer.domElement.style.transform
        = 'scale(0.5) translateX(-50%) translateY(-50%)'
    }

    const geometry = this.getDefaultGeometry().map(mapGeometryAttributes)
    this.placeGeometry(geometry)

    this.onInit(this)

    this.animate()

    return this
  }

  protected initialiseEventListeners(): void {
    window.addEventListener('resize', () => this.onWindowResize(this), false)
    document.addEventListener(
      'mousemove',
      event => this.onMouseMove(this, event),
      false,
    )
    this.renderer?.domElement.addEventListener(
      'mousedown',
      event => this.onClick(this, event),
      false,
    )
    document.addEventListener(
      'keydown',
      event => this.onKeyDown(this, event),
      false,
    )
    document.addEventListener(
      'wheel',
      event => this.onScroll(this, event),
      false,
    )
  }

  public placeGeometry(geometry: Geometry[]): void {
    const startingPosition = this.getStartingPosition()
    geometry.forEach((object) => {
      this.scene!.add(object.getObject())
      object.setPosition(startingPosition.x, startingPosition.y)
    })
    this.geometry?.forEach((object) => {
      this.scene!.remove(object.getObject())
    })
    this.geometry = geometry
  }

  public animate() {
    if (!this.renderer) {
      return
    }
    this.onRenderTick(this, {
      mousePosition: this.getMousePosition(),
      startingPosition: this.getStartingPosition(),
    })
    this.camera!.position.z = this.getZoom()
    this.render()
  }

  protected render() {
    requestAnimationFrame(() => this.animate())
    this.renderer!.render(this.scene!, this.camera!)
  }

  public rotateTick() {
    this.geometry!.forEach(geometry => geometry.rotate())
  }

  public randomiseRotations() {
    this.geometry!.forEach((geometry) => {
      geometry.setRotation(
        getRandomInt(0, 25),
        getRandomInt(0, 25),
        getRandomInt(0, 25),
      )
    })
  }

  public randomiseColors() {
    this.geometry!.forEach(object => object.setColor(...getRandomColor()))
  }

  protected getStartingPosition() {
    const startingPosX = this.getWidth() / 2
    const startingPosY = this.getHeight() / 2
    return this.getObjectTargetPositionVector(startingPosX, startingPosY)
  }

  private getMousePosition() {
    if (this.mousePosX === 0 && this.mousePosY === 0) {
      return undefined
    }
    return this.getObjectTargetPositionVector(this.mousePosX, this.mousePosY)
  }

  /** Taken fron https://jsfiddle.net/atwfxdpd/10/ */
  protected getObjectTargetPositionVector(targetX: number, targetY: number) {
    const x = (targetX / this.getWidth()) * 2 - 1
    const y = -(targetY / this.getHeight()) * 2 + 1
    const vector = new THREE.Vector3(x, y, 0.5)
    vector.unproject(this.camera!)
    const dir = vector.sub(this.camera!.position).normalize()
    const distance = -this.camera!.position.z / dir.z
    const pos = this.camera!.position.clone().add(dir.multiplyScalar(distance))
    return pos
  }

  public cleanUp() {
    window.removeEventListener(
      'resize',
      () => this.onWindowResize(this),
      false,
    )
    document.removeEventListener('mousemove', (_) => {}, false)
    this.renderer?.domElement.removeEventListener(
      'mousedown',
      (_) => {},
      false,
    )
    document.removeEventListener('keydown', (_) => {}, false)
    document.removeEventListener('wheel', (_) => {}, false)

    this.container.removeChild(this.container.firstChild!)
    this.scene = undefined
    this.camera = undefined
    this.renderer = undefined
    this.geometry = undefined
  }

  protected onWindowResize(renderer: Renderer) {
    if (!this.camera) {
      return
    }
    this.camera.aspect = renderer.getWidth() / renderer.getHeight()
    this.camera.updateProjectionMatrix()
    this.renderer!.setSize(renderer.getWidth(), renderer.getHeight())
    if (this.getPixelRatio() > 1) {
      this.renderer!.domElement.style.transform
        = 'scale(0.5) translateX(-50%) translateY(-50%)'
    }
  }

  public getGeometry() {
    return this.geometry
  }
}
