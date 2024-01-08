import * as THREE from 'three'

export abstract class Geometry {
  private object: THREE.Object3D
  private rotationSpeed = 0.01

  constructor(object: THREE.Object3D) {
    this.object = object
  }

  public setPosition(x: THREE.Vector3 | number, y?: number, z?: number) {
    if (x instanceof THREE.Vector3) {
      this.object.position.copy(x)
    } else if (y) {
      this.object.position.x = x
      this.object.position.y = y
    }
    if (z) {
      this.object.position.z = z
    }
    return this
  }

  public setRotation(x: number, y?: number, z?: number) {
    this.object.rotation.x = x
    if (y) {
      this.object.rotation.y = y
    } else {
      this.object.rotation.y = x
    }
    if (z) {
      this.object.rotation.z = z
    }
    return this
  }

  public setRotationSpeed(speed: number) {
    this.rotationSpeed = speed
    return this
  }

  public rotate() {
    this.object.rotation.x += this.rotationSpeed
    this.object.rotation.y += this.rotationSpeed
    return this
  }

  public moveTowardPosition(targetPosition: THREE.Vector3) {
    this.object.position.x += (targetPosition.x - this.object.position.x) / 50
    this.object.position.y += (targetPosition.y - this.object.position.y) / 50
    return this
  }

  public setSize(scale: number) {
    this.object.scale.x = scale
    this.object.scale.y = scale
    this.object.scale.z = scale
    return this
  }

  public getObject() {
    return this.object
  }
}

export class Polyhedron extends Geometry {
  constructor(color: string, radius: number, detail: number) {
    const polyhedron = new THREE.PolyhedronGeometry(
      [
        -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1, 1, 1, -1, 1, 1, 1,
        1, -1, 1, 1,
      ],
      [
        2, 1, 0, 0, 3, 2, 0, 4, 7, 7, 3, 0, 0, 1, 5, 5, 4, 0, 1, 2, 6, 6, 5, 1,
        2, 3, 7, 7, 6, 2, 4, 5, 6, 6, 7, 4,
      ],
      radius,
      detail,
    )
    const geometry = new THREE.EdgesGeometry(polyhedron)
    const material = new THREE.LineBasicMaterial({ color })
    const object = new THREE.LineSegments(geometry, material)
    super(object)
  }
}
