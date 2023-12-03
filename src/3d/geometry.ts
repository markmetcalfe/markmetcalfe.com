import * as THREE from 'three'

export abstract class Geometry {
  private object: THREE.Object3D

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

  public rotate() {
    this.object.rotation.x += 0.05
    this.object.rotation.y += 0.05
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

export class Octahedron extends Geometry {
  constructor(color: string) {
    const geometry = new THREE.OctahedronGeometry(1)
    const geo = new THREE.EdgesGeometry(geometry)
    const mat = new THREE.LineBasicMaterial({ color })
    const object = new THREE.LineSegments(geo, mat)
    super(object)
  }
}
