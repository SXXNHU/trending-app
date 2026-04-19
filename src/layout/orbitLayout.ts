import * as THREE from 'three'
import type { TrendTopic } from '../data/trendItems'

const ORBIT_RADII = [11.5, 17.5, 24.5]
const ORBIT_SCORE_PUSH = 0.95
const VERTICAL_VARIANCE = 1.75
const DEPTH_SWAY = 1.45

export function computeOrbitPositions(topics: TrendTopic[]) {
  const positions = new Map<string, THREE.Vector3>()

  topics.forEach((topic, index) => {
    const orbitRadius = ORBIT_RADII[topic.orbit] ?? ORBIT_RADII[1]
    const angle = topic.angle + index * 0.12
    const scoreBias = (topic.trafficScore - 50) / 50
    const radialOffset = scoreBias * ORBIT_SCORE_PUSH
    const x = Math.cos(angle) * (orbitRadius + radialOffset)
    const z = Math.sin(angle) * (orbitRadius + radialOffset * 0.8)
    const y =
      Math.sin(angle * 1.45 + topic.orbit * 0.8) * VERTICAL_VARIANCE
      + (topic.orbit - 1) * 0.9
      + Math.cos(angle * 0.7) * DEPTH_SWAY * 0.32

    positions.set(topic.id, new THREE.Vector3(x, y, z))
  })

  return positions
}
