import * as THREE from 'three'
import { Geometry, Polyhedron } from './geometry'
import isMobile from 'is-mobile'

export class ThreeJSRenderer {
  private isMobile = false
  private mousePosX = 0
  private mousePosY = 0

  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer

  private maxZoom = 7
  private minZoom = -2
  private isAutoZoomingIn = false
  private hasManuallyZoomed = false

  private geometry: Geometry[]

  constructor(container: HTMLElement) {
    this.isMobile = isMobile()

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      100,
      window.innerWidth / window.innerHeight,
    )

    this.camera.position.z = this.maxZoom

    this.renderer = new THREE.WebGLRenderer({ alpha: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    window.addEventListener('resize', () => this.handleWindowResize(), false)
    document.addEventListener(
      'mousemove',
      event => this.updateMousePos(event),
      false,
    )
    document.addEventListener(
      'mouseup',
      () => this.randomiseGeometryPositions(),
      false,
    )
    document.addEventListener('wheel', event => this.manualZoom(event), false)

    container.appendChild(this.renderer.domElement)

    this.geometry = this.generateGeometry()
    this.randomiseGeometryPositions()
    this.animate()
  }

  private generateGeometry() {
    const geometry = [
      new Polyhedron('green', 5, 80),
      new Polyhedron('blue', 5, 90),
      new Polyhedron('red', 5, 100),
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

  private randomiseGeometryPositions() {
    this.geometry.forEach(geometry => {
      const randomRotationPosition = Math.floor(Math.random() * 100)
      const randomRotationSpeed = Math.random() * 0.002
      geometry
        .setRotation(randomRotationPosition)
        .setRotationSpeed(randomRotationSpeed)
    })
  }

  private manualZoom(event: WheelEvent) {
    this.hasManuallyZoomed = true
    if (event.deltaY > 0) {
      this.camera.position.z -= 0.1
    } else if (event.deltaY < 0) {
      this.camera.position.z += 0.1
    }
  }

  private autoZoom() {
    if (this.hasManuallyZoomed) {
      return
    }
    const zoomSpeed = 0.01
    if (this.isAutoZoomingIn) {
      this.camera.position.z += zoomSpeed
      if (this.camera.position.z >= this.maxZoom - 1) {
        this.isAutoZoomingIn = false
      }
    } else {
      this.camera.position.z -= zoomSpeed
      if (this.camera.position.z <= this.minZoom - 1) {
        this.isAutoZoomingIn = true
      }
    }
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
    this.autoZoom()

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
    document.removeEventListener(
      'mouseup',
      this.randomiseGeometryPositions,
      false,
    )
    document.removeEventListener('wheel', this.manualZoom, false)
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
