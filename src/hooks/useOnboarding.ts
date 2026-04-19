import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { IntroPhase } from '../types/scene'

const INTRO_STORAGE_KEY = 'trending-app-intro-seen'
const DEFAULT_HINT_IDS = ['drag-explore', 'zoom'] as const
const INTRO_DURATION = {
  full: 3.2,
  short: 2.1,
}

function readHasSeenIntro() {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(INTRO_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function useOnboarding() {
  const [phase, setPhase] = useState<IntroPhase>('idle')
  const [hasSeenIntro, setHasSeenIntro] = useState(readHasSeenIntro)
  const [visibleHintIds, setVisibleHintIds] = useState<string[]>([])
  const hasInteractedRef = useRef(false)

  useEffect(() => {
    if (visibleHintIds.length === 0) return
    const timer = window.setTimeout(() => setVisibleHintIds([]), 7000)
    return () => clearTimeout(timer)
  }, [visibleHintIds])

  const duration = useMemo(
    () => (hasSeenIntro ? INTRO_DURATION.short : INTRO_DURATION.full),
    [hasSeenIntro],
  )

  const startIntro = useCallback(() => {
    setVisibleHintIds([])
    setPhase('running')
  }, [])

  const finishIntro = useCallback(() => {
    setPhase('complete')
    setHasSeenIntro(true)
    if (!hasInteractedRef.current) setVisibleHintIds([...DEFAULT_HINT_IDS])
    try {
      window.localStorage.setItem(INTRO_STORAGE_KEY, '1')
    } catch {
      // Ignore storage failures.
    }
  }, [])

  const skipIntro = useCallback(() => {
    finishIntro()
  }, [finishIntro])

  const completeIntro = useCallback(() => {
    finishIntro()
  }, [finishIntro])

  const dismissHint = useCallback((hintId: string) => {
    hasInteractedRef.current = true
    setVisibleHintIds((current) => current.filter((id) => id !== hintId))
  }, [])

  const markInteraction = useCallback(() => {
    hasInteractedRef.current = true
    setVisibleHintIds([])
  }, [])

  return {
    phase,
    duration,
    visibleHintIds,
    startIntro,
    skipIntro,
    completeIntro,
    dismissHint,
    markInteraction,
  }
}
