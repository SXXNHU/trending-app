import type { TrendTopic } from '../data/trendItems'
import { computeOrbitPositions } from './orbitLayout'

export function computePositions(
  topics: TrendTopic[],
  sim: Map<string, Map<string, number>>,
  radii: number[],
  prevPositions?: Map<string, unknown>,
) {
  void sim
  void radii
  void prevPositions
  return computeOrbitPositions(topics)
}
