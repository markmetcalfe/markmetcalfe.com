import * as THREE from 'three'

let mousePosX = 0
let mousePosY = 0
const updateMousePos = (event: MouseEvent) => {
  mousePosX = (event.clientX / window.innerWidth) * 2 - 1
  mousePosY = -(event.clientY / window.innerHeight) * 2 + 1
}

export function initRenderer(container: HTMLElement): void {
  const width = window.innerWidth
  const height = window.innerHeight

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(100, width / height)

  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer({ alpha: true })
  renderer.setSize(width, height)

  window.addEventListener(
    'resize',
    () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    },
    false,
  )

  container.appendChild(renderer.domElement)

  document.addEventListener('mousemove', updateMousePos, false)

  render({ scene, camera, renderer })
}

export function cleanUp(): void {
  document.removeEventListener('mousemove', updateMousePos, false)
}

function createOctahedron(
  color: string,
  // eslint-disable-next-line no-unused-vars
  config?: (object: THREE.LineSegments) => void,
) {
  const geometry = new THREE.OctahedronGeometry(1)
  const geo = new THREE.EdgesGeometry(geometry)
  const mat = new THREE.LineBasicMaterial({ color })
  const object = new THREE.LineSegments(geo, mat)
  if (config) {
    config(object)
  }
  return object
}

const objects: Record<string, THREE.Object3D> = {
  green: createOctahedron('green'),
  blue: createOctahedron('blue', object => {
    object.rotation.x = 50
    object.rotation.y = 50
  }),
  red: createOctahedron('red', object => {
    object.rotation.x = 100
    object.rotation.y = 100
  }),
}

/** Taken fron https://jsfiddle.net/atwfxdpd/10/ */
function getMousePositionVector(camera: THREE.PerspectiveCamera) {
  const vector = new THREE.Vector3(mousePosX, mousePosY, 0.5)
  vector.unproject(camera)
  const dir = vector.sub(camera.position).normalize()
  const distance = -camera.position.z / dir.z
  const pos = camera.position.clone().add(dir.multiplyScalar(distance))
  return pos
}

function moveObject({
  object,
  mousePosition,
}: {
  object: THREE.Object3D
  mousePosition: THREE.Vector3
}) {
  object.rotation.x += 0.05
  object.rotation.y += 0.05

  object.position.x += (mousePosition.x - object.position.x) / 50
  object.position.y += (mousePosition.y - object.position.y) / 50
}

function render({
  renderer,
  scene,
  camera,
}: {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
}) {
  Object.values(objects).forEach(object => scene.add(object))

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    const mousePosition = getMousePositionVector(camera)
    Object.entries(objects).forEach(([, object]) => {
      moveObject({
        object,
        mousePosition,
      })
    })
  }
  animate()
}
