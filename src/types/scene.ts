import * as THREE from 'three'
import type { TrendTopic } from '../data/trendItems'

export type IntroPhase = 'idle' | 'running' | 'complete'

export type TopicNodeData = TrendTopic & {
  position: THREE.Vector3
  radius: number
  normScore: number
}

export type ChildNodeData = {
  id: string
  label: string
  parentId: string
  position: THREE.Vector3
  radius: number
}

export type ClickableNode = {
  mesh: THREE.Object3D
  topic: TrendTopic
  getFocusPoint: () => THREE.Vector3
}

export type SceneInteractionHandlers = {
  onOpenTopic: (topicId: string) => void
  onCloseTopic: () => void
}

export type OnboardingMotionState = {
  finalPosition: THREE.Vector3
  burstPosition: THREE.Vector3
  planePosition: THREE.Vector3
  controlA: THREE.Vector3
  controlB: THREE.Vector3
}
