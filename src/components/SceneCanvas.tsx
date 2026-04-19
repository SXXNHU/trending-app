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
import { disposeTopicNodes } from './TopicNodes'

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
  const previousSnapshotRef = useRef<Map<string, number>>(new Map())
  const focusRequestRef = useRef<{ id: string; seq: number } | null>(null)
  const interactionRef = useRef<ReturnType<typeof bindSceneInteractions> | null>(null)

  useEffect(() => {
    if (focusRequest) focusRequestRef.current = focusRequest
  }, [focusRequest])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const { nodes, childNodes, momentumById } = buildSceneModel(
      topics,
      previousSnapshotRef.current,
    )
    const runtime = createSceneRuntime({
      mount,
      nodes,
      childNodes,
      momentumById,
    })
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
      controlsEnabled,
      viewportPreset: runtime.viewportPreset,
      cameraTarget: runtime.cameraTarget,
      defaultCameraPosition: runtime.defaultCameraPosition,
      lookTarget: runtime.lookTarget,
      rotationTarget,
      selectedIdRef,
      hoveredIdRef,
      onMarkInteraction,
      onSelectTopic,
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
      introPhase,
      introDuration,
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
      onIntroComplete,
      setIntroDone: interaction.setIntroDone,
      focusRequestRef,
    })

    return () => {
      interactionRef.current = null
      previousSnapshotRef.current = new Map(topics.map((topic) => [topic.id, topic.trafficScore]))
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
  }, [
    controlsEnabled,
    introDuration,
    introPhase,
    onIntroComplete,
    onMarkInteraction,
    onSelectTopic,
    topics,
  ])

  useEffect(() => {
    if (selectedTopicId === null) {
      interactionRef.current?.deselectAll()
    }
  }, [selectedTopicId])

  return <div className="scene-mount" ref={mountRef} />
}
