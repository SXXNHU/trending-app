import type { IntroPhase } from '../types/scene'

type OnboardingOverlayProps = {
  phase: IntroPhase
  visibleHintIds: string[]
  onStart: () => void
  onSkip: () => void
  onDismissHint: (hintId: string) => void
}

const HINT_MESSAGES = [
  { id: 'drag-explore', message: 'DRAG TO TILT / TAP A NODE TO EXPLORE' },
  { id: 'zoom', message: 'SCROLL TO ZOOM IN / OUT' },
]

export function OnboardingOverlay({
  phase,
  visibleHintIds,
  onStart,
  onSkip,
  onDismissHint,
}: OnboardingOverlayProps) {
  const visibleHints = HINT_MESSAGES.filter((hint) => visibleHintIds.includes(hint.id))

  return (
    <>
      {phase === 'idle' && (
        <button
          type="button"
          className="intro-overlay"
          onClick={onStart}
          aria-label="Start scene"
        >
          <span className="intro-kicker">Chaos to Order</span>
          <strong>Click to Start</strong>
        </button>
      )}

      {phase === 'running' && (
        <button
          type="button"
          className="intro-skip"
          onClick={onSkip}
          aria-label="Skip intro animation"
        >
          Skip Intro
        </button>
      )}

      {visibleHints.length > 0 && phase === 'complete' && (
        <div className="onboarding-hints" aria-label="Interaction hints">
          {visibleHints.map((hint) => (
            <button
              key={hint.id}
              type="button"
              className="onboarding-hint"
              onClick={() => onDismissHint(hint.id)}
              aria-label="Dismiss hint"
            >
              <span className="hint-pulse" />
              {hint.message}
              <span className="hint-pulse" />
            </button>
          ))}
        </div>
      )}
    </>
  )
}
