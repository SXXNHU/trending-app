import * as THREE from 'three'
import { createOnboardingMotionState, resolveOnboardingPosition, smoothstep } from '../animation/onboardingTimeline'
import type { ChildNodeData, ClickableNode, TopicNodeData } from '../types/scene'

const SELECTED_GLOW_COLOR = '#ffb700'
const CHILD_ORBIT_SPEED_RANGE = { min: 0.22, max: 0.58 }
const CHILD_RADIUS_SCALE = { min: 0.06, max: 0.22 }

type NodeVisual = {
  id: string
  mesh: THREE.Mesh
  glow: THREE.Sprite
  glowMat: THREE.SpriteMaterial
  trail: THREE.Line
  trailGeometry: THREE.BufferGeometry
  label: THREE.Sprite
  baseGlowColor: THREE.Color
  glowBaseScale: number
  score: number
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
  finalOffset: THREE.Vector3
  radius: number
  orbitRadial: THREE.Vector3
  orbitTangent: THREE.Vector3
  phaseOffset: number
  angularSpeed: number
  pulsePhase: number
  introOffset: number
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function trafficToGlowOpacity(score: number) {
  return 0.25 + Math.pow(Math.max(0, Math.min(100, score)) / 100, 1.2) * 0.70
}

function computePulse(
  elapsed: number,
  momentum: number,
  baseOpacity: number,
  phaseOffset: number,
) {
  if (momentum <= 0) return { opacity: baseOpacity, scale: 1.0 }
  const hz = 0.5 + momentum * 1.0
  const amplitude = 0.18 + momentum * 0.32
  const unipolar = (Math.sin(elapsed * hz * Math.PI * 2 + phaseOffset) + 1) * 0.5
  return {
    opacity: Math.min(1.0, baseOpacity + unipolar * amplitude),
    scale: 1.0 + unipolar * momentum * 0.30,
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
    related.forEach((label, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(related.length, 1)
      const ringRadius = node.radius + 1.6
      const yOffset = Math.sin(angle * 1.3 + node.radius) * 0.7
      const position = new THREE.Vector3(
        node.position.x + Math.cos(angle) * ringRadius,
        node.position.y + yOffset,
        node.position.z + Math.sin(angle) * ringRadius,
      )
      children.push({
        id: `${node.id}-${label}`,
        label,
        parentId: node.id,
        position,
        radius: randomBetween(CHILD_RADIUS_SCALE.min, CHILD_RADIUS_SCALE.max) * node.radius,
      })
    })
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
  const origin = new THREE.Vector3(0, 0, 0)
  const PASTEL_HUES = [340, 25, 55, 145, 185, 215, 265, 300, 15, 90, 165, 235]
  const childLineMaterial = new THREE.LineDashedMaterial({
    color: '#0096c7',
    transparent: true,
    opacity: 0.12,
    dashSize: 0.08,
    gapSize: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  nodes.forEach((node, nodeIndex) => {
    const pastelHue = PASTEL_HUES[nodeIndex % PASTEL_HUES.length]
    const satFactor = 0.2 + node.normScore * 0.7
    const litBase = 0.08 + (node.normScore - 0.2) * 0.10
    const nodeColor = new THREE.Color().setHSL(pastelHue / 360, 0.70 * satFactor, litBase)
    const emissiveColor = new THREE.Color().setHSL(pastelHue / 360, 0.80 * satFactor, 0.40 + (node.normScore - 0.5) * 0.08)
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(node.radius, 48, 48),
      new THREE.MeshPhysicalMaterial({
        color: nodeColor,
        emissive: emissiveColor,
        emissiveIntensity: 0.55,
        transparent: false,
        roughness: 0.12,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
      }),
    )
    const label = makeLabelSprite(node.label, mainLabelFont, true)
    const glow = makeGlowSprite(new THREE.Color().setHSL(pastelHue / 360, 0.70 * satFactor, 0.72 + (node.normScore - 0.5) * 0.10), node.radius)
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

    const ORBIT_SPEEDS = [0.10, 0.07, 0.045]
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
      baseGlowColor: new THREE.Color().setHSL(pastelHue / 360, 0.70 * satFactor, 0.72 + (node.normScore - 0.5) * 0.10),
      glowBaseScale,
      score: node.trafficScore,
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
      orbitSpeed: ORBIT_SPEEDS[node.orbit ?? 1],
      orbitRing: node.orbit ?? 1,
    })

    clickables.push({
      mesh,
      topic: node,
      getFocusPoint: () => mesh.position.clone(),
    })
  })

  childNodes.forEach((child, childIndex) => {
    const childHue = PASTEL_HUES[(childIndex + 3) % PASTEL_HUES.length]
    const parentNode = nodeMap.get(child.parentId)
    if (!parentNode) return
    const childSatFactor = 0.2 + parentNode.normScore * 0.7
    const childLitBase = 0.08 + (parentNode.normScore - 0.2) * 0.10
    const childColor = new THREE.Color().setHSL(childHue / 360, 0.72 * childSatFactor, childLitBase)
    const childEmissive = new THREE.Color().setHSL(childHue / 360, 0.80 * childSatFactor, 0.38 + (parentNode.normScore - 0.5) * 0.08)

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(child.radius, 24, 24),
      new THREE.MeshPhysicalMaterial({
        color: childColor,
        emissive: childEmissive,
        emissiveIntensity: 0.50,
        transparent: false,
        roughness: 0.12,
        metalness: 0.05,
        clearcoat: 0.9,
        clearcoatRoughness: 0.08,
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
      finalOffset,
      radius: child.radius,
      orbitRadial: finalOffset.clone(),
      orbitTangent,
      phaseOffset: Math.random() * Math.PI * 2,
      angularSpeed: randomBetween(CHILD_ORBIT_SPEED_RANGE.min, CHILD_ORBIT_SPEED_RANGE.max),
      pulsePhase: Math.random() * Math.PI * 2,
      introOffset: randomBetween(0.08, 0.22),
    })

    clickables.push({
      mesh,
      topic: parentNode,
      getFocusPoint: () => nodeVisuals.get(child.parentId)?.mesh.position.clone() ?? new THREE.Vector3(),
    })
  })

  return { nodeVisuals, childVisuals, clickables, childLineMaterial }
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
    child.mesh.visible = childT > 0.02
    child.label.visible = childT > 0.5
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
  nodeVisuals: Map<string, NodeVisual>
  childVisuals: ChildVisual[]
  selectedId: string | null
  hoveredId: string | null
}) {
  const { elapsed, nodeVisuals, childVisuals, selectedId, hoveredId } = params

  nodeVisuals.forEach((visual, id) => {
    const isSelected = selectedId === id
    const isHovered = hoveredId === id
    const breathe = 1 + Math.sin(elapsed * 0.9 + visual.pulsePhaseOffset) * 0.06

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

  childVisuals.forEach((child) => {
    const parentVisual = nodeVisuals.get(child.parentId)
    if (!parentVisual) return
    const orbitAngle = elapsed * child.angularSpeed + child.phaseOffset
    const orbitPosition = parentVisual.mesh.position
      .clone()
      .addScaledVector(child.orbitRadial, Math.cos(orbitAngle))
      .addScaledVector(child.orbitTangent, Math.sin(orbitAngle))
    const pulse = 1 + Math.sin(elapsed * 1.4 + child.pulsePhase) * 0.06

    child.mesh.visible = true
    child.label.visible = true
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
