import * as THREE from 'three'
import { useRendererSettingsStore } from '../stores/renderer-settings'

export class ThreeJSRenderer {
  private store: ReturnType<typeof useRendererSettingsStore>

  private mousePosX = 0
  private mousePosY = 0

  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer

  constructor(container: HTMLElement) {
    this.store = useRendererSettingsStore()

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      100,
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
    container.addEventListener('mousedown', () => this.store.tap(), false)
    document.addEventListener('wheel', event => this.handleScroll(event), false)

    container.appendChild(this.renderer.domElement)

    const startingPosition = this.getStartingPosition()
    this.store.generateGeometry(geometry => {
      this.scene.clear()
      geometry.forEach(object => this.scene.add(object.getObject()))
    }, startingPosition)

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
    const targetPosition = this.getMousePosition() ?? this.getStartingPosition()
    this.store.tick({ targetPosition })

    this.camera.position.z = this.store.zoom.current

    this.render()
  }

  private render() {
    requestAnimationFrame(() => this.animate())
    this.renderer.render(this.scene, this.camera)
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
    vector.unproject(this.camera)
    const dir = vector.sub(this.camera.position).normalize()
    const distance = -this.camera.position.z / dir.z
    const pos = this.camera.position.clone().add(dir.multiplyScalar(distance))
    return pos
  }

  public cleanUp() {
    window.removeEventListener('resize', this.handleWindowResize, false)
    document.removeEventListener('mousemove', this.updateMousePos, false)
    document.removeEventListener('mousedown', () => this.store.tap(), false)
    document.removeEventListener('wheel', this.handleScroll, false)
  }

  private handleWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  private updateMousePos(event: MouseEvent) {
    this.mousePosX = event.clientX
    this.mousePosY = event.clientY
  }
}
