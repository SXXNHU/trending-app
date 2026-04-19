import * as THREE from 'three'
import type { TrendTopic } from '../data/trendItems'
import { computePositions } from '../layout/layoutEngine'
import { computeSimilarity } from '../layout/similarityMatrix'
import type { TopicNodeData } from '../types/scene'
import { buildChildNodes } from './TopicNodes'

const TOPIC_RADIUS_RANGE = { min: 1.05, max: 3.3 }

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function normScoreToRadius(normScore: number) {
  const eased = Math.pow(clamp(normScore, 0, 1), 1.1)
  return TOPIC_RADIUS_RANGE.min + eased * (TOPIC_RADIUS_RANGE.max - TOPIC_RADIUS_RANGE.min)
}

function normalizeScores(topics: { trafficScore: number; id: string }[]) {
  const scores = topics.map((topic) => topic.trafficScore)
  const min = Math.min(...scores)
  const max = Math.max(...scores)
  const range = max - min || 1
  return new Map(topics.map((topic) => [topic.id, (topic.trafficScore - min) / range]))
}

function calcMomentum(id: string, score: number, prevMap: Map<string, number>) {
  if (prevMap.size === 0) return 0
  const prev = prevMap.get(id)
  if (prev === undefined) return 0
  const delta = score - prev
  if (delta <= 0) return 0
  return Math.min(delta / 35, 1)
}

export function getViewportPreset(width: number) {
  const isCompact = width <= 640
  return {
    isCompact,
    cameraDistance: isCompact ? 40 : 34,
    cameraHeight: isCompact ? 24 : 21.8,
    cameraFov: isCompact ? 54 : 46,
    dragX: isCompact ? 0.0022 : 0.0028,
    dragY: isCompact ? 0.0013 : 0.0016,
    mainLabelFont: isCompact ? 23 : 30,
    childLabelFont: isCompact ? 15 : 18,
    focusDistance: isCompact ? 8.4 : 7.2,
  }
}

export function buildSceneModel(topics: TrendTopic[], previousSnapshot: Map<string, number>) {
  const normScores = normalizeScores(topics)
  const simMatrix = computeSimilarity(topics)
  const radiiArray = topics.map((topic) => normScoreToRadius(normScores.get(topic.id) ?? 0.5))
  const positions = computePositions(topics, simMatrix, radiiArray)
  const nodes: TopicNodeData[] = topics.map((topic) => {
    const position = positions.get(topic.id) ?? new THREE.Vector3()
    return {
      ...topic,
      position,
      radius: normScoreToRadius(normScores.get(topic.id) ?? 0.5),
      normScore: normScores.get(topic.id) ?? 0.5,
    }
  })

  return {
    nodes,
    childNodes: buildChildNodes(nodes),
    momentumById: new Map(
      topics.map((topic) => [
        topic.id,
        calcMomentum(topic.id, topic.trafficScore, previousSnapshot),
      ]),
    ),
  }
}
