import * as THREE from 'three'

export function initRenderer(container: HTMLElement): void {
  const width = window.innerWidth
  const height = window.innerHeight

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)

  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const geo = new THREE.EdgesGeometry(geometry)
  const mat = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 })
  const cube = new THREE.LineSegments(geo, mat)

  scene.add(cube)

  camera.position.z = 5

  container.appendChild(renderer.domElement)

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    cube.rotation.x += 0.015
    cube.rotation.y += 0.015
  }
  animate()
}
