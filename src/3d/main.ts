import * as THREE from 'three'

export function initRenderer(container: HTMLElement): void {
  const width = window.innerWidth
  const height = window.innerHeight

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)

  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer()
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

  const cubes: THREE.LineSegments[] = []
  const numOfCubes = 3
  for (let i = 0; i < numOfCubes; i++) {
    const geometry = new THREE.OctahedronGeometry(1)
    const geo = new THREE.EdgesGeometry(geometry)
    const mat = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 })
    const cube = new THREE.LineSegments(geo, mat)
    scene.add(cube)
    cubes.push(cube)
  }

  let mouseClicks = 0
  document.addEventListener('click', () => {
    if (mouseClicks >= numOfCubes) {
      mouseClicks = 0
    } else {
      mouseClicks++
    }
  })

  container.appendChild(renderer.domElement)

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    cubes.forEach((cube, index) => {
      cube.visible = mouseClicks >= index

      if (!cube.visible) {
        return
      }

      if (cube.position.z > 1) {
        cube.position.z = 0
      } else {
        cube.position.z += 0.2
      }

      cube.rotation.x += 0.05
      cube.rotation.y += 0.05
    })
  }
  animate()
}
