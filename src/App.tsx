import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import './App.css'
import { buildFallbackTrends, type TrendTopic } from './data/trendItems'

type TopicNode = TrendTopic & {
  position: THREE.Vector3
  radius: number
}

type ChildNode = {
  id: string
  label: string
  parentId: string
  position: THREE.Vector3
  radius: number
}

type ClickableNode = {
  mesh: THREE.Mesh
  topic: TrendTopic
  focusPoint: THREE.Vector3
}

type OrbitalRing = {
  mesh: THREE.Mesh
  geo: THREE.TorusGeometry
  mat: THREE.MeshBasicMaterial
  rotAxis: THREE.Vector3
  rotSpeed: number
}

const orbitRadii = [11, 16, 22]

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

function makeLabelSprite(text: string, fontSize: number, isMain = false) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const fontFamily =
    '"Mona12", "HSJiphyeongseon", "HS 지평선", "HS지평선체", "SUIT Variable", "Pretendard Variable", sans-serif'

  if (!context) {
    return new THREE.Sprite()
  }

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
    // Outer neon glow
    context.shadowColor = '#00e5ff'
    context.shadowBlur = 18
    context.fillStyle = 'rgba(0, 200, 255, 0.22)'
    context.fillText(text, width / 2, height / 2)
    // Bright inner text
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

function buildTopicNodes(topics: TrendTopic[]) {
  return topics.map((topic, index) => {
    const radius = orbitRadii[topic.orbit]
    const angle = topic.angle + index * 0.12
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    const y = Math.sin(angle * 1.4) * 5.6 + (topic.orbit - 1) * 2

    return {
      ...topic,
      position: new THREE.Vector3(x, y, z),
      radius: Math.max(1.15, Math.min(2.55, 0.95 + topic.trafficScore * 0.018)),
    }
  })
}

function buildChildNodes(nodes: TopicNode[]) {
  const children: ChildNode[] = []

  nodes.forEach((node) => {
    const related = node.relatedTopics ?? []

    related.forEach((label, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(related.length, 1)
      const ringRadius = node.radius + 1.6
      const position = new THREE.Vector3(
        node.position.x + Math.cos(angle) * ringRadius,
        node.position.y + Math.sin(angle * 1.3) * 1.2,
        node.position.z + Math.sin(angle) * ringRadius,
      )

      children.push({
        id: `${node.id}-${label}`,
        label,
        parentId: node.id,
        position,
        radius: 0.34,
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
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true
    }

    return { mesh, geometry, material }
  })
}

function createAccentOrb() {
  const typeRoll = Math.random()
  let hue: number
  let sat: number
  let lit: number

  if (typeRoll > 0.62) {
    hue = 185 + Math.random() * 28
    sat = 0.78 + Math.random() * 0.22
    lit = 0.48 + Math.random() * 0.24
  } else if (typeRoll > 0.28) {
    hue = 215 + Math.random() * 40
    sat = 0.62 + Math.random() * 0.32
    lit = 0.42 + Math.random() * 0.3
  } else {
    hue = 265 + Math.random() * 50
    sat = 0.68 + Math.random() * 0.32
    lit = 0.38 + Math.random() * 0.28
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

  const distance = 28 + Math.random() * 132
  const angle = Math.random() * Math.PI * 2
  const tilt = (Math.random() - 0.5) * 0.32
  mesh.position.set(
    Math.cos(angle) * distance,
    (Math.random() - 0.5) * 42,
    Math.sin(angle + tilt) * distance * (0.42 + Math.random() * 0.48),
  )

  const scale = 0.8 + Math.random() * 1.6
  mesh.scale.setScalar(scale)

  return { mesh, geometry, material }
}

function App() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [topics, setTopics] = useState<TrendTopic[]>(() => buildFallbackTrends())
  const [status, setStatus] = useState<'loading' | 'live' | 'fallback'>('loading')
  const [modalTopicId, setModalTopicId] = useState<string | null>(null)
  const selectedIdRef = useRef<string | null>(null)
  const focusTimeoutRef = useRef<number | null>(null)
  const cameraTargetRef = useRef<THREE.Vector3 | null>(null)
  const lookTargetRef = useRef<THREE.Vector3 | null>(null)
  const centeredLookAtRef = useRef(new THREE.Vector3(0, 0, 0))

  useEffect(() => {
    let ignore = false

    async function loadTopics() {
      try {
        const response = await fetch('/api/trends')
        if (!response.ok) {
          throw new Error(`Failed to load topics: ${response.status}`)
        }

        const data = (await response.json()) as {
          mode?: 'live' | 'fallback'
          topics?: TrendTopic[]
        }

        if (!ignore && data.topics?.length) {
          setTopics(data.topics)
          setStatus(data.mode === 'live' ? 'live' : 'fallback')
        }
      } catch {
        if (!ignore) {
          setTopics(buildFallbackTrends())
          setStatus('fallback')
        }
      }
    }

    void loadTopics()

    return () => {
      ignore = true
      if (focusTimeoutRef.current !== null) {
        window.clearTimeout(focusTimeoutRef.current)
        focusTimeoutRef.current = null
      }
    }
  }, [])

  const topicMap = useMemo(() => new Map(topics.map((topic) => [topic.id, topic])), [topics])

  function closeModalKeepOrbitView() {
    selectedIdRef.current = null
    setModalTopicId(null)

    if (focusTimeoutRef.current !== null) {
      window.clearTimeout(focusTimeoutRef.current)
      focusTimeoutRef.current = null
    }

    if (lookTargetRef.current) {
      lookTargetRef.current.copy(centeredLookAtRef.current)
    }
  }

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) {
      return
    }

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2('#000208', 0.022)
    const viewportPreset = getViewportPreset(mount.clientWidth)

    const camera = new THREE.PerspectiveCamera(
      viewportPreset.cameraFov,
      mount.clientWidth / mount.clientHeight,
      0.1,
      200,
    )
    camera.position.set(0, 0, viewportPreset.cameraDistance)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.innerHTML = ''
    mount.appendChild(renderer.domElement)

    const sceneRoot = new THREE.Group()
    sceneRoot.scale.setScalar(viewportPreset.sceneScale)
    scene.add(sceneRoot)

    const fieldGroup = new THREE.Group()
    sceneRoot.add(fieldGroup)

    // Cyberpunk neon lighting
    const ambientLight = new THREE.AmbientLight('#091828', 2.6)
    const keyLight = new THREE.PointLight('#00d4ff', 52, 155, 2)
    keyLight.position.set(0, 0, 0)
    const rimLight = new THREE.PointLight('#6600cc', 14, 90, 2)
    rimLight.position.set(-18, 10, 16)
    const accentLight = new THREE.PointLight('#0033ff', 8, 70, 2)
    accentLight.position.set(8, -4, 10)
    scene.add(ambientLight, keyLight, rimLight, accentLight)

    // Data node particles (background field)
    const starLayers = createInstancedSphereLayers(
      [26, 44, 20],
      0.14,
      (helper) => {
        helper.position.set(
          (Math.random() - 0.5) * 460,
          (Math.random() - 0.5) * 280,
          (Math.random() - 0.5) * 460,
        )
        const scale = 0.45 + Math.random() * 2.6
        helper.scale.setScalar(scale)
      },
      () =>
        new THREE.Color(
          Math.random() > 0.55 ? '#00e5ff' : Math.random() > 0.35 ? '#4da6ff' : '#e0f0ff',
        ),
      [0.14, 0.42, 0.88],
    )
    starLayers.forEach((layer) => sceneRoot.add(layer.mesh))

    // Network field particles (spherical distribution)
    const networkLayers = createInstancedSphereLayers(
      [70, 110, 56],
      0.18,
      (helper) => {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const r = 14 + Math.pow(Math.random(), 0.72) * 95
        helper.position.set(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi) * 0.35,
          r * Math.sin(phi) * Math.sin(theta),
        )
        const scale = 0.5 + Math.random() * 2.4
        helper.scale.setScalar(scale)
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

    // Electric core
    const coreGlow = new THREE.Mesh(
      new THREE.SphereGeometry(2.4, 32, 32),
      new THREE.MeshBasicMaterial({
        color: '#00c8ff',
        transparent: true,
        opacity: 0.07,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    fieldGroup.add(coreGlow)

    // Animated laser connection line materials (shared, dashes animate in animate())
    const linkLineMaterial = new THREE.LineDashedMaterial({
      color: '#00e5ff',
      transparent: true,
      opacity: 0.34,
      dashSize: 0.7,
      gapSize: 2.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const childLineMaterial = new THREE.LineDashedMaterial({
      color: '#0096c7',
      transparent: true,
      opacity: 0.2,
      dashSize: 0.32,
      gapSize: 1.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const nodes = buildTopicNodes(topics)
    const childNodes = buildChildNodes(nodes)
    const nodeMap = new Map(nodes.map((node) => [node.id, node]))
    const clickables: ClickableNode[] = []
    const orbitalRings: OrbitalRing[] = []

    nodes.forEach((node) => {
      const geometry = new THREE.SphereGeometry(node.radius, 48, 48)
      const nodeColor = new THREE.Color(node.color).lerp(new THREE.Color('#00c8ff'), 0.52)
      const material = new THREE.MeshPhysicalMaterial({
        color: nodeColor,
        transparent: true,
        opacity: 0.28,
        transmission: 0.94,
        roughness: 0.04,
        thickness: 1.5,
        ior: 1.2,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.copy(node.position)
      sceneRoot.add(mesh)
      clickables.push({ mesh, topic: node, focusPoint: node.position.clone() })

      // Neon additive glow halo
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(node.radius * 1.22, 32, 32),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(node.color).lerp(new THREE.Color('#00e5ff'), 0.75),
          transparent: true,
          opacity: 0.07,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      )
      glow.position.copy(node.position)
      sceneRoot.add(glow)

      // Atomic orbital rings
      const ringDefs = [
        { rm: 1.55, col: '#00e5ff', op: 0.42, spd: 0.007 + Math.random() * 0.009 },
        { rm: 1.96, col: '#7b2ff7', op: 0.28, spd: -(0.005 + Math.random() * 0.007) },
      ]

      ringDefs.forEach((def, ri) => {
        const geo = new THREE.TorusGeometry(node.radius * def.rm, 0.022, 8, 56)
        const mat = new THREE.MeshBasicMaterial({
          color: def.col,
          transparent: true,
          opacity: def.op,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
        const ring = new THREE.Mesh(geo, mat)
        ring.position.copy(node.position)
        ring.rotation.set(
          Math.PI / 4 + ri * (Math.PI / 5),
          Math.random() * Math.PI,
          ri * (Math.PI / 6),
        )
        sceneRoot.add(ring)
        orbitalRings.push({
          mesh: ring,
          geo,
          mat,
          rotAxis: new THREE.Vector3(0.1 * (ri === 0 ? 1 : -1), 1, 0.2).normalize(),
          rotSpeed: def.spd,
        })
      })

      const label = makeLabelSprite(node.label, viewportPreset.mainLabelFont, true)
      label.position.copy(node.position.clone().add(new THREE.Vector3(0, node.radius + 1.15, 0)))
      sceneRoot.add(label)
    })

    childNodes.forEach((child) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(child.radius, 24, 24),
        new THREE.MeshPhysicalMaterial({
          color: '#48cae4',
          transparent: true,
          opacity: 0.38,
          transmission: 0.88,
          roughness: 0.06,
          thickness: 0.7,
          ior: 1.15,
          metalness: 0,
          clearcoat: 0.85,
        }),
      )
      mesh.position.copy(child.position)
      sceneRoot.add(mesh)

      const parentTopic = nodeMap.get(child.parentId)
      if (parentTopic) {
        clickables.push({
          mesh,
          topic: parentTopic,
          focusPoint: child.position.clone(),
        })
      }

      const label = makeLabelSprite(child.label, viewportPreset.childLabelFont, false)
      label.position.copy(child.position.clone().add(new THREE.Vector3(0, child.radius + 0.42, 0)))
      sceneRoot.add(label)

      const parent = nodeMap.get(child.parentId)
      if (parent) {
        const geo = new THREE.BufferGeometry().setFromPoints([parent.position, child.position])
        const childLine = new THREE.Line(geo, childLineMaterial)
        childLine.computeLineDistances()
        sceneRoot.add(childLine)
      }
    })

    const linkedPairs = new Set<string>()
    nodes.forEach((node) => {
      node.links?.forEach((targetId) => {
        const target = nodeMap.get(targetId)
        if (!target) {
          return
        }

        const key = [node.id, target.id].sort().join(':')
        if (linkedPairs.has(key)) {
          return
        }

        linkedPairs.add(key)
        const geo = new THREE.BufferGeometry().setFromPoints([node.position, target.position])
        const linkLine = new THREE.Line(geo, linkLineMaterial)
        linkLine.computeLineDistances()
        sceneRoot.add(linkLine)
      })
    })

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const defaultCameraPosition = new THREE.Vector3(0, 0, viewportPreset.cameraDistance)
    const defaultLookAt = new THREE.Vector3(0, 0, 0)
    const cameraTarget = defaultCameraPosition.clone()
    const lookTarget = defaultLookAt.clone()
    const currentLookAt = defaultLookAt.clone()
    cameraTargetRef.current = cameraTarget
    lookTargetRef.current = lookTarget
    let pointerDown = { x: 0, y: 0, moved: false }
    let isDragging = false
    let activePointerId: number | null = null
    let isDisposed = false

    // Zoom state
    const MIN_ZOOM = 10
    const MAX_ZOOM = 80
    let zoomDistance = viewportPreset.cameraDistance
    const activePointers = new Map<number, { x: number; y: number }>()
    let isPinching = false
    let pinchStartDistance = 0
    let pinchZoomStart = 0

    function getPinchDistance() {
      const pts = Array.from(activePointers.values())
      const dx = pts[0].x - pts[1].x
      const dy = pts[0].y - pts[1].y
      return Math.sqrt(dx * dx + dy * dy)
    }

    function applyZoom(newDistance: number) {
      zoomDistance = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newDistance))
      defaultCameraPosition.set(0, 0, zoomDistance)
      if (!selectedIdRef.current) {
        cameraTarget.copy(defaultCameraPosition)
      }
    }

    function handleWheel(event: WheelEvent) {
      event.preventDefault()
      const delta = event.deltaY > 0 ? 1 : -1
      applyZoom(zoomDistance + delta * 2.2)
    }

    function updatePointer(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }

    function handlePointerDown(event: PointerEvent) {
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

      if (activePointers.size === 2) {
        // Two fingers on screen — start pinch zoom
        isDragging = false
        activePointerId = null
        isPinching = true
        pinchStartDistance = getPinchDistance()
        pinchZoomStart = zoomDistance
      } else if (activePointers.size === 1) {
        // Single pointer — start drag / click
        pointerDown = { x: event.clientX, y: event.clientY, moved: false }
        isDragging = true
        activePointerId = event.pointerId
      }
    }

    function handlePointerMove(event: PointerEvent) {
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

      if (isPinching && activePointers.size >= 2) {
        const currentDist = getPinchDistance()
        if (currentDist > 0) {
          applyZoom(pinchZoomStart * (pinchStartDistance / currentDist))
        }
        return
      }

      if (!isDragging || event.pointerId !== activePointerId) {
        return
      }

      const deltaX = event.clientX - pointerDown.x
      const deltaY = event.clientY - pointerDown.y
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        pointerDown.moved = true
      }

      const activePreset = getViewportPreset(mount?.clientWidth ?? window.innerWidth)
      sceneRoot.rotation.y += deltaX * activePreset.dragX
      sceneRoot.rotation.x += deltaY * activePreset.dragY
      sceneRoot.rotation.x = Math.max(-0.5, Math.min(0.5, sceneRoot.rotation.x))
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

      if (activePointerId === null || event.pointerId !== activePointerId) {
        return
      }

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
            selectedIdRef.current = hit.topic.id
            const activePreset = getViewportPreset(mount?.clientWidth ?? window.innerWidth)
            const focusDirection = hit.focusPoint.clone().normalize().multiplyScalar(activePreset.focusDistance)
            cameraTarget.copy(hit.focusPoint.clone().add(focusDirection))
            lookTarget.copy(hit.focusPoint)
            setModalTopicId(null)
            if (focusTimeoutRef.current !== null) {
              window.clearTimeout(focusTimeoutRef.current)
            }
            focusTimeoutRef.current = window.setTimeout(() => {
              if (!isDisposed) {
                setModalTopicId(hit.topic.id)
              }
            }, 620)
          }
        } else {
          selectedIdRef.current = null
          cameraTarget.copy(defaultCameraPosition)
          lookTarget.copy(defaultLookAt)
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
      if (!mount) {
        return
      }
      const activePreset = getViewportPreset(mount.clientWidth)
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.fov = activePreset.cameraFov
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
      sceneRoot.scale.setScalar(activePreset.sceneScale)
      // Rebase zoom around new preset distance, preserving relative offset
      const zoomOffset = zoomDistance - viewportPreset.cameraDistance
      zoomDistance = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, activePreset.cameraDistance + zoomOffset))
      defaultCameraPosition.set(0, 0, zoomDistance)
      if (!selectedIdRef.current) {
        cameraTarget.copy(defaultCameraPosition)
      }
    }

    window.addEventListener('resize', handleResize)

    const clock = new THREE.Clock()

    function animate() {
      const elapsed = clock.getElapsedTime()
      if (!isDragging && !selectedIdRef.current) {
        sceneRoot.rotation.y += 0.00055
      }

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

      // Rotate atomic orbital rings
      orbitalRings.forEach((ring) => {
        ring.mesh.rotateOnAxis(ring.rotAxis, ring.rotSpeed)
      })

      // Animate laser data flow along connection lines
      ;(linkLineMaterial as THREE.LineDashedMaterial & { dashOffset: number }).dashOffset -= 0.018
      ;(childLineMaterial as THREE.LineDashedMaterial & { dashOffset: number }).dashOffset -= 0.012

      coreGlow.scale.setScalar(1 + Math.sin(elapsed * 1.2) * 0.04)

      camera.position.lerp(cameraTarget, 0.045)
      currentLookAt.lerp(lookTarget, 0.05)
      camera.lookAt(currentLookAt)
      renderer.render(scene, camera)
    }

    renderer.setAnimationLoop(animate)

    return () => {
      isDisposed = true
      if (focusTimeoutRef.current !== null) {
        window.clearTimeout(focusTimeoutRef.current)
        focusTimeoutRef.current = null
      }
      renderer.setAnimationLoop(null)
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown)
      renderer.domElement.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      renderer.domElement.removeEventListener('wheel', handleWheel)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      starLayers.forEach((layer) => {
        layer.geometry.dispose()
        layer.material.dispose()
      })
      networkLayers.forEach((layer) => {
        layer.geometry.dispose()
        layer.material.dispose()
      })
      accentOrbs.forEach((orb) => {
        orb.geometry.dispose()
        orb.material.dispose()
      })
      orbitalRings.forEach((ring) => {
        ring.geo.dispose()
        ring.mat.dispose()
      })
      linkLineMaterial.dispose()
      childLineMaterial.dispose()
      cameraTargetRef.current = null
      lookTargetRef.current = null
      mount.innerHTML = ''
    }
  }, [topics])

  const modalTopic = modalTopicId ? topicMap.get(modalTopicId) ?? null : null

  return (
    <main className="space-shell">
      <div className="space-noise"></div>
      <div className="cyber-grid"></div>
      <div className="space-hud">
        <span className={`source-pill is-${status}`}>
          <span className="status-dot"></span>
          {status === 'live' ? 'NAVER LIVE' : status === 'loading' ? 'SYNCING...' : 'DEMO // OFFLINE'}
        </span>
        <span className="source-pill ghost">KR NEURAL SIGNAL</span>
      </div>

      <section className="scene-viewport">
        <div className="scene-mount" ref={mountRef}></div>
      </section>

      <div
        className={`modal-backdrop ${modalTopic ? '' : 'hidden'}`}
        onClick={closeModalKeepOrbitView}
      />
      <section
        className={`topic-modal ${modalTopic ? '' : 'hidden'}`}
        aria-hidden={!modalTopic}
        onPointerDown={(event) => event.stopPropagation()}
        onPointerUp={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        {modalTopic ? (
          <>
            <button
              className="modal-close"
              type="button"
              onClick={closeModalKeepOrbitView}
            >
              CLOSE
            </button>
            <p className="modal-kicker">{modalTopic.category} · {modalTopic.sourceLabel}</p>
            <h2>{modalTopic.label}</h2>
            <p className="modal-summary">{modalTopic.summary}</p>
            <div className="modal-meta">
              <span>{formatBuzz(modalTopic.buzz)}</span>
              <span>{formatClock(modalTopic.collectedAt)}</span>
            </div>
            <div className="keyword-row">
              {modalTopic.keywords.map((keyword) => (
                <span key={keyword}>{keyword}</span>
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
                    <span className="evidence-source">{formatEvidenceSource(item.source)}</span>
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
