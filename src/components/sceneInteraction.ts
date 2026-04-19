import * as THREE from 'three'
import { getViewportPreset } from './sceneModel'
import type { ClickableNode } from '../types/scene'

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

type BindSceneInteractionsParams = {
  mount: HTMLDivElement
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  clickables: ClickableNode[]
  controlsEnabled: boolean
  viewportPreset: ReturnType<typeof getViewportPreset>
  cameraTarget: THREE.Vector3
  defaultCameraPosition: THREE.Vector3
  lookTarget: THREE.Vector3
  rotationTarget: THREE.Vector2
  selectedIdRef: { current: string | null }
  hoveredIdRef: { current: string | null }
  onMarkInteraction: () => void
  onSelectTopic: (topicId: string | null) => void
}

export function bindSceneInteractions({
  mount,
  camera,
  renderer,
  clickables,
  controlsEnabled,
  viewportPreset,
  cameraTarget,
  defaultCameraPosition,
  lookTarget,
  rotationTarget,
  selectedIdRef,
  hoveredIdRef,
  onMarkInteraction,
  onSelectTopic,
}: BindSceneInteractionsParams) {
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const activePointers = new Map<number, { x: number; y: number }>()
  let zoomDistance = viewportPreset.cameraDistance
  let pinchStartDistance = 0
  let pinchZoomStart = zoomDistance
  let isPinching = false
  let isDragging = false
  let activePointerId: number | null = null
  let pointerDown = { x: 0, y: 0, moved: false }
  let introDone = false

  function setIntroDone(nextValue: boolean) {
    introDone = nextValue
  }

  function setCameraFromZoom(nextZoom: number) {
    zoomDistance = clamp(
      nextZoom,
      viewportPreset.isCompact ? 31 : 27,
      viewportPreset.isCompact ? 50 : 44,
    )
    defaultCameraPosition.set(0, 8.4, zoomDistance)
    if (!selectedIdRef.current && introDone) cameraTarget.copy(defaultCameraPosition)
  }

  function updatePointer(event: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  function getPinchDistance() {
    const points = Array.from(activePointers.values())
    const dx = points[0].x - points[1].x
    const dy = points[0].y - points[1].y
    return Math.sqrt(dx * dx + dy * dy)
  }

  function handleWheel(event: WheelEvent) {
    if (!controlsEnabled) return
    event.preventDefault()
    setCameraFromZoom(zoomDistance + (event.deltaY > 0 ? 1 : -1) * 2.2)
  }

  function handlePointerDown(event: PointerEvent) {
    if (!controlsEnabled) return
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    hoveredIdRef.current = null

    if (activePointers.size === 2) {
      isDragging = false
      activePointerId = null
      isPinching = true
      pinchStartDistance = getPinchDistance()
      pinchZoomStart = zoomDistance
    } else {
      pointerDown = { x: event.clientX, y: event.clientY, moved: false }
      isDragging = true
      activePointerId = event.pointerId
    }
  }

  function handlePointerMove(event: PointerEvent) {
    if (!controlsEnabled) return
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (isPinching && activePointers.size >= 2) {
      const currentDist = getPinchDistance()
      if (currentDist > 0) {
        setCameraFromZoom(pinchZoomStart * (pinchStartDistance / currentDist))
      }
      return
    }

    if (!isDragging || event.pointerId !== activePointerId) return

    const deltaX = event.clientX - pointerDown.x
    const deltaY = event.clientY - pointerDown.y
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) pointerDown.moved = true
    rotationTarget.y += deltaX * viewportPreset.dragX
    rotationTarget.x = clamp(rotationTarget.x + deltaY * viewportPreset.dragY, -0.54, 0.12)
    pointerDown = { x: event.clientX, y: event.clientY, moved: pointerDown.moved }
    onMarkInteraction()
  }

  function handlePointerUp(event: PointerEvent) {
    if (!controlsEnabled) return
    activePointers.delete(event.pointerId)
    if (isPinching) {
      if (activePointers.size < 2) {
        isPinching = false
        isDragging = false
        activePointerId = null
      }
      return
    }
    if (activePointerId === null || activePointerId !== event.pointerId) return

    if (!pointerDown.moved) {
      updatePointer(event)
      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObjects(
        clickables.map((entry) => entry.mesh),
        false,
      )
      const hit = intersects[0]
        ? clickables.find((entry) => entry.mesh === intersects[0].object)
        : null
      selectedIdRef.current = hit?.topic.id ?? null
      if (hit) {
        const focusPoint = hit.getFocusPoint()
        const focusDirection = focusPoint
          .clone()
          .normalize()
          .multiplyScalar(viewportPreset.focusDistance)
        cameraTarget.copy(
          focusPoint.clone().add(focusDirection).add(new THREE.Vector3(0, 1.2, 0)),
        )
        lookTarget.copy(focusPoint)
      } else {
        cameraTarget.copy(defaultCameraPosition)
        lookTarget.set(0, 0, 0)
      }
      onSelectTopic(hit?.topic.id ?? null)
    }

    isDragging = false
    activePointerId = null
  }

  function handleResize() {
    const nextPreset = getViewportPreset(mount.clientWidth)
    camera.aspect = mount.clientWidth / mount.clientHeight
    camera.fov = nextPreset.cameraFov
    camera.updateProjectionMatrix()
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    defaultCameraPosition.set(0, 8.4, nextPreset.cameraDistance)
    if (!selectedIdRef.current) cameraTarget.copy(defaultCameraPosition)
  }

  renderer.domElement.addEventListener('pointerdown', handlePointerDown)
  renderer.domElement.addEventListener('pointermove', handlePointerMove)
  renderer.domElement.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('pointerup', handlePointerUp)
  window.addEventListener('resize', handleResize)

  return {
    setIntroDone,
    deselectAll() {
      selectedIdRef.current = null
      cameraTarget.copy(defaultCameraPosition)
      lookTarget.set(0, 0, 0)
    },
    cleanup() {
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown)
      renderer.domElement.removeEventListener('pointermove', handlePointerMove)
      renderer.domElement.removeEventListener('wheel', handleWheel)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('resize', handleResize)
    },
  }
}
