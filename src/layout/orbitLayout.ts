import * as THREE from 'three'
import type { TrendTopic } from '../data/trendItems'

const ORBIT_RADII = [11.5, 17.5, 24.5]
const ORBIT_SCORE_PUSH = 0.95
const VERTICAL_VARIANCE = 1.75
const DEPTH_SWAY = 1.45
const SECTION_COUNT = 5
const SECTION_STEP = (Math.PI * 2) / SECTION_COUNT
const SECTION_GAP = SECTION_STEP * 0.26
const SECTION_SPAN = SECTION_STEP - SECTION_GAP
const SECTION_EDGE_PADDING = SECTION_SPAN * 0.18
const SAME_ORBIT_JITTER = 0.08
const OUTER_ORBIT_INDEX = ORBIT_RADII.length - 1

type SectionConfig = {
  id: 'media' | 'money' | 'growth' | 'sports-play' | 'style'
  centerAngle: number
  topicIds: string[]
}

const SECTION_LAYOUTS: SectionConfig[] = [
  {
    id: 'media',
    centerAngle: -Math.PI * 0.08,
    topicIds: ['entertainment-broadcast', 'sns-influencers', 'ott'],
  },
  {
    id: 'money',
    centerAngle: Math.PI * 0.34,
    topicIds: ['investing-stocks', 'personal-finance', 'real-estate', 'politics-society'],
  },
  {
    id: 'growth',
    centerAngle: Math.PI * 0.76,
    topicIds: ['education', 'jobs', 'parenting-wedding', 'it-ai'],
  },
  {
    id: 'sports-play',
    centerAngle: Math.PI * 1.18,
    topicIds: ['sports', 'fitness', 'gaming'],
  },
  {
    id: 'style',
    centerAngle: Math.PI * 1.62,
    topicIds: ['beauty', 'fashion-shopping', 'diet'],
  },
]

const SECTION_BY_TOPIC_ID = new Map(
  SECTION_LAYOUTS.flatMap((section) =>
    section.topicIds.map((topicId) => [topicId, section.id] as const),
  ),
)

const EXPLICIT_TOPIC_IDS = new Set(SECTION_BY_TOPIC_ID.keys())

function wrapAngle(angle: number) {
  const tau = Math.PI * 2
  let next = angle % tau
  if (next < 0) next += tau
  return next
}

function shortestAngleDelta(from: number, to: number) {
  let delta = wrapAngle(to) - wrapAngle(from)
  if (delta > Math.PI) delta -= Math.PI * 2
  if (delta < -Math.PI) delta += Math.PI * 2
  return delta
}

function midpointAngle(from: number, to: number) {
  return wrapAngle(from + shortestAngleDelta(from, to) * 0.5)
}

function clampAngleToSection(angle: number, centerAngle: number, span: number) {
  const halfSpan = span / 2
  const delta = shortestAngleDelta(centerAngle, angle)
  if (delta > halfSpan) return wrapAngle(centerAngle + halfSpan)
  if (delta < -halfSpan) return wrapAngle(centerAngle - halfSpan)
  return wrapAngle(angle)
}

function getSectionOffset(angle: number, startAngle: number) {
  const delta = shortestAngleDelta(startAngle, angle)
  return delta < 0 ? delta + Math.PI * 2 : delta
}

function buildLargestGapSlots(
  anchorOffsets: number[],
  usableSpan: number,
  count: number,
) {
  const slots: number[] = []
  const segments: Array<{ start: number; end: number }> = []
  const sortedAnchors = [...anchorOffsets].sort((left, right) => left - right)
  const points = [0, ...sortedAnchors, usableSpan]

  for (let index = 0; index < points.length - 1; index += 1) {
    segments.push({ start: points[index], end: points[index + 1] })
  }

  for (let index = 0; index < count; index += 1) {
    segments.sort((left, right) => (right.end - right.start) - (left.end - left.start))
    const widest = segments.shift()
    if (!widest) break
    const midpoint = (widest.start + widest.end) * 0.5
    slots.push(midpoint)
    segments.push({ start: widest.start, end: midpoint })
    segments.push({ start: midpoint, end: widest.end })
  }

  return slots
}

function getBaseAngle(topic: TrendTopic, index: number) {
  return wrapAngle(topic.angle + index * 0.12)
}

function buildNeighborMap(topics: TrendTopic[]) {
  return new Map(
    topics.map((topic) => [
      topic.id,
      new Set((topic.links ?? []).filter((linkedId) => linkedId !== topic.id)),
    ] as const),
  )
}

function resolveSectionAssignments(
  topics: TrendTopic[],
  baseAngles: Map<string, number>,
  neighborMap: Map<string, Set<string>>,
) {
  const assignments = new Map<string, SectionConfig['id']>()

  topics.forEach((topic) => {
    const explicitSection = SECTION_BY_TOPIC_ID.get(topic.id)
    if (explicitSection) assignments.set(topic.id, explicitSection)
  })

  topics.forEach((topic) => {
    if (assignments.has(topic.id)) return

    const neighbors = neighborMap.get(topic.id)
    let bestSection: SectionConfig['id'] | null = null
    let bestScore = Number.NEGATIVE_INFINITY

    SECTION_LAYOUTS.forEach((section) => {
      let score = 0

      neighbors?.forEach((neighborId) => {
        if (SECTION_BY_TOPIC_ID.get(neighborId) === section.id) score += 1
      })

      section.topicIds.forEach((sectionTopicId) => {
        if ((neighborMap.get(sectionTopicId)?.has(topic.id) ?? false)) score += 0.6
      })

      const baseAngle = baseAngles.get(topic.id) ?? 0
      const angleDistance = Math.abs(shortestAngleDelta(section.centerAngle, baseAngle))
      score += Math.max(0, 1 - angleDistance / Math.PI) * 0.15

      if (score <= bestScore) return
      bestScore = score
      bestSection = section.id
    })

    assignments.set(topic.id, bestSection ?? SECTION_LAYOUTS[0].id)
  })

  return assignments
}

function buildSectionLayout(topics: TrendTopic[]) {
  const baseAngles = new Map(topics.map((topic, index) => [topic.id, getBaseAngle(topic, index)] as const))
  const neighborMap = buildNeighborMap(topics)
  const sectionAssignments = resolveSectionAssignments(topics, baseAngles, neighborMap)
  const sectionGroups = new Map<SectionConfig['id'], TrendTopic[]>()
  const resolvedAngles = new Map<string, number>()
  const orbitOverrides = new Map<string, number>()

  SECTION_LAYOUTS.forEach((section) => sectionGroups.set(section.id, []))
  topics.forEach((topic) => {
    const sectionId = sectionAssignments.get(topic.id) ?? SECTION_LAYOUTS[0].id
    sectionGroups.get(sectionId)?.push(topic)
  })

  SECTION_LAYOUTS.forEach((section) => {
    const group = sectionGroups.get(section.id) ?? []
    if (group.length === 0) return

    const explicitTopics = group.filter((topic) => EXPLICIT_TOPIC_IDS.has(topic.id))
    const autoAssignedTopics = group.filter((topic) => !EXPLICIT_TOPIC_IDS.has(topic.id))

    const orderedExplicit = [...explicitTopics].sort((left, right) => {
      const leftPriority = (left.trafficScore / 100) + (neighborMap.get(left.id)?.size ?? 0) * 0.18
      const rightPriority = (right.trafficScore / 100) + (neighborMap.get(right.id)?.size ?? 0) * 0.18
      if (rightPriority !== leftPriority) return rightPriority - leftPriority
      return (baseAngles.get(left.id) ?? 0) - (baseAngles.get(right.id) ?? 0)
    })

    const usableSpan = Math.max(0, SECTION_SPAN - SECTION_EDGE_PADDING * 2)
    const startAngle = section.centerAngle - SECTION_SPAN / 2 + SECTION_EDGE_PADDING

    orderedExplicit.forEach((topic, index) => {
      const slotAngle = orderedExplicit.length === 1
        ? section.centerAngle
        : startAngle + (usableSpan * index) / Math.max(1, orderedExplicit.length - 1)
      const orbitOffset = (topic.orbit - 1) * SAME_ORBIT_JITTER
      const angle = clampAngleToSection(slotAngle + orbitOffset, section.centerAngle, usableSpan)
      resolvedAngles.set(topic.id, angle)
    })

    const placedAngles = orderedExplicit
      .map((topic) => resolvedAngles.get(topic.id))
      .filter((angle): angle is number => angle !== undefined)

    const orderedAuto = [...autoAssignedTopics].sort((left, right) => {
      const leftPriority = (left.trafficScore / 100) + (neighborMap.get(left.id)?.size ?? 0) * 0.12
      const rightPriority = (right.trafficScore / 100) + (neighborMap.get(right.id)?.size ?? 0) * 0.12
      return rightPriority - leftPriority
    })

    const anchorOffsets = placedAngles.map((angle) => getSectionOffset(angle, startAngle))
    const autoSlots = buildLargestGapSlots(anchorOffsets, usableSpan, orderedAuto.length)

    orderedAuto.forEach((topic, index) => {
      const slotOffset = autoSlots[index] ?? usableSpan * 0.5
      const slotAngle = startAngle + slotOffset
      const angle = clampAngleToSection(slotAngle, section.centerAngle, usableSpan)
      resolvedAngles.set(topic.id, angle)
      orbitOverrides.set(topic.id, OUTER_ORBIT_INDEX)
    })
  })

  const snsAngle = resolvedAngles.get('sns-influencers')
  const financeAngle = resolvedAngles.get('personal-finance')
  if (snsAngle !== undefined && financeAngle !== undefined && resolvedAngles.has('weather-disaster')) {
    resolvedAngles.set('weather-disaster', midpointAngle(snsAngle, financeAngle))
    orbitOverrides.set('weather-disaster', OUTER_ORBIT_INDEX)
  }

  return { resolvedAngles, orbitOverrides }
}

export function computeOrbitPositions(topics: TrendTopic[]) {
  const positions = new Map<string, THREE.Vector3>()
  const { resolvedAngles, orbitOverrides } = buildSectionLayout(topics)

  topics.forEach((topic, index) => {
    const orbitIndex = orbitOverrides.get(topic.id) ?? topic.orbit
    const orbitRadius = ORBIT_RADII[orbitIndex] ?? ORBIT_RADII[1]
    const angle = resolvedAngles.get(topic.id) ?? getBaseAngle(topic, index)
    const scoreBias = (topic.trafficScore - 50) / 50
    const radialOffset = scoreBias * ORBIT_SCORE_PUSH
    const x = Math.cos(angle) * (orbitRadius + radialOffset)
    const z = Math.sin(angle) * (orbitRadius + radialOffset * 0.8)
    const y =
      Math.sin(angle * 1.45 + orbitIndex * 0.8) * VERTICAL_VARIANCE
      + (orbitIndex - 1) * 0.9
      + Math.cos(angle * 0.7) * DEPTH_SWAY * 0.32

    positions.set(topic.id, new THREE.Vector3(x, y, z))
  })

  return positions
}
