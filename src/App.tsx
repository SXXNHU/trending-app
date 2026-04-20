import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { OnboardingOverlay } from './components/OnboardingOverlay'
import { TopicModal } from './components/TopicModal'
import { useCameraControl } from './hooks/useCameraControl'
import { useOnboarding } from './hooks/useOnboarding'
import { useTrends } from './hooks/useTrends'

const SceneCanvas = lazy(async () => {
  const module = await import('./components/SceneCanvas')
  return { default: module.SceneCanvas }
})

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

function formatCountdown(secs: number) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${m}:${s}`
}

function App() {
  const [modalTopicId, setModalTopicId] = useState<string | null>(null)
  const {
    topics,
    status,
    hudStatus,
    lastSyncAt,
    refreshCountdown,
    isRefreshing,
    maxBuzz,
    manualRefresh,
  } = useTrends()

  const onboarding = useOnboarding()
  const cameraControl = useCameraControl(onboarding.phase)
  const focusSeqRef = useRef(0)
  const [focusRequest, setFocusRequest] = useState<{ id: string; seq: number } | null>(null)
  const sidebarScrollRef = useRef<HTMLDivElement>(null)

  const topicMap = useMemo(() => new Map(topics.map((topic) => [topic.id, topic])), [topics])
  const modalTopic = modalTopicId ? topicMap.get(modalTopicId) ?? null : null
  const trafficPercent = modalTopic ? Math.round((modalTopic.buzz / maxBuzz) * 100) : 0

  const sidebarItems = useMemo(() => {
    const sorted = [...topics].sort((a, b) => b.trafficScore - a.trafficScore)
    const maxScore = sorted[0]?.trafficScore || 1
    const topicCount = sorted.length || 1
    const items: Array<{
      key: string
      label: string
      parentId: string
      rank: number
      barWidth: number
      isChild: boolean
    }> = []

    sorted.forEach((topic, i) => {
      const barWidth = Math.max(2, Math.round((topic.trafficScore / maxScore) * 38))
      items.push({
        key: topic.id,
        label: topic.label,
        parentId: topic.id,
        rank: i + 1,
        barWidth,
        isChild: false,
      })

      topic.relatedTopics?.slice(0, 5).forEach((label) => {
        items.push({
          key: `${topic.id}-${label}`,
          label,
          parentId: topic.id,
          rank: i + 1,
          barWidth: Math.max(2, Math.round(barWidth * 0.55)),
          isChild: true,
        })
      })
    })

    return { items, topicCount }
  }, [topics])

  useEffect(() => {
    const scrollContainer = sidebarScrollRef.current
    if (!scrollContainer || sidebarItems.items.length === 0) return
    const container = scrollContainer

    const isMobile = () => window.matchMedia('(max-width: 640px)').matches

    let frameId: number
    let pos = 0
    let paused = false

    const onEnter = () => { paused = true }
    const onLeave = () => { paused = false }
    const onTouchStart = () => { paused = true }
    const onTouchEnd = () => { paused = false }

    container.addEventListener('mouseenter', onEnter)
    container.addEventListener('mouseleave', onLeave)
    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchend', onTouchEnd, { passive: true })

    function tick() {
      if (!paused) {
        pos += 0.45
        if (isMobile()) {
          const half = container.scrollWidth / 2
          if (half > 0 && pos >= half) pos -= half
          container.scrollLeft = pos
        } else {
          const half = container.scrollHeight / 2
          if (half > 0 && pos >= half) pos -= half
          container.scrollTop = pos
        }
      }
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frameId)
      container.removeEventListener('mouseenter', onEnter)
      container.removeEventListener('mouseleave', onLeave)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchend', onTouchEnd)
    }
  }, [sidebarItems])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(pointer: coarse)').matches) return
    if (onboarding.phase === 'complete') return

    const html = document.documentElement
    const { body } = document
    const previous = {
      htmlOverflow: html.style.overflow,
      htmlOverscrollBehavior: html.style.overscrollBehavior,
      bodyOverflow: body.style.overflow,
      bodyOverscrollBehavior: body.style.overscrollBehavior,
    }

    html.style.overflow = 'hidden'
    html.style.overscrollBehavior = 'none'
    body.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'none'

    return () => {
      html.style.overflow = previous.htmlOverflow
      html.style.overscrollBehavior = previous.htmlOverscrollBehavior
      body.style.overflow = previous.bodyOverflow
      body.style.overscrollBehavior = previous.bodyOverscrollBehavior
    }
  }, [onboarding.phase])

  const handleSidebarClick = useCallback((parentId: string) => {
    focusSeqRef.current += 1
    setFocusRequest({ id: parentId, seq: focusSeqRef.current })
    setModalTopicId(parentId)
  }, [])

  return (
    <main className="space-shell">
      <div className="space-noise" />
      <div className="cyber-grid" />

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
            onClick={manualRefresh}
            disabled={isRefreshing}
            aria-label="Refresh trends"
          >
            ↻
          </button>
        </div>
      </div>

      {status === 'fallback' && !isRefreshing && (
        <div className="fallback-banner" role="status">
          DEMO DATA&nbsp;·&nbsp;NOT LIVE&nbsp;·&nbsp;API UNAVAILABLE
        </div>
      )}

      <aside className="trend-sidebar">
        <div className="trend-sidebar-scroll" ref={sidebarScrollRef}>
          <div className="trend-sidebar-track">
            {[...sidebarItems.items, ...sidebarItems.items].map((item, i) => (
              <button
                key={`${item.key}-${i}`}
                className={`trend-sidebar-item${item.isChild ? ' is-child' : ''}`}
                type="button"
                onClick={() => handleSidebarClick(item.parentId)}
              >
                {!item.isChild && <span className="trend-rank">{item.rank}</span>}
                <span className="trend-label">{item.label}</span>
                <span
                  className="trend-bar"
                  style={{
                    width: `${item.barWidth}px`,
                    background: `rgba(0, 255, 136, ${
                      item.isChild
                        ? 0.22
                        : 0.3 + (1 - item.rank / sidebarItems.topicCount) * 0.45
                    })`,
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section className="scene-viewport">
        <Suspense fallback={<div className="scene-mount" aria-hidden="true" />}>
          <SceneCanvas
            topics={topics}
            introPhase={onboarding.phase}
            introDuration={onboarding.duration}
            controlsEnabled={cameraControl.controlsEnabled}
            onIntroComplete={onboarding.completeIntro}
            onMarkInteraction={onboarding.markInteraction}
            onSelectTopic={setModalTopicId}
            focusRequest={focusRequest}
            selectedTopicId={modalTopicId}
          />
        </Suspense>
      </section>

      <OnboardingOverlay
        phase={onboarding.phase}
        visibleHintIds={onboarding.visibleHintIds}
        onStart={onboarding.startIntro}
        onSkip={onboarding.skipIntro}
        onDismissHint={onboarding.dismissHint}
      />

      <TopicModal
        topic={modalTopic}
        trafficPercent={trafficPercent}
        onClose={() => setModalTopicId(null)}
        formatBuzz={formatBuzz}
        formatClock={formatClock}
        formatEvidenceSource={formatEvidenceSource}
      />
    </main>
  )
}

export default App
