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

function makeLabelSprite(text: string, fontSize: number) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const fontFamily = '"HSJiphyeongseon", "HS 지평선", "HS지평선체", "SUIT Variable", "Pretendard Variable", sans-serif'

  if (!context) {
    return new THREE.Sprite()
  }

  context.font = `${fontSize}px ${fontFamily}`
  const width = Math.ceil(context.measureText(text).width + 28)
  const height = Math.ceil(fontSize + 22)
  canvas.width = width
  canvas.height = height

  context.clearRect(0, 0, width, height)
  context.font = `${fontSize}px ${fontFamily}`
  context.fillStyle = 'rgba(240,244,250,0.9)'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, width / 2, height / 2)

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
  const isWarm = Math.random() > 0.35
  const hue = isWarm ? 28 + Math.random() * 14 : 210 + Math.random() * 18
  const saturation = isWarm ? 0.48 + Math.random() * 0.34 : 0.04 + Math.random() * 0.14
  const lightness = isWarm ? 0.72 + Math.random() * 0.18 : 0.84 + Math.random() * 0.12
  const color = new THREE.Color().setHSL(hue / 360, saturation, Math.min(lightness, 0.97))

  const radius = isWarm ? 0.42 + Math.random() * 1.36 : 0.24 + Math.random() * 1.02
  const geometry = new THREE.SphereGeometry(radius, 18, 18)
  const material = new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity: isWarm ? 0.34 + Math.random() * 0.4 : 0.12 + Math.random() * 0.36,
    transmission: 0.85 + Math.random() * 0.12,
    roughness: 0.06 + Math.random() * 0.18,
    thickness: 0.4 + Math.random() * 1.6,
    ior: 1.1 + Math.random() * 0.1,
    metalness: 0,
    clearcoat: 0.6 + Math.random() * 0.4,
    clearcoatRoughness: 0.04 + Math.random() * 0.18,
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
    scene.fog = new THREE.FogExp2('#03060d', 0.028)
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

    const galaxyGroup = new THREE.Group()
    sceneRoot.add(galaxyGroup)

    const ambientLight = new THREE.AmbientLight('#f1f4ff', 1.7)
    const keyLight = new THREE.PointLight('#e8f1ff', 36, 140, 2)
    keyLight.position.set(0, 0, 0)
    const rimLight = new THREE.PointLight('#d8dce6', 16, 90, 2)
    rimLight.position.set(-18, 10, 16)
    const warmLight = new THREE.PointLight('#ffb36b', 9, 80, 2)
    warmLight.position.set(8, -4, 10)
    scene.add(ambientLight, keyLight, rimLight, warmLight)

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
          Math.random() > 0.58 ? '#ffab57' : Math.random() > 0.28 ? '#dbe3ff' : '#ffffff',
        ),
      [0.12, 0.38, 0.88],
    )
    starLayers.forEach((layer) => sceneRoot.add(layer.mesh))

    const galaxyLayers = createInstancedSphereLayers(
      [70, 110, 56],
      0.18,
      (helper) => {
        const armAngle = Math.random() * Math.PI * 2
        const radius = Math.pow(Math.random(), 0.86) * 108
        const spiral = armAngle + radius * 0.1
        const spread = (Math.random() - 0.5) * 8.4

        helper.position.set(
          Math.cos(spiral) * radius + spread,
          (Math.random() - 0.5) * 1.8,
          Math.sin(spiral) * radius * 0.14 + spread * 0.92,
        )
        const scale = 0.6 + Math.random() * 2.8
        helper.scale.setScalar(scale)
      },
      () =>
        new THREE.Color(
          Math.random() > 0.52 ? '#ffa24c' : Math.random() > 0.24 ? '#d7ddff' : '#ffffff',
        ),
      [0.08, 0.22, 0.5],
    )
    galaxyLayers.forEach((layer) => galaxyGroup.add(layer.mesh))

    const accentOrbs = Array.from({ length: 26 }, () => createAccentOrb())
    accentOrbs.forEach((orb) => sceneRoot.add(orb.mesh))

    const coreGlow = new THREE.Mesh(
      new THREE.SphereGeometry(2.4, 32, 32),
      new THREE.MeshBasicMaterial({
        color: '#fff3da',
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
      }),
    )
    galaxyGroup.add(coreGlow)

    const nodes = buildTopicNodes(topics)
    const childNodes = buildChildNodes(nodes)
    const nodeMap = new Map(nodes.map((node) => [node.id, node]))
    const clickables: ClickableNode[] = []

    nodes.forEach((node) => {
      const geometry = new THREE.SphereGeometry(node.radius, 48, 48)
      const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(node.color),
        transparent: true,
        opacity: 0.38,
        transmission: 0.96,
        roughness: 0.08,
        thickness: 1.6,
        ior: 1.16,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.copy(node.position)
      sceneRoot.add(mesh)
      clickables.push({ mesh, topic: node, focusPoint: node.position.clone() })

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(node.radius * 1.18, 32, 32),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(node.color),
          transparent: true,
          opacity: 0.06,
          depthWrite: false,
        }),
      )
      glow.position.copy(node.position)
      sceneRoot.add(glow)

      const label = makeLabelSprite(node.label, viewportPreset.mainLabelFont)
      label.position.copy(node.position.clone().add(new THREE.Vector3(0, node.radius + 1.15, 0)))
      sceneRoot.add(label)
    })

    childNodes.forEach((child) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(child.radius, 24, 24),
        new THREE.MeshPhysicalMaterial({
          color: '#d6dde8',
          transparent: true,
          opacity: 0.3,
          transmission: 0.9,
          roughness: 0.12,
          thickness: 0.8,
          ior: 1.14,
          metalness: 0,
          clearcoat: 0.8,
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

      const label = makeLabelSprite(child.label, viewportPreset.childLabelFont)
      label.position.copy(child.position.clone().add(new THREE.Vector3(0, child.radius + 0.42, 0)))
      sceneRoot.add(label)

      const parent = nodeMap.get(child.parentId)
      if (parent) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          parent.position,
          child.position,
        ])
        const line = new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            color: '#dce3ec',
            transparent: true,
            opacity: 0.18,
          }),
        )
        sceneRoot.add(line)
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
        const geometry = new THREE.BufferGeometry().setFromPoints([
          node.position,
          target.position,
        ])
        const line = new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            color: '#edf1f5',
            transparent: true,
            opacity: 0.24,
          }),
        )
        sceneRoot.add(line)
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
    let isDisposed = false

    function updatePointer(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }

    function handlePointerDown(event: PointerEvent) {
      pointerDown = { x: event.clientX, y: event.clientY, moved: false }
      isDragging = true
    }

    function handlePointerMove(event: PointerEvent) {
      if (!isDragging) {
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
    }

    renderer.domElement.addEventListener('pointerdown', handlePointerDown)
    renderer.domElement.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

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
      defaultCameraPosition.set(0, 0, activePreset.cameraDistance)
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
      galaxyLayers.forEach((layer, index) => {
        layer.mesh.rotation.y += 0.00018 + index * 0.00004
        layer.mesh.rotation.x = Math.sin(elapsed * (0.045 + index * 0.014)) * 0.01
      })
      accentOrbs.forEach((orb, index) => {
        orb.mesh.rotation.y += 0.0003 + index * 0.000008
        orb.mesh.position.y += Math.sin(elapsed * (0.22 + index * 0.013)) * 0.0025
      })
      coreGlow.scale.setScalar(1 + Math.sin(elapsed * 0.8) * 0.03)

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
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      starLayers.forEach((layer) => {
        layer.geometry.dispose()
        layer.material.dispose()
      })
      galaxyLayers.forEach((layer) => {
        layer.geometry.dispose()
        layer.material.dispose()
      })
      accentOrbs.forEach((orb) => {
        orb.geometry.dispose()
        orb.material.dispose()
      })
      cameraTargetRef.current = null
      lookTargetRef.current = null
      mount.innerHTML = ''
    }
  }, [topics])

  const modalTopic = modalTopicId ? topicMap.get(modalTopicId) ?? null : null

  return (
    <main className="space-shell">
      <div className="space-noise"></div>
      <div className="space-hud">
        <span className={`source-pill is-${status}`}>
          {status === 'live' ? 'NAVER LIVE' : status === 'loading' ? 'SYNCING' : 'DEMO MODE'}
        </span>
        <span className="source-pill ghost">Korea Search Constellation</span>
      </div>

      <section className="scene-viewport">
        <div className="scene-mount" ref={mountRef}></div>
      </section>

      <div
        className={`modal-backdrop ${modalTopic ? '' : 'hidden'}`}
        onClick={closeModalKeepOrbitView}
      />
      <section className={`topic-modal ${modalTopic ? '' : 'hidden'}`} aria-hidden={!modalTopic}>
        {modalTopic ? (
          <>
            <button
              className="modal-close"
              type="button"
              onClick={closeModalKeepOrbitView}
            >
              Close
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
          </>
        ) : null}
      </section>
    </main>
  )
}

export default App
