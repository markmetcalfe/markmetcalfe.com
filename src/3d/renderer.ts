import * as THREE from 'three'
import { Geometry, Octahedron } from './geometry'
import isMobile from 'is-mobile'

export class ThreeJSRenderer {
  private isMobile = false
  private mousePosX = 0
  private mousePosY = 0

  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer

  private geometry: Geometry[]

  constructor(container: HTMLElement) {
    this.isMobile = isMobile()

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      100,
      window.innerWidth / window.innerHeight,
    )

    this.camera.position.z = 5

    this.renderer = new THREE.WebGLRenderer({ alpha: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    window.addEventListener('resize', () => this.handleWindowResize(), false)
    document.addEventListener(
      'mousemove',
      event => this.updateMousePos(event),
      false,
    )

    container.appendChild(this.renderer.domElement)

    this.geometry = this.createGeometry()
    this.animate()
  }

  private createGeometry() {
    const geometry = [
      new Octahedron('green'),
      new Octahedron('blue').setRotation(50),
      new Octahedron('red').setRotation(100),
    ]

    const startingPosition = this.getStartingPosition()
    if (startingPosition) {
      geometry.forEach(object =>
        object.setPosition(startingPosition.x, startingPosition.y),
      )
    }

    Object.values(geometry).forEach(object =>
      this.scene.add(object.getObject()),
    )

    return geometry
  }

  private animate() {
    const mousePosition = this.getMousePosition()
    const startingPosition = this.getStartingPosition()
    const objectScale = window.innerWidth > 768 ? 1 : 0.9

    Object.values(this.geometry).forEach(object => {
      object.rotate().setSize(objectScale)
      if (!this.isMobile && mousePosition) {
        object.moveTowardPosition(mousePosition)
      } else if (startingPosition) {
        object.setPosition(startingPosition)
      }
    })

    this.render()
  }

  private render() {
    requestAnimationFrame(() => this.animate())
    this.renderer.render(this.scene, this.camera)
  }

  private getStartingPosition() {
    const photoCoords = document
      .querySelector('.photo-of-me')
      ?.getBoundingClientRect()
    if (!photoCoords) {
      return undefined
    }
    const startingPosX = photoCoords.x + photoCoords.width / 2
    const startingPosY = photoCoords.y + photoCoords.height / 2
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
