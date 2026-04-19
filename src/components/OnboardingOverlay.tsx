import type { IntroPhase } from '../types/scene'

type OnboardingOverlayProps = {
  phase: IntroPhase
  showHint: boolean
  onStart: () => void
  onSkip: () => void
  onDismissHint: () => void
}

export function OnboardingOverlay({
  phase,
  showHint,
  onStart,
  onSkip,
  onDismissHint,
}: OnboardingOverlayProps) {
  const hintMessages = [
    'DRAG TO TILT · TAP A NODE TO EXPLORE',
    'SCROLL TO ZOOM IN · OUT',
  ]

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

      {showHint && phase === 'complete' && (
        <div className="onboarding-hints" aria-label="Interaction hints">
          {hintMessages.map((message) => (
            <button
              key={message}
              type="button"
              className="onboarding-hint"
              onClick={onDismissHint}
              aria-label="Dismiss hint"
            >
              <span className="hint-pulse" />
              {message}
              <span className="hint-pulse" />
            </button>
          ))}
        </div>
      )}
    </>
  )
}
