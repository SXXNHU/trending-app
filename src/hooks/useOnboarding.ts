import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { IntroPhase } from '../types/scene'

const INTRO_STORAGE_KEY = 'trending-app-intro-seen'
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
  const [showHint, setShowHint] = useState(false)
  const hasInteractedRef = useRef(false)

  useEffect(() => {
    if (!showHint) return
    const timer = window.setTimeout(() => setShowHint(false), 7000)
    return () => clearTimeout(timer)
  }, [showHint])

  const duration = useMemo(
    () => (hasSeenIntro ? INTRO_DURATION.short : INTRO_DURATION.full),
    [hasSeenIntro],
  )

  const startIntro = useCallback(() => {
    setShowHint(false)
    setPhase('running')
  }, [])

  const finishIntro = useCallback(() => {
    setPhase('complete')
    setHasSeenIntro(true)
    if (!hasInteractedRef.current) setShowHint(true)
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

  const dismissHint = useCallback(() => {
    hasInteractedRef.current = true
    setShowHint(false)
  }, [])

  const markInteraction = useCallback(() => {
    hasInteractedRef.current = true
    setShowHint(false)
  }, [])

  return {
    phase,
    duration,
    showHint,
    startIntro,
    skipIntro,
    completeIntro,
    dismissHint,
    markInteraction,
  }
}
