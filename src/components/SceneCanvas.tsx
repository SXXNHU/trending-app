import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { TrendTopic } from '../data/trendItems'
import type { IntroPhase } from '../types/scene'
import { disposeBackgroundEffects } from './BackgroundEffects'
import { startSceneAnimation } from './sceneAnimation'
import { bindSceneInteractions } from './sceneInteraction'
import { buildSceneModel } from './sceneModel'
import { disposeOrbitRings } from './OrbitRings'
import { createSceneRuntime } from './sceneSetup'
import { disposeTopicNodes, scheduleChildLabelUpdates } from './TopicNodes'

type SceneCanvasProps = {
  topics: TrendTopic[]
  introPhase: IntroPhase
  introDuration: number
  controlsEnabled: boolean
  onIntroComplete: () => void
  onMarkInteraction: () => void
  onSelectTopic: (topicId: string | null) => void
  focusRequest?: { id: string; seq: number } | null
  selectedTopicId?: string | null
}

export function SceneCanvas({
  topics,
  introPhase,
  introDuration,
  controlsEnabled,
  onIntroComplete,
  onMarkInteraction,
  onSelectTopic,
  focusRequest,
  selectedTopicId,
}: SceneCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const topicsRef = useRef(topics)
  const previousSnapshotRef = useRef<Map<string, number>>(new Map())
  const focusRequestRef = useRef<{ id: string; seq: number } | null>(null)
  const interactionRef = useRef<ReturnType<typeof bindSceneInteractions> | null>(null)
  const runtimeRef = useRef<ReturnType<typeof createSceneRuntime> | null>(null)
  const childLabelFontRef = useRef(0)
  const isFirstTopicsRef = useRef(true)
  const introPhaseRef = useRef(introPhase)
  const introDurationRef = useRef(introDuration)
  const controlsEnabledRef = useRef(controlsEnabled)
  const onIntroCompleteRef = useRef(onIntroComplete)
  const onMarkInteractionRef = useRef(onMarkInteraction)
  const onSelectTopicRef = useRef(onSelectTopic)

  topicsRef.current = topics
  introPhaseRef.current = introPhase
  introDurationRef.current = introDuration
  controlsEnabledRef.current = controlsEnabled
  onIntroCompleteRef.current = onIntroComplete
  onMarkInteractionRef.current = onMarkInteraction
  onSelectTopicRef.current = onSelectTopic

  useEffect(() => {
    if (focusRequest) focusRequestRef.current = focusRequest
  }, [focusRequest])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const { nodes, childNodes, momentumById } = buildSceneModel(
      topicsRef.current,
      previousSnapshotRef.current,
    )
    const runtime = createSceneRuntime({
      mount,
      nodes,
      childNodes,
      momentumById,
    })
    runtimeRef.current = runtime
    childLabelFontRef.current = runtime.viewportPreset.childLabelFont
    const selectedIdRef = { current: null as string | null }
    const hoveredIdRef = { current: null as string | null }
    const baseSceneRotation = new THREE.Euler(-0.18, 0.48, 0.02)
    const rotationTarget = new THREE.Vector2(baseSceneRotation.x, baseSceneRotation.y)
    const currentRotation = new THREE.Vector2(baseSceneRotation.x, baseSceneRotation.y)

    runtime.sceneRoot.rotation.copy(baseSceneRotation)

    const interaction = bindSceneInteractions({
      mount,
      camera: runtime.camera,
      renderer: runtime.renderer,
      clickables: runtime.nodeScene.clickables,
      controlsEnabledRef,
      viewportPreset: runtime.viewportPreset,
      cameraTarget: runtime.cameraTarget,
      defaultCameraPosition: runtime.defaultCameraPosition,
      lookTarget: runtime.lookTarget,
      rotationTarget,
      selectedIdRef,
      hoveredIdRef,
      onMarkInteractionRef,
      onSelectTopicRef,
    })
    interactionRef.current = interaction

    startSceneAnimation({
      renderer: runtime.renderer,
      scene: runtime.scene,
      camera: runtime.camera,
      sceneRoot: runtime.sceneRoot,
      background: runtime.background,
      rings: runtime.rings,
      nodeScene: runtime.nodeScene,
      introPhaseRef,
      introDurationRef,
      viewportPreset: runtime.viewportPreset,
      defaultCameraPosition: runtime.defaultCameraPosition,
      cameraTarget: runtime.cameraTarget,
      currentLookAt: runtime.currentLookAt,
      lookTarget: runtime.lookTarget,
      selectedIdRef,
      hoveredIdRef,
      rotationTarget,
      currentRotation,
      baseSceneRotation,
      onIntroCompleteRef,
      setIntroDone: interaction.setIntroDone,
      focusRequestRef,
    })

    return () => {
      interactionRef.current = null
      runtimeRef.current = null
      childLabelFontRef.current = 0
      isFirstTopicsRef.current = true
      previousSnapshotRef.current = new Map(
        topicsRef.current.map((topic) => [topic.id, topic.trafficScore]),
      )
      runtime.renderer.setAnimationLoop(null)
      interaction.cleanup()
      runtime.renderer.dispose()
      disposeBackgroundEffects(
        runtime.background.starLayers,
        runtime.background.networkLayers,
        runtime.background.accentOrbs,
      )
      disposeOrbitRings(runtime.rings)
      disposeTopicNodes(
        runtime.nodeScene.nodeVisuals,
        runtime.nodeScene.childVisuals,
        runtime.nodeScene.childLineMaterial,
      )
      mount.innerHTML = ''
    }
  }, [])

  useEffect(() => {
    if (isFirstTopicsRef.current) {
      isFirstTopicsRef.current = false
      return
    }

    const runtime = runtimeRef.current
    if (!runtime) return

    const { nodes } = buildSceneModel(topics, previousSnapshotRef.current)
    scheduleChildLabelUpdates(
      runtime.nodeScene.nodeVisuals,
      runtime.nodeScene.childVisuals,
      runtime.nodeScene.pendingLabelBatches,
      nodes,
    )
    previousSnapshotRef.current = new Map(topics.map((topic) => [topic.id, topic.trafficScore]))
  }, [topics])

  useEffect(() => {
    if (selectedTopicId === null) {
      interactionRef.current?.deselectAll()
    }
  }, [selectedTopicId])

  return <div className="scene-mount" ref={mountRef} />
}
