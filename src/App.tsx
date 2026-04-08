import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { buildFallbackTrends, type TrendTopic } from './data/trendItems'

type PositionedTopic = TrendTopic & {
  x: number
  y: number
  z: number
  size: number
}

type Edge = {
  id: string
  length: number
  angle: number
  midX: number
  midY: number
  z: number
}

const orbitRadii = [112, 176, 248]

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

function App() {
  const [topics, setTopics] = useState<TrendTopic[]>(() => buildFallbackTrends())
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [modalTopicId, setModalTopicId] = useState<string | null>(null)
  const [rotation, setRotation] = useState({ x: -16, y: 18 })
  const [status, setStatus] = useState<'loading' | 'live' | 'fallback'>('loading')
  const dragRef = useRef<{
    startX: number
    startY: number
    baseX: number
    baseY: number
  } | null>(null)
  const focusTimeoutRef = useRef<number | null>(null)

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

    const autoSpin = window.setInterval(() => {
      setRotation((currentRotation) => {
        if (dragRef.current || modalTopicId) {
          return currentRotation
        }

        return {
          ...currentRotation,
          y: currentRotation.y + 0.18,
        }
      })
    }, 40)

    return () => {
      ignore = true
      window.clearInterval(autoSpin)
    }
  }, [modalTopicId])

  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current !== null) {
        window.clearTimeout(focusTimeoutRef.current)
      }
    }
  }, [])

  const positionedTopics = useMemo<PositionedTopic[]>(() => {
    return topics.map((topic, index) => {
      const radius = orbitRadii[topic.orbit]
      const angle = topic.angle + index * 0.16
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = Math.sin(angle * 1.5) * 66 + (topic.orbit - 1) * 20
      const size = Math.max(72, Math.min(146, 54 + topic.trafficScore * 0.72))

      return {
        ...topic,
        x,
        y,
        z,
        size,
      }
    })
  }, [topics])

  const topicMap = useMemo(
    () => new Map(positionedTopics.map((topic) => [topic.id, topic])),
    [positionedTopics],
  )

  const edges = useMemo<Edge[]>(() => {
    const nextEdges: Edge[] = []
    const seen = new Set<string>()

    positionedTopics.forEach((topic) => {
      topic.links?.forEach((targetId) => {
        const target = topicMap.get(targetId)
        if (!target) {
          return
        }

        const edgeId = [topic.id, target.id].sort().join(':')
        if (seen.has(edgeId)) {
          return
        }

        seen.add(edgeId)

        const dx = target.x - topic.x
        const dy = target.y - topic.y
        const length = Math.hypot(dx, dy)

        nextEdges.push({
          id: edgeId,
          length,
          angle: Math.atan2(dy, dx),
          midX: (topic.x + target.x) / 2,
          midY: (topic.y + target.y) / 2,
          z: (topic.z + target.z) / 2,
        })
      })
    })

    return nextEdges
  }, [positionedTopics, topicMap])

  const selectedTopic = positionedTopics.find((topic) => topic.id === selectedTopicId) ?? null
  const modalTopic = positionedTopics.find((topic) => topic.id === modalTopicId) ?? null
  const sceneTransform = selectedTopic
    ? `translate3d(${-selectedTopic.x * 0.5}px, ${-selectedTopic.y * 0.52}px, 150px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(1.34)`
    : `translate3d(0, 0, 0) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(1)`

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: rotation.x,
      baseY: rotation.y,
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) {
      return
    }

    const deltaX = event.clientX - dragRef.current.startX
    const deltaY = event.clientY - dragRef.current.startY

    setRotation({
      x: Math.max(-52, Math.min(52, dragRef.current.baseX - deltaY * 0.1)),
      y: dragRef.current.baseY + deltaX * 0.16,
    })
  }

  function handlePointerUp() {
    dragRef.current = null
  }

  function handleSelectTopic(topicId: string) {
    setSelectedTopicId(topicId)
    setModalTopicId(null)

    if (focusTimeoutRef.current !== null) {
      window.clearTimeout(focusTimeoutRef.current)
    }

    focusTimeoutRef.current = window.setTimeout(() => {
      setModalTopicId(topicId)
    }, 760)
  }

  return (
    <main className="space-shell">
      <div className="space-noise"></div>
      <div className="space-hud">
        <span className={`source-pill is-${status}`}>
          {status === 'live' ? 'NAVER LIVE' : status === 'loading' ? 'SYNCING' : 'DEMO MODE'}
        </span>
        <span className="source-pill ghost">Korea Search Constellation</span>
      </div>

      <section
        className={`scene-viewport ${selectedTopic ? 'is-focused' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className="space-glow"></div>
        <div className="space-glow secondary"></div>
        <div className="scene-core"></div>
        <div className="scene-space" style={{ transform: sceneTransform }}>
          {edges.map((edge) => (
            <span
              key={edge.id}
              className="link-line"
              style={{
                width: `${edge.length}px`,
                transform: `translate3d(${edge.midX - edge.length / 2}px, ${edge.midY}px, ${edge.z}px) rotate(${edge.angle}rad)`,
              }}
            />
          ))}

          {positionedTopics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              className={`trend-sphere ${selectedTopicId === topic.id ? 'is-selected' : ''}`}
              style={{
                '--sphere-size': `${topic.size}px`,
                '--sphere-x': `${topic.x}px`,
                '--sphere-y': `${topic.y}px`,
                '--sphere-z': `${topic.z}px`,
                '--sphere-color': topic.color,
              } as React.CSSProperties}
              onClick={() => handleSelectTopic(topic.id)}
            >
              <span className="sphere-aura"></span>
              <span className="sphere-sheen"></span>
              <span className="sphere-label">
                <strong>{topic.label}</strong>
              </span>
            </button>
          ))}
        </div>
      </section>

      <div
        className={`modal-backdrop ${modalTopic ? '' : 'hidden'}`}
        onClick={() => {
          setModalTopicId(null)
          setSelectedTopicId(null)
        }}
      />
      <section className={`topic-modal ${modalTopic ? '' : 'hidden'}`} aria-hidden={!modalTopic}>
        {modalTopic ? (
          <>
            <button
              className="modal-close"
              type="button"
              onClick={() => {
                setModalTopicId(null)
                setSelectedTopicId(null)
              }}
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
