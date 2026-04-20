import * as THREE from 'three'
import type { ChildNodeData, TopicNodeData } from '../types/scene'
import { createBackgroundEffects } from './BackgroundEffects'
import { createOrbitRings } from './OrbitRings'
import { getViewportPreset } from './sceneModel'
import { createTopicNodes } from './TopicNodes'

type SceneSetupParams = {
  mount: HTMLDivElement
  nodes: TopicNodeData[]
  childNodes: ChildNodeData[]
  momentumById: Map<string, number>
}

export function createSceneRuntime({
  mount,
  nodes,
  childNodes,
  momentumById,
}: SceneSetupParams) {
  const viewportPreset = getViewportPreset(mount.clientWidth)
  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2('#000208', 0.016)

  const camera = new THREE.PerspectiveCamera(
    viewportPreset.cameraFov,
    mount.clientWidth / mount.clientHeight,
    0.1,
    260,
  )
  const defaultCameraPosition = new THREE.Vector3(
    0,
    viewportPreset.cameraHeight,
    viewportPreset.cameraDistance,
  )
  const cameraTarget = defaultCameraPosition.clone()
  const currentLookAt = new THREE.Vector3(0, 0, 0)
  const lookTarget = new THREE.Vector3(0, 0, 0)
  camera.position.copy(defaultCameraPosition)
  camera.lookAt(lookTarget)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(mount.clientWidth, mount.clientHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.domElement.style.touchAction = 'none'
  mount.innerHTML = ''
  mount.appendChild(renderer.domElement)

  const sceneRoot = new THREE.Group()
  scene.add(sceneRoot)

  const ambientLight = new THREE.AmbientLight('#091828', 2.2)
  const keyLight = new THREE.PointLight('#00d4ff', 38, 160, 2)
  keyLight.position.set(0, 16, 20)
  const rimLight = new THREE.PointLight('#7b2ff7', 18, 120, 2)
  rimLight.position.set(-26, 14, -8)
  const fillLight = new THREE.PointLight('#005eff', 8, 90, 2)
  fillLight.position.set(18, -4, 18)
  scene.add(ambientLight, keyLight, rimLight, fillLight)

  const background = createBackgroundEffects(sceneRoot)
  const { rings } = createOrbitRings(sceneRoot, [11.5, 17.5, 24.5])
  const nodeScene = createTopicNodes({
    sceneRoot,
    nodes,
    childNodes,
    mainLabelFont: viewportPreset.mainLabelFont,
    childLabelFont: viewportPreset.childLabelFont,
    momentumById,
  })

  return {
    viewportPreset,
    scene,
    camera,
    renderer,
    sceneRoot,
    background,
    rings,
    nodeScene,
    defaultCameraPosition,
    cameraTarget,
    currentLookAt,
    lookTarget,
  }
}
