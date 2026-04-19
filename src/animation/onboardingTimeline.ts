import * as THREE from 'three'
import type { OnboardingMotionState } from '../types/scene'

const BURST_END = 0.28
const CONVERGE_END = 0.76

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function easeOutExpo(value: number) {
  if (value >= 1) return 1
  return 1 - Math.pow(2, -10 * value)
}

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3)
}

function bezierPoint(
  start: THREE.Vector3,
  controlA: THREE.Vector3,
  controlB: THREE.Vector3,
  end: THREE.Vector3,
  t: number,
) {
  const mt = 1 - t
  return new THREE.Vector3(
    mt * mt * mt * start.x
      + 3 * mt * mt * t * controlA.x
      + 3 * mt * t * t * controlB.x
      + t * t * t * end.x,
    mt * mt * mt * start.y
      + 3 * mt * mt * t * controlA.y
      + 3 * mt * t * t * controlB.y
      + t * t * t * end.y,
    mt * mt * mt * start.z
      + 3 * mt * mt * t * controlA.z
      + 3 * mt * t * t * controlB.z
      + t * t * t * end.z,
  )
}

export function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

export function getOnboardingProgress(elapsed: number, startedAt: number, duration: number) {
  if (!startedAt || duration <= 0) return 0
  return clamp((elapsed - startedAt) / duration, 0, 1)
}

export function resolveOnboardingPosition(progress: number, motion: OnboardingMotionState) {
  if (progress <= BURST_END) {
    const stageT = easeOutExpo(progress / BURST_END)
    return motion.burstPosition.clone().multiplyScalar(stageT)
  }

  if (progress <= CONVERGE_END) {
    const stageT = easeInOutCubic((progress - BURST_END) / (CONVERGE_END - BURST_END))
    return bezierPoint(
      motion.burstPosition,
      motion.controlA,
      motion.controlB,
      motion.planePosition,
      stageT,
    )
  }

  const stageT = easeOutCubic((progress - CONVERGE_END) / (1 - CONVERGE_END))
  return motion.planePosition.clone().lerp(motion.finalPosition, stageT)
}

export function createOnboardingMotionState(finalPosition: THREE.Vector3) {
  const z = Math.random() * 2 - 1
  const theta = Math.random() * Math.PI * 2
  const radial = Math.sqrt(1 - z * z)
  const burstDirection = new THREE.Vector3(
    radial * Math.cos(theta),
    z,
    radial * Math.sin(theta),
  )

  const burstPosition = burstDirection.multiplyScalar(18 + Math.random() * 18)
  const planePosition = finalPosition.clone().multiplyScalar(1.05 + Math.random() * 0.2)
  planePosition.y = THREE.MathUtils.lerp(burstPosition.y * 0.18, finalPosition.y, 0.45)

  const tangent = new THREE.Vector3(-burstPosition.z, 0, burstPosition.x)
    .normalize()
    .multiplyScalar(3 + Math.random() * 6)

  return {
    finalPosition,
    burstPosition,
    planePosition,
    controlA: burstPosition
      .clone()
      .add(tangent)
      .add(new THREE.Vector3(0, -2.2 + Math.random() * 4.4, 0)),
    controlB: planePosition
      .clone()
      .add(finalPosition.clone().sub(planePosition).multiplyScalar(0.6))
      .add(new THREE.Vector3(-2.4 + Math.random() * 4.8, -1.2 + Math.random() * 2.4, 0)),
  }
}
