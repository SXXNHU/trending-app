import * as THREE from 'three'
import { createOnboardingMotionState, resolveOnboardingPosition, smoothstep } from '../animation/onboardingTimeline'
import type { ChildNodeData, ClickableNode, TopicNodeData } from '../types/scene'

const SELECTED_GLOW_COLOR = '#ffb700'
const CHILD_ORBIT_SPEED_RANGE = { min: 0.12, max: 0.34 }
const CHILD_RADIUS_SCALE = { min: 0.06, max: 0.22 }
const TOPIC_LABEL_SCALE_RANGE = { min: 0.92, max: 1.7 }
const BASE_ORBIT_SPEED = 0.055
const MAX_CHILD_SLOTS = 8

const CATEGORY_HUES: Record<string, number> = {
  Politics: 2,
  Sports: 10,
  Economy: 48,
  Tech: 210,
  Security: 34,
  Daily: 190,
  Entertainment: 330,
  Career: 165,
  Industry: 270,
  Travel: 28,
  Content: 295,
  Housing: 80,
  Air: 200,
  Social: 24,
  Food: 30,
  Wellness: 105,
  Fashion: 318,
  Beauty: 336,
  Shopping: 58,
  Mobility: 198,
}

type NodeVisual = {
  id: string
  mesh: THREE.Mesh
  glow: THREE.Sprite
  glowMat: THREE.SpriteMaterial
  trail: THREE.Line
  trailGeometry: THREE.BufferGeometry
  label: THREE.Sprite
  labelBaseScale: THREE.Vector3
  currentLabel: string
  labelFade: null | {
    phase: 'out' | 'in'
    t: number
    pendingText: string
  }
  baseGlowColor: THREE.Color
  glowBaseScale: number
  score: number
  normScore: number
  momentum: number
  pulsePhaseOffset: number
  radius: number
  finalPosition: THREE.Vector3
  introBurstPosition: THREE.Vector3
  introPlanePosition: THREE.Vector3
  introControlA: THREE.Vector3
  introControlB: THREE.Vector3
  previousPosition: THREE.Vector3
  isSelectedColor: boolean
  orbitBaseAngle: number
  orbitHorizRadius: number
  orbitSpeed: number
  orbitRing: number
}

type ChildVisual = {
  mesh: THREE.Mesh
  label: THREE.Sprite
  line: THREE.Line
  parentId: string
  currentLabel: string
  labelFade: null | {
    phase: 'out' | 'in'
    t: number
    pendingText: string
  }
  finalOffset: THREE.Vector3
  radius: number
  orbitRadial: THREE.Vector3
  orbitTangent: THREE.Vector3
  phaseOffset: number
  angularSpeed: number
  pulsePhase: number
  introOffset: number
  slotIndex: number
  siblingCount: number
}

type PendingLabelBatch = {
  items: Array<
    | { kind: 'child'; visual: ChildVisual; newText: string }
    | { kind: 'node'; visual: NodeVisual; newText: string }
  >
  delay: number
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function trafficToGlowOpacity(score: number) {
  return 0.25 + Math.pow(Math.max(0, Math.min(100, score)) / 100, 1.2) * 0.70
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function trafficToVisualWeight(score: number) {
  return clamp01(score / 100)
}

function radiusToLabelScale(radius: number) {
  const minRadius = 1.35
  const maxRadius = 4.6
  const normalized = Math.max(0, Math.min(1, (radius - minRadius) / (maxRadius - minRadius)))
  return TOPIC_LABEL_SCALE_RANGE.min
    + normalized * (TOPIC_LABEL_SCALE_RANGE.max - TOPIC_LABEL_SCALE_RANGE.min)
}

function computePulse(
  elapsed: number,
  momentum: number,
  baseOpacity: number,
  phaseOffset: number,
) {
  if (momentum <= 0) return { opacity: baseOpacity, scale: 1.0 }
  const hz = 0.5 + momentum * 1.2
  const amplitude = 0.22 + momentum * 0.48
  const unipolar = (Math.sin(elapsed * hz * Math.PI * 2 + phaseOffset) + 1) * 0.5
  return {
    opacity: Math.min(1.0, baseOpacity + unipolar * amplitude),
    scale: 1.0 + unipolar * momentum * 0.65,
  }
}

function makeLabelSprite(text: string, fontSize: number, isMain = false) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const fontFamily =
    '"Mona12", "HSJiphyeongseon", "SUIT Variable", "Pretendard Variable", sans-serif'

  if (!context) return new THREE.Sprite()

  context.font = `${fontSize}px ${fontFamily}`
  const width = Math.ceil(context.measureText(text).width + 32)
  const height = Math.ceil(fontSize + 24)
  canvas.width = width
  canvas.height = height

  context.clearRect(0, 0, width, height)
  context.font = `${fontSize}px ${fontFamily}`
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  if (isMain) {
    context.shadowColor = '#00e5ff'
    context.shadowBlur = 18
    context.fillStyle = 'rgba(0, 200, 255, 0.22)'
    context.fillText(text, width / 2, height / 2)
    context.shadowBlur = 9
    context.fillStyle = 'rgba(220, 245, 255, 0.97)'
    context.fillText(text, width / 2, height / 2)
  } else {
    context.shadowColor = '#48cae4'
    context.shadowBlur = 11
    context.fillStyle = 'rgba(180, 225, 245, 0.88)'
    context.fillText(text, width / 2, height / 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(width / 70, height / 70, 1)
  return sprite
}

function swapChildLabelSprite(label: THREE.Sprite, nextText: string, fontSize: number) {
  const nextSprite = makeLabelSprite(nextText, fontSize, false)
  const oldMaterial = label.material as THREE.SpriteMaterial
  const nextMaterial = nextSprite.material as THREE.SpriteMaterial
  nextMaterial.opacity = 0
  oldMaterial.map?.dispose()
  oldMaterial.dispose()
  label.material = nextMaterial
  label.scale.copy(nextSprite.scale)
}

function swapMainLabelSprite(label: THREE.Sprite, nextText: string, fontSize: number) {
  const nextSprite = makeLabelSprite(nextText, fontSize, true)
  const oldMaterial = label.material as THREE.SpriteMaterial
  const nextMaterial = nextSprite.material as THREE.SpriteMaterial
  nextMaterial.opacity = 0
  oldMaterial.map?.dispose()
  oldMaterial.dispose()
  label.material = nextMaterial
  label.scale.copy(nextSprite.scale)
}

function makeGlowSprite(color: THREE.Color, radius: number) {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const center = size / 2
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center)
  const r = Math.round(color.r * 255)
  const g = Math.round(color.g * 255)
  const b = Math.round(color.b * 255)
  gradient.addColorStop(0.0, `rgba(${r},${g},${b},0.90)`)
  gradient.addColorStop(0.15, `rgba(${r},${g},${b},0.60)`)
  gradient.addColorStop(0.35, `rgba(${r},${g},${b},0.28)`)
  gradient.addColorStop(0.60, `rgba(${r},${g},${b},0.08)`)
  gradient.addColorStop(0.85, `rgba(${r},${g},${b},0.02)`)
  gradient.addColorStop(1.0, `rgba(${r},${g},${b},0.00)`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const sprite = new THREE.Sprite(material)
  const scale = radius * 4.5
  sprite.scale.set(scale, scale, 1)
  return sprite
}

export function buildChildNodes(nodes: TopicNodeData[]) {
  const children: ChildNodeData[] = []
  nodes.forEach((node) => {
    const related = node.relatedTopics ?? []
    const slotCount = Math.max(0, Math.min(MAX_CHILD_SLOTS, Math.round(node.normScore * MAX_CHILD_SLOTS)))

    for (let index = 0; index < slotCount; index += 1) {
      const label = related[index] ?? ''
      const angle = (Math.PI * 2 * index) / Math.max(slotCount, 1)
      const ringRadius = node.radius + 1.6
      const yOffset = Math.sin(angle * 1.3 + node.radius) * 0.7
      const position = new THREE.Vector3(
        node.position.x + Math.cos(angle) * ringRadius,
        node.position.y + yOffset,
        node.position.z + Math.sin(angle) * ringRadius,
      )
      children.push({
        id: `${node.id}-slot-${index}`,
        label,
        parentId: node.id,
        position,
        radius: randomBetween(CHILD_RADIUS_SCALE.min, CHILD_RADIUS_SCALE.max) * node.radius,
        slotIndex: index,
        siblingCount: slotCount,
      })
    }
  })
  return children
}

export function createTopicNodes(params: {
  sceneRoot: THREE.Group
  nodes: TopicNodeData[]
  childNodes: ChildNodeData[]
  mainLabelFont: number
  childLabelFont: number
  momentumById: Map<string, number>
}) {
  const { sceneRoot, nodes, childNodes, mainLabelFont, childLabelFont, momentumById } = params
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const clickables: ClickableNode[] = []
  const nodeVisuals = new Map<string, NodeVisual>()
  const childVisuals: ChildVisual[] = []
  const pendingLabelBatches: PendingLabelBatch[] = []
  const nodeHueMap = new Map<string, number>()
  const origin = new THREE.Vector3(0, 0, 0)
  const childLineMaterial = new THREE.LineDashedMaterial({
    color: '#0096c7',
    transparent: true,
    opacity: 0.12,
    dashSize: 0.08,
    gapSize: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  nodes.forEach((node) => {
    const pastelHue = CATEGORY_HUES[node.category] ?? 185
    nodeHueMap.set(node.id, pastelHue)
    const visualWeight = trafficToVisualWeight(node.trafficScore)
    const satFactor = 0.14 + Math.pow(node.normScore, 0.65) * 0.54 + visualWeight * 0.32
    const litBase = 0.08 + node.normScore * 0.07 + visualWeight * 0.1
    const nodeOpacity = 0.3 + visualWeight * 0.7
    const nodeColor = new THREE.Color().setHSL(pastelHue / 360, 0.78 * satFactor, litBase)
    const emissiveColor = new THREE.Color().setHSL(
      pastelHue / 360,
      0.86 * satFactor,
      0.26 + node.normScore * 0.05 + visualWeight * 0.16,
    )
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(node.radius, 48, 48),
      new THREE.MeshPhysicalMaterial({
        color: nodeColor,
        emissive: emissiveColor,
        emissiveIntensity: 0.4 + visualWeight * 0.45,
        transparent: true,
        opacity: nodeOpacity,
        roughness: 0.10,
        metalness: 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        iridescence: 1.0,
        iridescenceIOR: 1.8,
      }),
    )
    const label = makeLabelSprite(node.label, mainLabelFont, true)
    const labelBaseScale = label.scale.clone().multiplyScalar(radiusToLabelScale(node.radius))
    label.scale.copy(labelBaseScale)
    const glow = makeGlowSprite(
      new THREE.Color().setHSL(
        pastelHue / 360,
        0.9 * satFactor,
        0.56 + node.normScore * 0.04 + visualWeight * 0.12,
      ),
      node.radius,
    )
    const glowMat = glow.material as THREE.SpriteMaterial
    const trailGeometry = new THREE.BufferGeometry().setFromPoints([origin, origin])
    const trail = new THREE.Line(
      trailGeometry,
      new THREE.LineBasicMaterial({
        color: nodeColor.clone().offsetHSL(0, 0, 0.08),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )

    const motion = createOnboardingMotionState(node.position.clone())
    const glowBaseScale = node.radius * 3.8 * (1 + node.normScore * 0.25)

    mesh.visible = false
    glow.visible = false
    label.visible = false
    trail.visible = false
    sceneRoot.add(mesh, glow, label, trail)

    const fp = motion.finalPosition
    const orbitHorizRadius = Math.sqrt(fp.x * fp.x + fp.z * fp.z)
    const orbitBaseAngle = Math.atan2(fp.z, fp.x)

    nodeVisuals.set(node.id, {
      id: node.id,
      mesh,
      glow,
      glowMat,
      trail,
      trailGeometry,
      label,
      labelBaseScale,
      currentLabel: node.label,
      labelFade: null,
      baseGlowColor: new THREE.Color().setHSL(
        pastelHue / 360,
        0.9 * satFactor,
        0.56 + node.normScore * 0.04 + visualWeight * 0.12,
      ),
      glowBaseScale,
      score: node.trafficScore,
      normScore: node.normScore,
      momentum: momentumById.get(node.id) ?? 0,
      pulsePhaseOffset: Math.random() * Math.PI * 2,
      radius: node.radius,
      finalPosition: motion.finalPosition,
      introBurstPosition: motion.burstPosition,
      introPlanePosition: motion.planePosition,
      introControlA: motion.controlA,
      introControlB: motion.controlB,
      previousPosition: new THREE.Vector3(),
      isSelectedColor: false,
      orbitBaseAngle,
      orbitHorizRadius,
      orbitSpeed: BASE_ORBIT_SPEED,
      orbitRing: node.orbit ?? 1,
    })

    clickables.push({
      mesh,
      topic: node,
      getFocusPoint: () => mesh.position.clone(),
    })
  })

  childNodes.forEach((child, childIndex) => {
    const parentNode = nodeMap.get(child.parentId)
    if (!parentNode) return
    const parentHue = nodeHueMap.get(child.parentId) ?? 185
    const childHue = ((parentHue + (childIndex % 3 - 1) * 18) + 360) % 360
    const childSatFactor = 0.01 + Math.pow(parentNode.normScore, 0.65) * 0.99
    const childLitBase = 0.12 + parentNode.normScore * 0.12
    const childColor = new THREE.Color().setHSL(childHue / 360, 0.92 * childSatFactor, childLitBase)
    const childEmissive = new THREE.Color().setHSL(childHue / 360, 1.0 * childSatFactor, 0.48 + parentNode.normScore * 0.10)

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(child.radius, 24, 24),
      new THREE.MeshPhysicalMaterial({
        color: childColor,
        emissive: childEmissive,
        emissiveIntensity: 0.75,
        transparent: false,
        roughness: 0.10,
        metalness: 0.08,
        clearcoat: 0.9,
        clearcoatRoughness: 0.06,
        iridescence: 0.8,
        iridescenceIOR: 1.6,
      }),
    )
    const label = makeLabelSprite(child.label, childLabelFont, false)
    const finalOffset = child.position.clone().sub(parentNode.position)
    const orbitRadius = finalOffset.length()
    const orbitTangent = new THREE.Vector3(0, 1, 0).cross(finalOffset)
    if (orbitTangent.lengthSq() < 0.0001) orbitTangent.set(0, 0, 1)
    orbitTangent.normalize().multiplyScalar(orbitRadius)
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([parentNode.position, child.position]),
      childLineMaterial,
    )
    line.computeLineDistances()

    mesh.visible = false
    label.visible = false
    line.visible = false
    sceneRoot.add(mesh, label, line)

    childVisuals.push({
      mesh,
      label,
      line,
      parentId: child.parentId,
      currentLabel: child.label,
      labelFade: null,
      finalOffset,
      radius: child.radius,
      orbitRadial: finalOffset.clone(),
      orbitTangent,
      phaseOffset: Math.random() * Math.PI * 2,
      angularSpeed: randomBetween(CHILD_ORBIT_SPEED_RANGE.min, CHILD_ORBIT_SPEED_RANGE.max),
      pulsePhase: Math.random() * Math.PI * 2,
      introOffset: randomBetween(0.08, 0.22),
      slotIndex: child.slotIndex,
      siblingCount: child.siblingCount,
    })

    clickables.push({
      mesh,
      topic: parentNode,
      getFocusPoint: () => nodeVisuals.get(child.parentId)?.mesh.position.clone() ?? new THREE.Vector3(),
    })
  })

  return {
    nodeVisuals,
    childVisuals,
    clickables,
    childLineMaterial,
    pendingLabelBatches,
    mainLabelFont,
    childLabelFont,
  }
}

export function scheduleChildLabelUpdates(
  nodeVisuals: Map<string, NodeVisual>,
  childVisuals: ChildVisual[],
  pendingBatches: PendingLabelBatch[],
  newNodes: TopicNodeData[],
) {
  const relatedTopicsByParent = new Map(
    newNodes.map((node) => [node.id, node.relatedTopics ?? []] as const),
  )
  const grouped = new Map<string, Array<{ visual: ChildVisual; newText: string }>>()
  const nodeLabelUpdates: Array<{ visual: NodeVisual; newText: string }> = []

  pendingBatches.length = 0

  newNodes.forEach((node) => {
    const visual = nodeVisuals.get(node.id)
    if (!visual) return

    const currentTarget = visual.labelFade?.pendingText ?? visual.currentLabel
    if (currentTarget === node.label) return
    nodeLabelUpdates.push({ visual, newText: node.label })
  })

  childVisuals.forEach((visual) => {
    const nextLabels = relatedTopicsByParent.get(visual.parentId)
    const newText = nextLabels?.[visual.slotIndex] ?? ''

    const currentTarget = visual.labelFade?.pendingText ?? visual.currentLabel
    if (currentTarget === newText) return

    const group = grouped.get(visual.parentId)
    const item = { visual, newText }
    if (group) {
      group.push(item)
      return
    }
    grouped.set(visual.parentId, [item])
  })

  const parentQueues = Array.from(grouped.values())
  const interleaved: PendingLabelBatch['items'] = nodeLabelUpdates.map(({ visual, newText }) => ({
    kind: 'node',
    visual,
    newText,
  }))
  let consumed = true

  while (consumed) {
    consumed = false
    parentQueues.forEach((queue) => {
      const nextItem = queue.shift()
      if (!nextItem) return
      interleaved.push({
        kind: 'child',
        visual: nextItem.visual,
        newText: nextItem.newText,
      })
      consumed = true
    })
  }

  if (interleaved.length === 0) return

  for (let index = 0; index < interleaved.length; index += 10) {
    pendingBatches.push({
      items: interleaved.slice(index, index + 10),
      delay: (index / 10) * 5.0,
    })
  }
}

export function setNodesIdle(
  nodeVisuals: Map<string, NodeVisual>,
  childVisuals: ChildVisual[],
) {
  nodeVisuals.forEach((visual) => {
    visual.mesh.visible = false
    visual.glow.visible = false
    visual.label.visible = false
    visual.trail.visible = false
  })
  childVisuals.forEach((child) => {
    child.mesh.visible = false
    child.label.visible = false
    child.line.visible = false
  })
}

export function updateNodesForIntro(
  progress: number,
  nodeVisuals: Map<string, NodeVisual>,
  childVisuals: ChildVisual[],
) {
  const settleAmount = smoothstep(0.76, 1, progress)

  nodeVisuals.forEach((visual) => {
    const nextPosition = resolveOnboardingPosition(progress, {
      finalPosition: visual.finalPosition,
      burstPosition: visual.introBurstPosition,
      planePosition: visual.introPlanePosition,
      controlA: visual.introControlA,
      controlB: visual.introControlB,
    })

    visual.mesh.visible = progress > 0.01
    visual.glow.visible = progress > 0.04
    visual.label.visible = progress > 0.86
    visual.trail.visible = progress < 0.94

    visual.mesh.position.copy(nextPosition)
    visual.glow.position.copy(nextPosition)
    visual.label.scale.copy(visual.labelBaseScale)
    visual.label.position.set(nextPosition.x, nextPosition.y + visual.radius + 1.15, nextPosition.z)
    visual.trailGeometry.setFromPoints([visual.previousPosition.clone(), nextPosition.clone()])
    ;(visual.trail.material as THREE.LineBasicMaterial).opacity = Math.max(
      0,
      Math.min(0.34, visual.previousPosition.distanceTo(nextPosition) * 0.08 * (1 - settleAmount)),
    )
    visual.previousPosition.copy(nextPosition)

    const introGlowScale = visual.glowBaseScale * (1.2 + (1 - progress) * 0.85)
    visual.glow.scale.set(introGlowScale, introGlowScale, 1)
    visual.glowMat.opacity = Math.max(0, Math.min(0.86, 0.28 + (1 - progress) * 0.48))
  })

  childVisuals.forEach((child) => {
    const parentVisual = nodeVisuals.get(child.parentId)
    if (!parentVisual) return
    const childStart = 0.84 + child.introOffset
    const childT = smoothstep(childStart, 1, progress)
    const orbitPosition = parentVisual.mesh.position
      .clone()
      .add(child.finalOffset.clone().multiplyScalar(childT))
    const hasLabel = child.currentLabel.trim().length > 0
    child.mesh.visible = childT > 0.02
    child.label.visible = hasLabel && childT > 0.5
    child.line.visible = childT > 0.16
    child.mesh.position.copy(orbitPosition)
    child.label.position.set(orbitPosition.x, orbitPosition.y + child.radius + 0.42, orbitPosition.z)
    child.line.geometry.setFromPoints([parentVisual.mesh.position, child.mesh.position])
    child.line.computeLineDistances()
  })
}

const ORBIT_VERT_VAR = 1.75
const ORBIT_DEPTH_SWAY = 1.45
const _tmpVec = new THREE.Vector3()

export function updateNodesForFinalState(params: {
  elapsed: number
  dt: number
  nodeVisuals: Map<string, NodeVisual>
  childVisuals: ChildVisual[]
  pendingLabelBatches: PendingLabelBatch[]
  selectedId: string | null
  hoveredId: string | null
  mainLabelFont: number
  childLabelFont: number
}) {
  const {
    elapsed,
    dt,
    nodeVisuals,
    childVisuals,
    pendingLabelBatches,
    selectedId,
    hoveredId,
    mainLabelFont,
    childLabelFont,
  } = params

  nodeVisuals.forEach((visual, id) => {
    const isSelected = selectedId === id
    const isHovered = hoveredId === id
    const breatheAmp = 0.03 + visual.normScore * 0.24
    const breathe = 1 + Math.sin(elapsed * 0.9 + visual.pulsePhaseOffset) * breatheAmp

    const currentAngle = visual.orbitBaseAngle + elapsed * visual.orbitSpeed
    const ox = Math.cos(currentAngle) * visual.orbitHorizRadius
    const oz = Math.sin(currentAngle) * visual.orbitHorizRadius
    const oy =
      Math.sin(currentAngle * 1.45 + visual.orbitRing * 0.8) * ORBIT_VERT_VAR
      + (visual.orbitRing - 1) * 0.9
      + Math.cos(currentAngle * 0.7) * ORBIT_DEPTH_SWAY * 0.32
    _tmpVec.set(ox, oy, oz)

    visual.mesh.visible = true
    visual.glow.visible = true
    visual.label.visible = true
    visual.trail.visible = false
    visual.mesh.position.copy(_tmpVec)
    visual.mesh.scale.setScalar(breathe)
    visual.label.scale.copy(visual.labelBaseScale).multiplyScalar(breathe)
    visual.label.position.set(ox, oy + visual.radius + 1.15, oz)
    visual.glow.position.copy(_tmpVec)

    if (isSelected) {
      if (!visual.isSelectedColor) {
        visual.glowMat.color.set(SELECTED_GLOW_COLOR)
        visual.isSelectedColor = true
      }
      visual.glowMat.opacity = 0.85
      const scale = visual.glowBaseScale * 1.5 * breathe
      visual.glow.scale.set(scale, scale, 1)
      return
    }

    if (visual.isSelectedColor) {
      visual.glowMat.color.copy(visual.baseGlowColor)
      visual.isSelectedColor = false
    }

    const pulse = computePulse(
      elapsed,
      visual.momentum,
      trafficToGlowOpacity(visual.score),
      visual.pulsePhaseOffset,
    )
    visual.glowMat.opacity = Math.min(1.0, pulse.opacity + (isHovered ? 0.08 : 0))
    const scale = (isHovered ? pulse.scale * 1.1 : pulse.scale) * breathe * visual.glowBaseScale
    visual.glow.scale.set(scale, scale, 1)
  })

  for (let index = pendingLabelBatches.length - 1; index >= 0; index -= 1) {
    const batch = pendingLabelBatches[index]
    batch.delay -= dt
    if (batch.delay > 0) continue
    batch.items.forEach((item) => {
      item.visual.labelFade = {
        phase: 'out',
        t: 0,
        pendingText: item.newText,
      }
    })
    pendingLabelBatches.splice(index, 1)
  }

  nodeVisuals.forEach((visual) => {
    const labelMaterial = visual.label.material as THREE.SpriteMaterial
    if (!visual.labelFade) {
      labelMaterial.opacity = 1
      return
    }

    const fadeSpeed = dt / 0.35
    visual.labelFade.t = Math.min(1, visual.labelFade.t + fadeSpeed)

    if (visual.labelFade.phase === 'out') {
      labelMaterial.opacity = 1 - visual.labelFade.t
      if (visual.labelFade.t < 1) return

      const pendingText = visual.labelFade.pendingText
      swapMainLabelSprite(visual.label, pendingText, mainLabelFont)
      visual.labelBaseScale = visual.label.scale.clone().multiplyScalar(radiusToLabelScale(visual.radius))
      visual.labelFade = {
        phase: 'in',
        t: 0,
        pendingText,
      }
      return
    }

    labelMaterial.opacity = visual.labelFade.t
    if (visual.labelFade.t < 1) return

    visual.currentLabel = visual.labelFade.pendingText
    visual.labelFade = null
    labelMaterial.opacity = 1
  })

  childVisuals.forEach((child) => {
    const parentVisual = nodeVisuals.get(child.parentId)
    if (!parentVisual) return
    const orbitAngle = elapsed * child.angularSpeed + child.phaseOffset
    const orbitPosition = parentVisual.mesh.position
      .clone()
      .addScaledVector(child.orbitRadial, Math.cos(orbitAngle))
      .addScaledVector(child.orbitTangent, Math.sin(orbitAngle))
    const pulse = 1 + Math.sin(elapsed * 1.4 + child.pulsePhase) * 0.06

    const hasActiveLabel = child.labelFade
      ? child.labelFade.pendingText.trim().length > 0 || child.currentLabel.trim().length > 0
      : child.currentLabel.trim().length > 0
    child.mesh.visible = true
    child.label.visible = hasActiveLabel
    child.line.visible = true
    child.mesh.position.copy(orbitPosition)
    child.mesh.scale.setScalar(pulse)
    child.label.position.set(
      orbitPosition.x,
      orbitPosition.y + child.radius * pulse + 0.42,
      orbitPosition.z,
    )
    child.line.geometry.setFromPoints([parentVisual.mesh.position, child.mesh.position])
    child.line.computeLineDistances()

    const labelMaterial = child.label.material as THREE.SpriteMaterial
    if (!child.labelFade) {
      labelMaterial.opacity = 1
      return
    }

    const fadeSpeed = dt / 0.35
    child.labelFade.t = Math.min(1, child.labelFade.t + fadeSpeed)

    if (child.labelFade.phase === 'out') {
      labelMaterial.opacity = 1 - child.labelFade.t
      if (child.labelFade.t < 1) return

      const pendingText = child.labelFade.pendingText
      swapChildLabelSprite(child.label, pendingText, childLabelFont)
      child.labelFade = {
        phase: 'in',
        t: 0,
        pendingText,
      }
      return
    }

    labelMaterial.opacity = child.labelFade.t
    if (child.labelFade.t < 1) return

    child.currentLabel = child.labelFade.pendingText
    child.labelFade = null
    labelMaterial.opacity = 1
  })
}

export function disposeTopicNodes(
  nodeVisuals: Map<string, NodeVisual>,
  childVisuals: ChildVisual[],
  childLineMaterial: THREE.LineDashedMaterial,
) {
  nodeVisuals.forEach((visual) => {
    visual.mesh.geometry.dispose()
    ;(visual.mesh.material as THREE.Material).dispose()
    ;(visual.label.material as THREE.SpriteMaterial).map?.dispose()
    ;(visual.label.material as THREE.Material).dispose()
    ;(visual.glow.material as THREE.SpriteMaterial).map?.dispose()
    ;(visual.glow.material as THREE.Material).dispose()
    visual.trailGeometry.dispose()
    ;(visual.trail.material as THREE.Material).dispose()
  })

  childVisuals.forEach((child) => {
    child.mesh.geometry.dispose()
    ;(child.mesh.material as THREE.Material).dispose()
    ;(child.label.material as THREE.SpriteMaterial).map?.dispose()
    ;(child.label.material as THREE.Material).dispose()
    child.line.geometry.dispose()
  })

  childLineMaterial.dispose()
}
