import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { computeSimilarity } from './layout/similarityMatrix'
import { computePositions } from './layout/layoutEngine'
import './App.css'
import { buildFallbackTrends, type TrendTopic } from './data/trendItems'

// ─── Types ──────────────────────────────────────────────────────────

type TopicNode = TrendTopic & {
  position: THREE.Vector3
  radius: number
  normScore: number
}

type ChildNode = {
  id: string
  label: string
  parentId: string
  position: THREE.Vector3
  radius: number
}

type ChildVisual = {
  mesh: THREE.Mesh
  label: THREE.Sprite
  line: THREE.Line
  parentPosition: THREE.Vector3
  radius: number
  orbitRadial: THREE.Vector3
  orbitTangent: THREE.Vector3
  orbitNormal: THREE.Vector3
  phaseOffset: number
  angularSpeed: number
  pulsePhase: number
}

type ClickableNode = {
  mesh: THREE.Mesh
  topic: TrendTopic
  focusPoint: THREE.Vector3
}

type NodeVisual = {
  mesh: THREE.Mesh
  glow: THREE.Sprite
  glowMat: THREE.SpriteMaterial
  baseGlowColor: THREE.Color
  glowBaseScale: number
  score: number
  momentum: number
  normScore: number
  pulsePhaseOffset: number
  isSelectedColor: boolean
}

// ─── Constants ──────────────────────────────────────────────────────

const REFRESH_INTERVAL_MS = 10 * 60 * 1000
const REFRESH_INTERVAL_SECS = 600
const SELECTED_GLOW_COLOR = '#ffb700'
const CHILD_RADIUS_RANGE = { min: 0.24, max: 0.46 }
const CHILD_ORBIT_SPEED_RANGE = { min: 0.22, max: 0.58 }

// ─── Pure helpers ───────────────────────────────────────────────────

function getViewportPreset(width: number) {
  const isCompact = width <= 640
  return {
    isCompact,
    cameraDistance: isCompact ? 39 : 32,
    cameraFov: isCompact ? 56 : 48,
    sceneScale: isCompact ? 0.86 : 1,
    dragX: isCompact ? 0.0016 : 0.0022,
    dragY: isCompact ? 0.0012 : 0.0016,
    mainLabelFont: isCompact ? 23 : 30,
    childLabelFont: isCompact ? 15 : 18,
    focusDistance: isCompact ? 7.8 : 6.6,
  }
}

function formatBuzz(buzz: number) {
  return `${buzz.toLocaleString('en-US')} signals`
}

function formatClock(isoString: string) {
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatEvidenceSource(source: 'NEWS' | 'BLOG' | 'CAFE') {
  if (source === 'NEWS') return 'NEWS'
  if (source === 'BLOG') return 'BLOG'
  return 'CAFE'
}

function formatTimeAgo(date: Date): string {
  const diffSecs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diffSecs < 60) return `${diffSecs}s ago`
  if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`
  return `${Math.floor(diffSecs / 3600)}h ago`
}

function formatCountdown(secs: number): string {
  const m = String(Math.floor(secs / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${m}:${s}`
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function randomUnitVector() {
  const z = randomBetween(-1, 1)
  const theta = randomBetween(0, Math.PI * 2)
  const radius = Math.sqrt(1 - z * z)
  return new THREE.Vector3(
    radius * Math.cos(theta),
    z,
    radius * Math.sin(theta),
  )
}

/** score 0–100  →  glow opacity 0.25–0.95 */
function trafficToGlowOpacity(score: number): number {
  return 0.25 + Math.pow(Math.max(0, Math.min(100, score)) / 100, 1.2) * 0.70
}

/** momentum 0–1  →  pulse Hz 0–2.8 */
function momentumToPulseHz(momentum: number): number {
  if (momentum <= 0) return 0
  return 0.5 + momentum * 1.0
}

function normScoreToRadius(normScore: number): number {
  return 1.8 + Math.pow(normScore, 0.5) * 1.4
}

function normalizeScores(topics: { trafficScore: number; id: string }[]): Map<string, number> {
  const scores = topics.map((topic) => topic.trafficScore)
  const min = Math.min(...scores)
  const max = Math.max(...scores)
  const range = max - min || 1
  return new Map(
    topics.map((topic) => [topic.id, (topic.trafficScore - min) / range]),
  )
}

function computePulse(
  elapsed: number,
  momentum: number,
  baseOpacity: number,
  phaseOffset: number,
): { opacity: number; scale: number } {
  if (momentum <= 0) return { opacity: baseOpacity, scale: 1.0 }
  const hz = momentumToPulseHz(momentum)
  const amplitude = 0.18 + momentum * 0.32
  const unipolar = (Math.sin(elapsed * hz * Math.PI * 2 + phaseOffset) + 1) * 0.5
  return {
    opacity: Math.min(1.0, baseOpacity + unipolar * amplitude),
    scale: 1.0 + unipolar * momentum * 0.30,
  }
}

/** Normalised delta vs previous snapshot. Returns 0 when no prior data exists. */
function calcMomentum(
  id: string,
  score: number,
  prevMap: Map<string, number>,
): number {
  if (prevMap.size === 0) return 0
  const prev = prevMap.get(id)
  if (prev === undefined) return 0
  const delta = score - prev
  if (delta <= 0) return 0
  return Math.min(delta / 35, 1)
}

function makeLabelSprite(text: string, fontSize: number, isMain = false) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const fontFamily =
    '"Mona12", "HSJiphyeongseon", "HS 지평선", "HS지평선체", "SUIT Variable", "Pretendard Variable", sans-serif'

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

function makeGlowSprite(color: THREE.Color, radius: number): THREE.Sprite {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2
  const grad = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx)
  const r = Math.round(color.r * 255)
  const g = Math.round(color.g * 255)
  const b = Math.round(color.b * 255)
  grad.addColorStop(0.0, `rgba(${r},${g},${b},0.90)`)
  grad.addColorStop(0.15, `rgba(${r},${g},${b},0.60)`)
  grad.addColorStop(0.35, `rgba(${r},${g},${b},0.28)`)
  grad.addColorStop(0.60, `rgba(${r},${g},${b},0.08)`)
  grad.addColorStop(0.85, `rgba(${r},${g},${b},0.02)`)
  grad.addColorStop(1.0, `rgba(${r},${g},${b},0.00)`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const sprite = new THREE.Sprite(mat)
  const s = radius * 4.5
  sprite.scale.set(s, s, 1)
  return sprite
}

function buildTopicNodes(
  topics: TrendTopic[],
  positions: Map<string, THREE.Vector3>,
  normScores: Map<string, number>,
) {
  return topics.map((topic) => {
    const pos = positions.get(topic.id) ?? new THREE.Vector3(0, 0, 0)
    const norm = normScores.get(topic.id) ?? 0.5
    return {
      ...topic,
      position: pos,
      radius: normScoreToRadius(norm),
      normScore: norm,
    }
  })
}

function buildChildNodes(nodes: TopicNode[]) {
  const children: ChildNode[] = []
  nodes.forEach((node) => {
    const related = node.relatedTopics ?? []
    related.forEach((label, index) => {
      const t = (index + 0.5) / Math.max(related.length, 1)
      const phi = Math.acos(1 - 2 * t)
      const theta = index * Math.PI * (3 - Math.sqrt(5))
      const orbitRadius = node.radius + 1.3 + Math.random() * 0.8
      const offset = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta),
      ).multiplyScalar(orbitRadius)
      const childRadius = randomBetween(CHILD_RADIUS_RANGE.min, CHILD_RADIUS_RANGE.max)
      children.push({
        id: `${node.id}-${label}`,
        label,
        parentId: node.id,
        position: node.position.clone().add(offset),
        radius: childRadius,
      })
    })
  })
  return children
}

function createInstancedSphereLayers(
  counts: number[],
  baseRadius: number,
  createTransform: (helper: THREE.Object3D, index: number, count: number) => void,
  createColor: () => THREE.Color,
  opacities: number[],
) {
  const helper = new THREE.Object3D()
  return counts.map((count, layerIndex) => {
    const geometry = new THREE.SphereGeometry(baseRadius, 12, 12)
    const material = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: opacities[layerIndex],
      depthWrite: false,
      vertexColors: true,
    })
    const mesh = new THREE.InstancedMesh(geometry, material, count)
    for (let index = 0; index < count; index += 1) {
      createTransform(helper, index, count)
      helper.updateMatrix()
      mesh.setMatrixAt(index, helper.matrix)
      mesh.setColorAt(index, createColor())
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    return { mesh, geometry, material }
  })
}

function createAccentOrb() {
  const typeRoll = Math.random()
  let hue: number, sat: number, lit: number
  if (typeRoll > 0.62) {
    hue = 185 + Math.random() * 28; sat = 0.78 + Math.random() * 0.22; lit = 0.48 + Math.random() * 0.24
  } else if (typeRoll > 0.28) {
    hue = 215 + Math.random() * 40; sat = 0.62 + Math.random() * 0.32; lit = 0.42 + Math.random() * 0.3
  } else {
    hue = 265 + Math.random() * 50; sat = 0.68 + Math.random() * 0.32; lit = 0.38 + Math.random() * 0.28
  }
  const color = new THREE.Color().setHSL(hue / 360, sat, Math.min(lit, 0.9))
  const radius = 0.26 + Math.random() * 1.14
  const geometry = new THREE.SphereGeometry(radius, 18, 18)
  const material = new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity: 0.08 + Math.random() * 0.24,
    transmission: 0.8 + Math.random() * 0.16,
    roughness: 0.02 + Math.random() * 0.08,
    thickness: 0.3 + Math.random() * 1.4,
    ior: 1.12 + Math.random() * 0.14,
    metalness: 0,
    clearcoat: 0.72 + Math.random() * 0.28,
    clearcoatRoughness: 0.02 + Math.random() * 0.1,
    depthWrite: false,
  })
  const mesh = new THREE.Mesh(geometry, material)
  const distance = 26 + Math.random() * 132
  mesh.position.copy(randomUnitVector().multiplyScalar(distance))
  mesh.scale.setScalar(0.8 + Math.random() * 1.6)
  return { mesh, geometry, material }
}

// ─── Component ──────────────────────────────────────────────────────

function App() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [topics, setTopics] = useState<TrendTopic[]>(() => buildFallbackTrends())
  const [status, setStatus] = useState<'loading' | 'live' | 'fallback'>('loading')
  const [modalTopicId, setModalTopicId] = useState<string | null>(null)
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null)
  const [refreshCountdown, setRefreshCountdown] = useState(REFRESH_INTERVAL_SECS)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const selectedIdRef = useRef<string | null>(null)
  const hoveredIdRef = useRef<string | null>(null)
  const focusTimeoutRef = useRef<number | null>(null)
  const previousSnapshotRef = useRef<Map<string, number>>(new Map())
  const prevPositionsRef = useRef<Map<string, THREE.Vector3>>(new Map())
  const topicsRef = useRef(topics)
  const hasInteractedRef = useRef(false)
  const refreshLoopRef = useRef<() => Promise<void>>(async () => {})

  useEffect(() => {
    topicsRef.current = topics
  }, [topics])

  // ── Refresh cycle ────────────────────────────────────────────────
  useEffect(() => {
    let countdownInterval: number | null = null
    let refreshTimeout: number | null = null
    let cancelled = false

    async function doFetch() {
      if (cancelled) return
      setIsRefreshing(true)
      previousSnapshotRef.current = new Map(
        topicsRef.current.map((t) => [t.id, t.trafficScore]),
      )
      try {
        const response = await fetch('/api/trends')
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = (await response.json()) as {
          mode?: 'live' | 'fallback'
          topics?: TrendTopic[]
        }
        if (!cancelled && data.topics?.length) {
          setTopics(data.topics)
          setStatus(data.mode === 'live' ? 'live' : 'fallback')
        }
      } catch {
        if (!cancelled) {
          setStatus((prev) => (prev === 'loading' ? 'fallback' : prev))
        }
      } finally {
        if (!cancelled) {
          setIsRefreshing(false)
          setLastSyncAt(new Date())
        }
      }
    }

    function startCountdown() {
      if (countdownInterval !== null) clearInterval(countdownInterval)
      setRefreshCountdown(REFRESH_INTERVAL_SECS)
      countdownInterval = window.setInterval(() => {
        setRefreshCountdown((prev) => Math.max(0, prev - 1))
      }, 1000)
    }

    function scheduleNext() {
      if (refreshTimeout !== null) clearTimeout(refreshTimeout)
      refreshTimeout = window.setTimeout(async () => {
        await doFetch()
        startCountdown()
        scheduleNext()
      }, REFRESH_INTERVAL_MS)
    }

    refreshLoopRef.current = async () => {
      if (refreshTimeout !== null) clearTimeout(refreshTimeout)
      if (countdownInterval !== null) clearInterval(countdownInterval)
      await doFetch()
      startCountdown()
      scheduleNext()
    }

    void doFetch().then(() => {
      startCountdown()
      scheduleNext()
    })

    const hintTimer = window.setTimeout(() => {
      if (!hasInteractedRef.current && !cancelled) setShowHint(true)
    }, 1500)

    return () => {
      cancelled = true
      if (countdownInterval !== null) clearInterval(countdownInterval)
      if (refreshTimeout !== null) clearTimeout(refreshTimeout)
      clearTimeout(hintTimer)
    }
  }, [])

  // Auto-dismiss hint after 7 s
  useEffect(() => {
    if (!showHint) return
    const t = window.setTimeout(() => setShowHint(false), 7000)
    return () => clearTimeout(t)
  }, [showHint])

  const handleManualRefresh = useCallback(async () => {
    if (isRefreshing) return
    await refreshLoopRef.current()
  }, [isRefreshing])

  function dismissHint() {
    hasInteractedRef.current = true
    setShowHint(false)
  }

  const topicMap = useMemo(
    () => new Map(topics.map((t) => [t.id, t])),
    [topics],
  )

  const maxBuzz = useMemo(
    () => Math.max(...topics.map((t) => t.buzz)),
    [topics],
  )

  function closeModalKeepOrbitView() {
    selectedIdRef.current = null
    setModalTopicId(null)
    if (focusTimeoutRef.current !== null) {
      window.clearTimeout(focusTimeoutRef.current)
      focusTimeoutRef.current = null
    }
  }

  // ── Three.js scene ───────────────────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const prevMap = previousSnapshotRef.current
    const normScores = normalizeScores(topics)
    const simMatrix = computeSimilarity(topics)
    const radiiArray = topics.map((t) => normScoreToRadius(normScores.get(t.id) ?? 0.5))
    const positions = computePositions(topics, simMatrix, radiiArray, prevPositionsRef.current)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2('#000208', 0.009)
    const viewportPreset = getViewportPreset(mount.clientWidth)

    const camera = new THREE.PerspectiveCamera(
      viewportPreset.cameraFov,
      mount.clientWidth / mount.clientHeight,
      0.1,
      260,
    )
    camera.position.set(0, 0, 0)
    camera.lookAt(0, 0, -1)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.innerHTML = ''
    mount.appendChild(renderer.domElement)

    const sceneRoot = new THREE.Group()
    scene.add(sceneRoot)

    const fieldGroup = new THREE.Group()
    sceneRoot.add(fieldGroup)

    const ambientLight = new THREE.AmbientLight('#091828', 2.6)
    const keyLight = new THREE.PointLight('#00d4ff', 52, 155, 2)
    keyLight.position.set(0, 0, 0)
    const rimLight = new THREE.PointLight('#6600cc', 14, 90, 2)
    rimLight.position.set(-18, 10, 16)
    const accentLight = new THREE.PointLight('#0033ff', 8, 70, 2)
    accentLight.position.set(8, -4, 10)
    scene.add(ambientLight, keyLight, rimLight, accentLight)

    const starLayers = createInstancedSphereLayers(
      [26, 44, 20],
      0.14,
      (helper) => {
        const direction = randomUnitVector()
        const distance = randomBetween(96, 182)
        helper.position.copy(direction.multiplyScalar(distance))
        helper.scale.setScalar(0.45 + Math.random() * 2.6)
      },
      () =>
        new THREE.Color(
          Math.random() > 0.55 ? '#00e5ff' : Math.random() > 0.35 ? '#4da6ff' : '#e0f0ff',
        ),
      [0.14, 0.42, 0.88],
    )
    starLayers.forEach((layer) => sceneRoot.add(layer.mesh))

    const networkLayers = createInstancedSphereLayers(
      [70, 110, 56],
      0.18,
      (helper) => {
        const direction = randomUnitVector()
        const distance = randomBetween(18, 92)
        helper.position.copy(direction.multiplyScalar(distance))
        helper.scale.setScalar(0.5 + Math.random() * 2.4)
      },
      () =>
        new THREE.Color(
          Math.random() > 0.58 ? '#00b4d8' : Math.random() > 0.3 ? '#0077b6' : '#48cae4',
        ),
      [0.1, 0.26, 0.54],
    )
    networkLayers.forEach((layer) => fieldGroup.add(layer.mesh))

    const accentOrbs = Array.from({ length: 26 }, () => createAccentOrb())
    accentOrbs.forEach((orb) => sceneRoot.add(orb.mesh))

    const orbitalRings = [11.5, 17.5, 24.5].map((radius, index) => {
      const geo = new THREE.TorusGeometry(radius, 0.018, 10, 120)
      const mat = new THREE.MeshBasicMaterial({
        color: index === 1 ? '#a7ecff' : '#8fc9ff',
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.rotation.x = Math.PI / 2
      sceneRoot.add(mesh)
      return {
        mesh,
        geo,
        mat,
        rotAxis: randomUnitVector(),
        rotSpeed: 0.0004 + index * 0.00012,
      }
    })

    const linkLineMaterial = new THREE.LineBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const childLineMaterial = new THREE.LineDashedMaterial({
      color: '#0096c7',
      transparent: true,
      opacity: 0.16,
      dashSize: 0.04,
      gapSize: 0.09,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const nodes = buildTopicNodes(topics, positions, normScores)
    const childNodes = buildChildNodes(nodes)
    const nodeMap = new Map(nodes.map((node) => [node.id, node]))
    const clickables: ClickableNode[] = []
    const childVisuals: ChildVisual[] = []
    const nodeVisuals = new Map<string, NodeVisual>()

    const PASTEL_HUES = [340, 25, 55, 145, 185, 215, 265, 300, 15, 90, 165, 235]

    nodes.forEach((node, nodeIndex) => {
      const geometry = new THREE.SphereGeometry(node.radius, 48, 48)
      const pastelHue = PASTEL_HUES[nodeIndex % PASTEL_HUES.length]
      const nodeColor = new THREE.Color().setHSL(pastelHue / 360, 0.70, 0.68)
      const emissiveColor = new THREE.Color().setHSL(pastelHue / 360, 0.80, 0.40)
      const material = new THREE.MeshPhysicalMaterial({
        color: nodeColor,
        emissive: emissiveColor,
        emissiveIntensity: 0.55,
        transparent: false,
        roughness: 0.12,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.copy(node.position)
      sceneRoot.add(mesh)
      clickables.push({ mesh, topic: node, focusPoint: node.position.clone() })

      // Glow sprite — soft radial light emanating from the sphere
      const momentum = calcMomentum(node.id, node.trafficScore, prevMap)
      const baseGlowColor = new THREE.Color().setHSL(pastelHue / 360, 0.70, 0.72)
      const glow = makeGlowSprite(baseGlowColor, node.radius)
      glow.position.copy(node.position)
      sceneRoot.add(glow)
      const glowMat = glow.material as THREE.SpriteMaterial
      const glowBaseScale = node.radius * 3.8 * (1 + node.normScore * 0.25)
      glowMat.opacity = trafficToGlowOpacity(node.trafficScore)
      const glowS = glowBaseScale
      glow.scale.set(glowS, glowS, 1)

      nodeVisuals.set(node.id, {
        mesh,
        glow,
        glowMat,
        baseGlowColor: baseGlowColor.clone(),
        glowBaseScale,
        score: node.trafficScore,
        momentum,
        normScore: node.normScore,
        pulsePhaseOffset: Math.random() * Math.PI * 2,
        isSelectedColor: false,
      })

      const label = makeLabelSprite(node.label, viewportPreset.mainLabelFont, true)
      label.position.copy(node.position.clone().add(new THREE.Vector3(0, node.radius + 1.15, 0)))
      sceneRoot.add(label)
    })

    const CHILD_PASTEL_HUES = [15, 55, 95, 145, 185, 225, 265, 305, 340, 30, 170, 245]

    childNodes.forEach((child, childIndex) => {
      const childHue = CHILD_PASTEL_HUES[childIndex % CHILD_PASTEL_HUES.length]
      const childColor = new THREE.Color().setHSL(childHue / 360, 0.72, 0.70)
      const childEmissive = new THREE.Color().setHSL(childHue / 360, 0.80, 0.38)
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
      mesh.position.copy(child.position)
      sceneRoot.add(mesh)

      const parentTopic = nodeMap.get(child.parentId)
      if (parentTopic) {
        clickables.push({ mesh, topic: parentTopic, focusPoint: mesh.position })
      }

      const label = makeLabelSprite(child.label, viewportPreset.childLabelFont, false)
      label.position.copy(child.position.clone().add(new THREE.Vector3(0, child.radius + 0.42, 0)))
      sceneRoot.add(label)

      const parent = nodeMap.get(child.parentId)
      if (parent) {
        const orbitRadial = child.position.clone().sub(parent.position)
        const orbitRadius = orbitRadial.length()
        const orbitNormal = new THREE.Vector3(0, 1, 0)
        const orbitTangent = orbitNormal.clone().cross(orbitRadial)
        if (orbitTangent.lengthSq() < 0.0001) {
          orbitNormal.set(1, 0, 0)
          orbitTangent.copy(orbitNormal).cross(orbitRadial)
        }
        if (orbitTangent.lengthSq() < 0.0001) {
          orbitTangent.set(0, 0, 1)
        }
        orbitTangent.normalize().multiplyScalar(orbitRadius)

        const geo = new THREE.BufferGeometry().setFromPoints([parent.position, child.position])
        const childLine = new THREE.Line(geo, childLineMaterial)
        childLine.computeLineDistances()
        sceneRoot.add(childLine)
        childVisuals.push({
          mesh,
          label,
          line: childLine,
          parentPosition: parent.position,
          radius: child.radius,
          orbitRadial,
          orbitTangent,
          orbitNormal,
          phaseOffset: Math.random() * Math.PI * 2,
          angularSpeed: randomBetween(
            CHILD_ORBIT_SPEED_RANGE.min,
            CHILD_ORBIT_SPEED_RANGE.max,
          ),
          pulsePhase: Math.random() * Math.PI * 2,
        })
      }
    })

    const linkedPairs = new Set<string>()
    nodes.forEach((node) => {
      node.links?.forEach((targetId) => {
        const target = nodeMap.get(targetId)
        if (!target) return
        const key = [node.id, target.id].sort().join(':')
        if (linkedPairs.has(key)) return
        linkedPairs.add(key)
        const geo = new THREE.BufferGeometry().setFromPoints([node.position, target.position])
        sceneRoot.add(new THREE.Line(geo, linkLineMaterial))
      })
    })

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const currentLookDirection = new THREE.Vector3(0, 0, -1)
    const targetLookDirection = currentLookDirection.clone()
    const lookTargetVector = new THREE.Vector3()
    let pointerDown = { x: 0, y: 0, moved: false }
    let isDragging = false
    let activePointerId: number | null = null
    let isDisposed = false
    let lastHoverTime = 0

    const MIN_FOV = 34
    const MAX_FOV = 92
    let currentFov = viewportPreset.cameraFov
    let yaw = Math.PI
    let pitch = 0
    const activePointers = new Map<number, { x: number; y: number }>()
    let isPinching = false
    let pinchStartDistance = 0
    let pinchFovStart = 0

    function getPinchDistance() {
      const pts = Array.from(activePointers.values())
      const dx = pts[0].x - pts[1].x
      const dy = pts[0].y - pts[1].y
      return Math.sqrt(dx * dx + dy * dy)
    }

    function syncLookDirection() {
      targetLookDirection.set(
        Math.sin(yaw) * Math.cos(pitch),
        Math.sin(pitch),
        Math.cos(yaw) * Math.cos(pitch),
      ).normalize()
    }

    function applyZoom(nextFov: number) {
      currentFov = Math.max(MIN_FOV, Math.min(MAX_FOV, nextFov))
      camera.fov = currentFov
      camera.updateProjectionMatrix()
    }

    function handleWheel(event: WheelEvent) {
      event.preventDefault()
      applyZoom(currentFov + (event.deltaY > 0 ? 1 : -1) * 2.2)
    }

    function updatePointer(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }

    function handlePointerDown(event: PointerEvent) {
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
      hoveredIdRef.current = null

      if (activePointers.size === 2) {
        isDragging = false
        activePointerId = null
        isPinching = true
        pinchStartDistance = getPinchDistance()
        pinchFovStart = currentFov
      } else if (activePointers.size === 1) {
        pointerDown = { x: event.clientX, y: event.clientY, moved: false }
        isDragging = true
        activePointerId = event.pointerId
      }
    }

    function handlePointerMove(event: PointerEvent) {
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

      if (isPinching && activePointers.size >= 2) {
        hoveredIdRef.current = null
        const currentDist = getPinchDistance()
        if (currentDist > 0) {
          applyZoom(pinchFovStart * (currentDist / pinchStartDistance))
        }
        return
      }

      // Hover detection — desktop only, no buttons held, throttled to ~20 fps
      if (event.buttons === 0 && !isDragging) {
        const now = performance.now()
        if (now - lastHoverTime > 50) {
          lastHoverTime = now
          updatePointer(event)
          raycaster.setFromCamera(pointer, camera)
          const hits = raycaster.intersectObjects(
            clickables.map((e) => e.mesh),
            false,
          )
          const hit = hits[0] ? clickables.find((e) => e.mesh === hits[0].object) : null
          hoveredIdRef.current = hit ? hit.topic.id : null
        }
      }

      if (!isDragging || event.pointerId !== activePointerId) return

      const deltaX = event.clientX - pointerDown.x
      const deltaY = event.clientY - pointerDown.y
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) pointerDown.moved = true

      const activePreset = getViewportPreset(mount?.clientWidth ?? window.innerWidth)
      yaw -= deltaX * activePreset.dragX
      pitch = Math.max(-1.45, Math.min(1.45, pitch - deltaY * activePreset.dragY))
      syncLookDirection()
      pointerDown.x = event.clientX
      pointerDown.y = event.clientY
    }

    function handlePointerUp(event: PointerEvent) {
      activePointers.delete(event.pointerId)

      if (isPinching) {
        if (activePointers.size < 2) {
          isPinching = false
          isDragging = false
          activePointerId = null
        }
        return
      }

      if (activePointerId === null || event.pointerId !== activePointerId) return

      if (!pointerDown.moved) {
        updatePointer(event)
        raycaster.setFromCamera(pointer, camera)
        const intersects = raycaster.intersectObjects(
          clickables.map((entry) => entry.mesh),
          false,
        )

        if (intersects[0]) {
          const hit = clickables.find((entry) => entry.mesh === intersects[0].object)
          if (hit) {
            hasInteractedRef.current = true
            setShowHint(false)
            selectedIdRef.current = hit.topic.id
            targetLookDirection.copy(hit.focusPoint.clone().normalize())
            pitch = Math.asin(targetLookDirection.y)
            yaw = Math.atan2(targetLookDirection.x, targetLookDirection.z)
            setModalTopicId(null)
            if (focusTimeoutRef.current !== null) clearTimeout(focusTimeoutRef.current)
            focusTimeoutRef.current = window.setTimeout(() => {
              if (!isDisposed) setModalTopicId(hit.topic.id)
            }, 620)
          }
        } else {
          selectedIdRef.current = null
          setModalTopicId(null)
        }
      }

      isDragging = false
      activePointerId = null
    }

    renderer.domElement.addEventListener('pointerdown', handlePointerDown)
    renderer.domElement.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false })

    function handleResize() {
      if (!mount) return
      const activePreset = getViewportPreset(mount.clientWidth)
      camera.aspect = mount.clientWidth / mount.clientHeight
      currentFov = Math.max(MIN_FOV, Math.min(MAX_FOV, activePreset.cameraFov))
      camera.fov = currentFov
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    const clock = new THREE.Clock()
    syncLookDirection()

    function animate() {
      const elapsed = clock.getElapsedTime()

      starLayers.forEach((layer, index) => {
        layer.mesh.rotation.y += 0.00005 + index * 0.000015
        layer.mesh.rotation.x = Math.sin(elapsed * (0.035 + index * 0.01)) * 0.03
      })
      networkLayers.forEach((layer, index) => {
        layer.mesh.rotation.y += 0.00022 + index * 0.00005
        layer.mesh.rotation.x = Math.sin(elapsed * (0.055 + index * 0.016)) * 0.012
      })
      accentOrbs.forEach((orb, index) => {
        orb.mesh.rotation.y += 0.0003 + index * 0.000008
        orb.mesh.position.y += Math.sin(elapsed * (0.22 + index * 0.013)) * 0.0025
      })

      orbitalRings.forEach((ring) => {
        ring.mesh.rotateOnAxis(ring.rotAxis, ring.rotSpeed)
      })

      // ── Node visual update: brightness + pulse + selected + hover ──
      childVisuals.forEach((child) => {
        const orbitAngle = elapsed * child.angularSpeed + child.phaseOffset
        const orbitPosition = child.parentPosition
          .clone()
          .addScaledVector(child.orbitRadial, Math.cos(orbitAngle))
          .addScaledVector(child.orbitTangent, Math.sin(orbitAngle))
        const pulse = 1 + Math.sin(elapsed * 1.4 + child.pulsePhase) * 0.06

        child.mesh.position.copy(orbitPosition)
        child.mesh.scale.setScalar(pulse)
        child.label.position.set(
          orbitPosition.x,
          orbitPosition.y + child.radius * pulse + 0.42,
          orbitPosition.z,
        )
        child.line.geometry.setFromPoints([child.parentPosition, child.mesh.position])
        child.line.computeLineDistances()
      })

      nodeVisuals.forEach((visual, id) => {
        const isSelected = selectedIdRef.current === id
        const isHovered = hoveredIdRef.current === id
        const breathe = 1 + Math.sin(elapsed * 0.9 + visual.pulsePhaseOffset) * 0.06

        visual.mesh.scale.setScalar(breathe)

        if (isSelected) {
          if (!visual.isSelectedColor) {
            visual.glowMat.color.set(SELECTED_GLOW_COLOR)
            visual.isSelectedColor = true
          }
          visual.glowMat.opacity = 0.85
          const ss = visual.glowBaseScale * 1.5 * breathe
          visual.glow.scale.set(ss, ss, 1)
        } else {
          if (visual.isSelectedColor) {
            visual.glowMat.color.copy(visual.baseGlowColor)
            visual.isSelectedColor = false
          }
          const baseOpacity = trafficToGlowOpacity(visual.score)
          const { opacity, scale } = computePulse(
            elapsed,
            visual.momentum,
            baseOpacity,
            visual.pulsePhaseOffset,
          )
          visual.glowMat.opacity = Math.min(1.0, opacity + (isHovered ? 0.08 : 0))
          const sf = (isHovered ? scale * 1.1 : scale) * breathe * visual.glowBaseScale
          visual.glow.scale.set(sf, sf, 1)
        }
      })

      // Cursor feedback
      renderer.domElement.style.cursor = hoveredIdRef.current ? 'pointer' : 'default'

      ;(
        childLineMaterial as THREE.LineDashedMaterial & { dashOffset: number }
      ).dashOffset -= 0.012

      lookTargetVector
        .copy(currentLookDirection.lerp(targetLookDirection, 0.05))
        .multiplyScalar(100)
      camera.lookAt(lookTargetVector)
      renderer.render(scene, camera)
    }

    renderer.setAnimationLoop(animate)

    return () => {
      isDisposed = true
      if (focusTimeoutRef.current !== null) {
        clearTimeout(focusTimeoutRef.current)
        focusTimeoutRef.current = null
      }
      renderer.setAnimationLoop(null)
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown)
      renderer.domElement.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      renderer.domElement.removeEventListener('wheel', handleWheel)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      starLayers.forEach((l) => { l.geometry.dispose(); l.material.dispose() })
      networkLayers.forEach((l) => { l.geometry.dispose(); l.material.dispose() })
      accentOrbs.forEach((o) => { o.geometry.dispose(); o.material.dispose() })
      orbitalRings.forEach((r) => { r.geo.dispose(); r.mat.dispose() })
      linkLineMaterial.dispose()
      childLineMaterial.dispose()
      prevPositionsRef.current = new Map(
        nodes.map((node) => [node.id, node.position.clone()]),
      )
      mount.innerHTML = ''
    }
  }, [topics])

  const modalTopic = modalTopicId ? topicMap.get(modalTopicId) ?? null : null
  const trafficPercent = modalTopic
    ? Math.round((modalTopic.buzz / maxBuzz) * 100)
    : 0
  const hudStatus = isRefreshing ? 'loading' : status

  return (
    <main className="space-shell">
      <div className="space-noise" />
      <div className="cyber-grid" />

      {/* ── HUD ────────────────────────────────────── */}
      <div className="space-hud">
        <span className={`source-pill is-${hudStatus}`}>
          <span className="status-dot" />
          {hudStatus === 'live'
            ? 'NAVER LIVE'
            : hudStatus === 'loading'
              ? 'SYNCING...'
              : 'OFFLINE'}
        </span>
        <div className="hud-right">
          {lastSyncAt && !isRefreshing && (
            <span className="hud-sync-text">
              {formatTimeAgo(lastSyncAt)}&nbsp;·&nbsp;{formatCountdown(refreshCountdown)}
            </span>
          )}
          <button
            className={`hud-refresh-btn${isRefreshing ? ' is-spinning' : ''}`}
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            aria-label="Refresh trends"
          >
            ↻
          </button>
        </div>
      </div>

      {/* ── Fallback banner ────────────────────────── */}
      {status === 'fallback' && !isRefreshing && (
        <div className="fallback-banner" role="status">
          DEMO DATA&nbsp;·&nbsp;NOT LIVE&nbsp;·&nbsp;API UNAVAILABLE
        </div>
      )}

      {/* ── 3D scene ───────────────────────────────── */}
      <section className="scene-viewport">
        <div className="scene-mount" ref={mountRef} />
      </section>

      {/* ── Onboarding hint ────────────────────────── */}
      {showHint && (
        <button
          type="button"
          className="onboarding-hint"
          onClick={dismissHint}
          aria-label="Dismiss hint"
        >
          <span className="hint-pulse" />
          TAP A NODE TO EXPLORE
          <span className="hint-pulse" />
        </button>
      )}

      {/* ── Modal backdrop ─────────────────────────── */}
      <div
        className={`modal-backdrop${modalTopic ? '' : ' hidden'}`}
        onClick={closeModalKeepOrbitView}
      />

      {/* ── Topic modal ─────────────────────────────── */}
      <section
        className={`topic-modal${modalTopic ? '' : ' hidden'}`}
        aria-hidden={!modalTopic}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {modalTopic ? (
          <>
            {/* Mobile swipe-down handle */}
            <div
              className="modal-handle-bar"
              role="button"
              tabIndex={0}
              aria-label="Close"
              onClick={closeModalKeepOrbitView}
              onKeyDown={(e) => e.key === 'Enter' && closeModalKeepOrbitView()}
            />

            <div className="modal-header">
              <p className="modal-kicker">
                {modalTopic.category}&nbsp;·&nbsp;{modalTopic.sourceLabel}
              </p>
              <button
                className="modal-close"
                type="button"
                onClick={closeModalKeepOrbitView}
              >
                ✕&nbsp;CLOSE
              </button>
            </div>

            <h2>{modalTopic.label}</h2>
            <p className="modal-summary">{modalTopic.summary}</p>

            <div className="modal-meta">
              <div className="modal-traffic-row">
                <span className="modal-buzz-label">{formatBuzz(modalTopic.buzz)}</span>
                <div
                  className="modal-traffic-bar"
                  title={`${trafficPercent}% of peak activity`}
                  aria-label={`${trafficPercent}% of peak`}
                >
                  <div
                    className="modal-traffic-fill"
                    style={{ width: `${trafficPercent}%` }}
                  />
                </div>
                <span className="modal-traffic-pct">{trafficPercent}%</span>
              </div>
              <span className="modal-time">{formatClock(modalTopic.collectedAt)}</span>
            </div>

            <div className="keyword-row">
              {modalTopic.keywords.map((kw) => (
                <span key={kw}>{kw}</span>
              ))}
            </div>

            <div className="modal-reasons">
              {modalTopic.issueReason.map((reason) => (
                <p key={reason}>{reason}</p>
              ))}
            </div>

            {modalTopic.evidence?.length ? (
              <div className="evidence-list">
                {modalTopic.evidence.map((item) => (
                  <a
                    key={`${item.source}-${item.link}-${item.title}`}
                    className="evidence-card"
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="evidence-card-meta">
                      <span className="evidence-source">
                        {formatEvidenceSource(item.source)}
                      </span>
                      {item.publishedAt && (
                        <time className="evidence-date" dateTime={item.publishedAt}>
                          {formatClock(item.publishedAt)}
                        </time>
                      )}
                    </div>
                    <strong>{item.title}</strong>
                    <p>{item.snippet}</p>
                  </a>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </section>
    </main>
  )
}

export default App
