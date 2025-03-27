import * as THREE from 'three'

export abstract class Geometry {
  private object: THREE.Mesh | THREE.LineSegments
  private attributes: GeometryAttributes
  private rotationSpeed = { x: 0, y: 0 }

  constructor(geometry: THREE.BufferGeometry, attributes: GeometryAttributes) {
    if (attributes.solid) {
      const material = new THREE.MeshBasicMaterial({ color: attributes.color })
      this.object = new THREE.Mesh(geometry, material)
    }
    else {
      const material = new THREE.LineBasicMaterial({ color: attributes.color })
      this.object = new THREE.LineSegments(geometry, material)
    }
    this.attributes = attributes
  }

  public setPosition(x: THREE.Vector3 | number, y?: number, z?: number) {
    if (x instanceof THREE.Vector3) {
      this.object.position.copy(x)
    }
    else if (y) {
      this.object.position.x = x
      this.object.position.y = y
    }
    if (z) {
      this.object.position.z = z
    }
    return this
  }

  public setColor(r: number, g: number, b: number) {
    this.getMaterials().forEach((material) => {
      material.color.setRGB(r / 255, g / 255, b / 255)
    })
  }

  public setRotation(x: number, y?: number, z?: number) {
    this.object.rotation.x = x
    if (y) {
      this.object.rotation.y = y
    }
    else {
      this.object.rotation.y = x
    }
    if (z) {
      this.object.rotation.z = z
    }
    return this
  }

  public setRotationSpeed(speed: { x: number, y: number }) {
    this.rotationSpeed = speed
    return this
  }

  public rotate() {
    const rotationMultiplier = 5000
    let xRotationAmount = this.rotationSpeed.x / rotationMultiplier
    let yRotationAmount = this.rotationSpeed.y / rotationMultiplier
    if (this.attributes.reverseRotation) {
      xRotationAmount *= -1
      yRotationAmount *= -1
    }
    // Deliberately swap the values as otherwise it looks wrong
    this.object.rotation.x += yRotationAmount
    this.object.rotation.y += xRotationAmount
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

  public getAttributes() {
    return this.attributes
  }

  public getMaterials(): THREE.MeshBasicMaterial[] | THREE.LineBasicMaterial[] {
    return this.object.material instanceof THREE.Material
      ? [this.object.material as THREE.MeshBasicMaterial]
      : (this.object.material as
      | THREE.MeshBasicMaterial[]
      | THREE.LineBasicMaterial[])
  }

  public static getName(): string {
    throw new Error('Can not call getName() on class Geometry')
  }

  public static getMinDetail(): number {
    throw new Error('Can not call getMinDetail() on class Geometry')
  }

  public static getMaxDetail(): number {
    throw new Error('Can not call getMaxDetail() on class Geometry')
  }
}

export class Cube extends Geometry {
  constructor(attributes: GeometryAttributes) {
    const geometry = new THREE.BoxGeometry(
      attributes.radius,
      attributes.radius,
      attributes.radius,
      attributes.detail,
      attributes.detail,
      attributes.detail,
    )
    super(geometry, attributes)
  }

  public static override getName() {
    return 'Cube'
  }

  public static override getMinDetail() {
    return 1
  }

  public static override getMaxDetail() {
    return 50
  }
}

export class Sphere extends Geometry {
  constructor(attributes: GeometryAttributes) {
    const geometry = new THREE.SphereGeometry(
      attributes.radius,
      attributes.detail,
      attributes.detail,
    )
    super(geometry, attributes)
  }

  public static override getName() {
    return 'Sphere'
  }

  public static override getMinDetail() {
    return 5
  }

  public static override getMaxDetail() {
    return 100
  }
}

export class PartialSphere extends Geometry {
  constructor(attributes: GeometryAttributes) {
    const geometry = new THREE.PolyhedronGeometry(
      [
        -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1, 1, 1, -1, 1, 1, 1,
        1, -1, 1, 1,
      ],
      [
        2, 1, 0, 0, 3, 2, 0, 4, 7, 7, 3, 0, 0, 1, 5, 5, 4, 0, 1, 2, 6, 6, 5, 1,
        2, 3, 7, 7, 6, 2, 4, 5, 6, 6, 7, 4,
      ],
      attributes.radius,
      attributes.detail,
    )
    super(new THREE.EdgesGeometry(geometry), attributes)
  }

  public static override getName() {
    return 'Partial Sphere'
  }

  public static override getMinDetail() {
    return 50
  }

  public static override getMaxDetail() {
    return 100
  }
}

export class Octahedron extends Geometry {
  constructor(attributes: GeometryAttributes) {
    const geometry = new THREE.OctahedronGeometry(attributes.radius, 0)
    super(geometry, attributes)
  }

  public static override getName() {
    return 'Octahedron'
  }

  public static override getMinDetail() {
    return 1
  }

  public static override getMaxDetail() {
    return 1
  }
}

export class Dodecahedron extends Geometry {
  constructor(attributes: GeometryAttributes) {
    const geometry = new THREE.DodecahedronGeometry(attributes.radius, 0)
    super(geometry, attributes)
  }

  public static override getName() {
    return 'Dodecahedron'
  }

  public static override getMinDetail() {
    return 1
  }

  public static override getMaxDetail() {
    return 1
  }
}

export class TorusKnot extends Geometry {
  constructor(attributes: GeometryAttributes) {
    const geometry = new THREE.TorusKnotGeometry(
      attributes.radius,
      undefined,
      attributes.detail,
      attributes.detail,
    )
    super(geometry, attributes)
  }

  public static override getName() {
    return 'Torus Knot'
  }

  public static override getMinDetail() {
    return 1
  }

  public static override getMaxDetail() {
    return 30
  }
}

export const geometryClasses = [
  Cube,
  Sphere,
  PartialSphere,
  Octahedron,
  Dodecahedron,
  TorusKnot,
]

const getGeometryClassFromName = (name: string) => {
  const geometryClass = geometryClasses.find(
    geometryClass => geometryClass.getName() === name,
  )
  if (!geometryClass) {
    throw new Error('Couldn\'t find geometry class with name ' + name)
  }
  return geometryClass
}

export const mapGeometryAttributes = (
  geometryAttributes: GeometryAttributes,
) => {
  const GeometryClass = getGeometryClassFromName(geometryAttributes.type)
  return new GeometryClass(geometryAttributes)
}

export interface GeometryAttributes {
  type: string
  color: string
  solid: boolean
  radius: number
  detail: number
  reverseRotation: boolean
}
