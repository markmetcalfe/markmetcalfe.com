import * as THREE from 'three'
import { useRendererSettingsStore } from '../stores/renderer-settings'
import { Geometry } from './geometry'

export class ThreeJSRenderer {
  private store: ReturnType<typeof useRendererSettingsStore>

  private mousePosX = 0
  private mousePosY = 0

  private container: HTMLElement
  private scene: THREE.Scene | undefined
  private camera: THREE.PerspectiveCamera | undefined
  private renderer: THREE.WebGLRenderer | undefined

  constructor(container: HTMLElement) {
    this.store = useRendererSettingsStore()
    this.container = container
    this.initialise()
    this.store.initialiseRenderer = async () => this.initialise()
    this.store.destroyRenderer = () => this.cleanUp()
  }

  private async initialise() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
    )

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    window.addEventListener('resize', () => this.handleWindowResize(), false)
    document.addEventListener(
      'mousemove',
      event => this.updateMousePos(event),
      false,
    )
    this.renderer.domElement.addEventListener(
      'mousedown',
      () => this.store.tap(),
      false,
    )
    document.addEventListener('wheel', event => this.handleScroll(event), false)

    this.container.appendChild(this.renderer.domElement)

    const startingPosition = this.getStartingPosition()
    const callback = (geometry: Geometry[]) => {
      this.scene!.clear()
      geometry.forEach(object => {
        this.scene!.add(object.getObject())
        object.setPosition(startingPosition.x, startingPosition.y)
      })
    }

    this.store.generateGeometry(callback)

    this.animate()
  }

  private handleScroll(event: WheelEvent) {
    if (event.deltaY > 0) {
      this.store.zoomOut()
    } else if (event.deltaY < 0) {
      this.store.zoomIn()
    }
  }

  private animate() {
    if (!this.renderer) {
      return
    }

    const targetPosition = this.getMousePosition() ?? this.getStartingPosition()
    this.store.tick({ targetPosition })

    this.camera!.position.z = this.store.zoom.current

    this.render()
  }

  private render() {
    requestAnimationFrame(() => this.animate())
    this.renderer?.render(this.scene!, this.camera!)
  }

  private getStartingPosition() {
    const startingPosX = window.innerWidth / 2
    const startingPosY = window.innerHeight / 2
    return this.getObjectTargetPositionVector(startingPosX, startingPosY)
  }

  private getMousePosition() {
    if (this.mousePosX === 0 && this.mousePosY === 0) {
      return undefined
    }
    return this.getObjectTargetPositionVector(this.mousePosX, this.mousePosY)
  }

  /** Taken fron https://jsfiddle.net/atwfxdpd/10/ */
  private getObjectTargetPositionVector(targetX: number, targetY: number) {
    const x = (targetX / window.innerWidth) * 2 - 1
    const y = -(targetY / window.innerHeight) * 2 + 1
    const vector = new THREE.Vector3(x, y, 0.5)
    vector.unproject(this.camera!)
    const dir = vector.sub(this.camera!.position).normalize()
    const distance = -this.camera!.position.z / dir.z
    const pos = this.camera!.position.clone().add(dir.multiplyScalar(distance))
    return pos
  }

  public cleanUp() {
    this.container.removeChild(this.container.firstChild!)
    this.scene = undefined
    this.camera = undefined
    this.renderer = undefined

    window.removeEventListener('resize', this.handleWindowResize, false)
    document.removeEventListener('mousemove', this.updateMousePos, false)
    document.removeEventListener('wheel', this.handleScroll, false)
  }

  private handleWindowResize() {
    this.camera!.aspect = window.innerWidth / window.innerHeight
    this.camera!.updateProjectionMatrix()
    this.renderer!.setSize(window.innerWidth, window.innerHeight)
  }

  private updateMousePos(event: MouseEvent) {
    this.mousePosX = event.clientX
    this.mousePosY = event.clientY
  }
}
