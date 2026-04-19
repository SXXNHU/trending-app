import { useMemo } from 'react'
import type { IntroPhase } from '../types/scene'

export function useCameraControl(introPhase: IntroPhase) {
  return useMemo(
    () => ({
      controlsEnabled: introPhase === 'complete',
    }),
    [introPhase],
  )
}
