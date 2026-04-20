import * as THREE from 'three'
import { getOnboardingProgress, smoothstep } from '../animation/onboardingTimeline'
import { updateBackgroundEffects } from './BackgroundEffects'
import { setOrbitRingOpacity } from './OrbitRings'
import { setNodesIdle, updateNodesForFinalState, updateNodesForIntro } from './TopicNodes'

type StartSceneAnimationParams = {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  sceneRoot: THREE.Group
  background: ReturnType<typeof import('./BackgroundEffects').createBackgroundEffects>
  rings: THREE.Mesh[]
  nodeScene: ReturnType<typeof import('./TopicNodes').createTopicNodes>
  introPhaseRef: { current: 'idle' | 'running' | 'complete' }
  introDurationRef: { current: number }
  viewportPreset: {
    cameraDistance: number
    cameraHeight: number
    focusDistance: number
  }
  defaultCameraPosition: THREE.Vector3
  cameraTarget: THREE.Vector3
  currentLookAt: THREE.Vector3
  lookTarget: THREE.Vector3
  selectedIdRef: { current: string | null }
  hoveredIdRef: { current: string | null }
  rotationTarget: THREE.Vector2
  currentRotation: THREE.Vector2
  baseSceneRotation: THREE.Euler
  onIntroCompleteRef: { current: () => void }
  setIntroDone: (value: boolean) => void
  focusRequestRef: { current: { id: string; seq: number } | null }
}

export function startSceneAnimation({
  renderer,
  scene,
  camera,
  sceneRoot,
  background,
  rings,
  nodeScene,
  introPhaseRef,
  introDurationRef,
  viewportPreset,
  defaultCameraPosition,
  cameraTarget,
  currentLookAt,
  lookTarget,
  selectedIdRef,
  hoveredIdRef,
  rotationTarget,
  currentRotation,
  baseSceneRotation,
  onIntroCompleteRef,
  setIntroDone,
  focusRequestRef,
}: StartSceneAnimationParams) {
  const clock = new THREE.Clock()
  let introStartedAt = 0
  let introDone = introPhaseRef.current === 'complete'
  let lastFocusSeqHandled = 0
  let prevElapsed = 0
  setIntroDone(introDone)

  function animate() {
    const elapsed = clock.getElapsedTime()
    const dt = elapsed - prevElapsed
    prevElapsed = elapsed
    updateBackgroundEffects(
      elapsed,
      background.starLayers,
      background.networkLayers,
      background.accentOrbs,
    )

    const introPhase = introPhaseRef.current

    if (introPhase === 'idle') {
      setNodesIdle(nodeScene.nodeVisuals, nodeScene.childVisuals)
      setOrbitRingOpacity(rings, 0)
      cameraTarget.lerp(defaultCameraPosition, 0.08)
      lookTarget.lerp(new THREE.Vector3(0, 0, 0), 0.08)
    } else if (introPhase === 'running') {
      if (!introStartedAt) introStartedAt = elapsed
      const progress = getOnboardingProgress(elapsed, introStartedAt, introDurationRef.current)
      const cinematicZoom = THREE.MathUtils.lerp(
        viewportPreset.cameraDistance + 4.5,
        viewportPreset.cameraDistance,
        progress,
      )
      cameraTarget.set(
        Math.sin(elapsed * 0.45) * (1 - progress) * 1.4,
        viewportPreset.cameraHeight + 0.2 + (1 - progress) * 1.2,
        cinematicZoom,
      )
      lookTarget.set(0, Math.sin(elapsed * 1.6) * (1 - progress) * 0.8, 0)
      currentRotation.x = THREE.MathUtils.lerp(-0.24, baseSceneRotation.x, progress)
      currentRotation.y = THREE.MathUtils.lerp(0.7, baseSceneRotation.y, progress)
      sceneRoot.rotation.x = currentRotation.x
      sceneRoot.rotation.y = currentRotation.y
      updateNodesForIntro(progress, nodeScene.nodeVisuals, nodeScene.childVisuals)
      setOrbitRingOpacity(rings, smoothstep(0.82, 1, progress) * 0.18)
      if (progress >= 1 && !introDone) {
        introDone = true
        setIntroDone(true)
        onIntroCompleteRef.current()
      }
    } else {
      const req = focusRequestRef.current
      if (req && req.seq !== lastFocusSeqHandled) {
        lastFocusSeqHandled = req.seq
        const visual = nodeScene.nodeVisuals.get(req.id)
        if (visual) {
          const focusPoint = visual.mesh.position.clone()
          const dir = focusPoint.clone().normalize().multiplyScalar(viewportPreset.focusDistance)
          cameraTarget.copy(focusPoint.clone().add(dir).add(new THREE.Vector3(0, 1.2, 0)))
          lookTarget.copy(focusPoint)
          selectedIdRef.current = req.id
        }
      }
      rotationTarget.y += selectedIdRef.current ? 0 : 0.00045
      currentRotation.x = THREE.MathUtils.lerp(currentRotation.x, rotationTarget.x, 0.08)
      currentRotation.y = THREE.MathUtils.lerp(currentRotation.y, rotationTarget.y, 0.08)
      sceneRoot.rotation.x = currentRotation.x
      sceneRoot.rotation.y = currentRotation.y
      updateNodesForFinalState({
        elapsed,
        dt,
        nodeVisuals: nodeScene.nodeVisuals,
        childVisuals: nodeScene.childVisuals,
        pendingLabelBatches: nodeScene.pendingLabelBatches,
        selectedId: selectedIdRef.current,
        hoveredId: hoveredIdRef.current,
        childLabelFont: nodeScene.childLabelFont,
      })
      setOrbitRingOpacity(rings, 0.18)
    }

    camera.position.lerp(cameraTarget, 0.065)
    currentLookAt.lerp(lookTarget, 0.08)
    camera.lookAt(currentLookAt)
    renderer.render(scene, camera)
  }

  renderer.setAnimationLoop(animate)
}
