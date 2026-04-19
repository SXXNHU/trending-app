import * as THREE from 'three'

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function randomDiskPoint(minRadius: number, maxRadius: number, yRange: number) {
  const angle = randomBetween(0, Math.PI * 2)
  const radius = randomBetween(minRadius, maxRadius)
  return new THREE.Vector3(
    Math.cos(angle) * radius,
    randomBetween(-yRange, yRange),
    Math.sin(angle) * radius * randomBetween(0.48, 1.04),
  )
}

function createInstancedSphereLayers(
  counts: number[],
  baseRadius: number,
  createTransform: (helper: THREE.Object3D, index: number, count: number) => void,
  createColor: () => THREE.Color,
  opacities: number[],
) {
  const helper = new THREE.Object3D()
  return counts.map((count, layerIndex) => {
    const geometry = new THREE.SphereGeometry(baseRadius, 12, 12)
    const material = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: opacities[layerIndex],
      depthWrite: false,
      vertexColors: true,
    })
    const mesh = new THREE.InstancedMesh(geometry, material, count)
    for (let index = 0; index < count; index += 1) {
      createTransform(helper, index, count)
      helper.updateMatrix()
      mesh.setMatrixAt(index, helper.matrix)
      mesh.setColorAt(index, createColor())
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    return { mesh, geometry, material }
  })
}

function createAccentOrb() {
  const color = new THREE.Color().setHSL(randomBetween(0.52, 0.66), 0.72 * 0.05, 0.56)
  const radius = 0.26 + Math.random() * 1.14
  const geometry = new THREE.SphereGeometry(radius, 18, 18)
  const material = new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity: 0.08 + Math.random() * 0.18,
    transmission: 0.84,
    roughness: 0.04,
    thickness: 0.3 + Math.random() * 1.2,
    ior: 1.16,
    metalness: 0,
    clearcoat: 0.76,
    clearcoatRoughness: 0.06,
    depthWrite: false,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.copy(randomDiskPoint(26, 92, 22))
  mesh.scale.setScalar(0.8 + Math.random() * 1.6)
  return { mesh, geometry, material }
}

export function createBackgroundEffects(sceneRoot: THREE.Group) {
  const starLayers = createInstancedSphereLayers(
    [26, 44, 20],
    0.14,
    (helper) => {
      helper.position.set(
        randomBetween(-110, 110),
        randomBetween(-38, 58),
        randomBetween(-150, -30),
      )
      helper.scale.setScalar(0.45 + Math.random() * 2.6)
    },
    () =>
      new THREE.Color(
        Math.random() > 0.55 ? '#00e5ff' : Math.random() > 0.35 ? '#4da6ff' : '#e0f0ff',
      ),
    [0.14, 0.42, 0.88],
  )
  starLayers.forEach((layer) => sceneRoot.add(layer.mesh))

  const networkLayers = createInstancedSphereLayers(
    [70, 110, 56],
    0.18,
    (helper) => {
      helper.position.copy(randomDiskPoint(16, 82, 18))
      helper.scale.setScalar(0.5 + Math.random() * 2.4)
    },
    () =>
      new THREE.Color(
        Math.random() > 0.58 ? '#00b4d8' : Math.random() > 0.3 ? '#0077b6' : '#48cae4',
      ),
    [0.08, 0.18, 0.32],
  )
  networkLayers.forEach((layer) => sceneRoot.add(layer.mesh))

  const accentOrbs = Array.from({ length: 18 }, () => createAccentOrb())
  accentOrbs.forEach((orb) => sceneRoot.add(orb.mesh))

  return {
    starLayers,
    networkLayers,
    accentOrbs,
  }
}

export function updateBackgroundEffects(
  elapsed: number,
  starLayers: ReturnType<typeof createBackgroundEffects>['starLayers'],
  networkLayers: ReturnType<typeof createBackgroundEffects>['networkLayers'],
  accentOrbs: ReturnType<typeof createBackgroundEffects>['accentOrbs'],
) {
  starLayers.forEach((layer, index) => {
    layer.mesh.rotation.y += 0.00004 + index * 0.000012
    layer.mesh.rotation.x = Math.sin(elapsed * (0.03 + index * 0.01)) * 0.02
  })
  networkLayers.forEach((layer, index) => {
    layer.mesh.rotation.y += 0.00018 + index * 0.00004
    layer.mesh.rotation.x = Math.sin(elapsed * (0.048 + index * 0.014)) * 0.012
  })
  accentOrbs.forEach((orb, index) => {
    orb.mesh.rotation.y += 0.00022 + index * 0.000008
    orb.mesh.position.y += Math.sin(elapsed * (0.18 + index * 0.013)) * 0.0015
  })
}

export function disposeBackgroundEffects(
  starLayers: ReturnType<typeof createBackgroundEffects>['starLayers'],
  networkLayers: ReturnType<typeof createBackgroundEffects>['networkLayers'],
  accentOrbs: ReturnType<typeof createBackgroundEffects>['accentOrbs'],
) {
  starLayers.forEach((layer) => {
    layer.geometry.dispose()
    layer.material.dispose()
  })
  networkLayers.forEach((layer) => {
    layer.geometry.dispose()
    layer.material.dispose()
  })
  accentOrbs.forEach((orb) => {
    orb.geometry.dispose()
    orb.material.dispose()
  })
}
