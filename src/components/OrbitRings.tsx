import * as THREE from 'three'

export function createOrbitRings(sceneRoot: THREE.Group, radii: number[]) {
  const group = new THREE.Group()
  group.rotation.x = Math.PI / 2
  sceneRoot.add(group)

  const rings = radii.map((radius, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.018, 10, 120),
      new THREE.MeshBasicMaterial({
        color: index === 1 ? '#a7ecff' : '#8fc9ff',
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    )
    group.add(ring)
    return ring
  })

  return { group, rings }
}

export function setOrbitRingOpacity(rings: THREE.Mesh[], opacity: number) {
  rings.forEach((ring) => {
    ;(ring.material as THREE.MeshBasicMaterial).opacity = opacity
  })
}

export function disposeOrbitRings(rings: THREE.Mesh[]) {
  rings.forEach((ring) => {
    ring.geometry.dispose()
    ;(ring.material as THREE.Material).dispose()
  })
}
