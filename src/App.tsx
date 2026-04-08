import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { buildFallbackTrends, type TrendTopic } from './data/trendItems'

type PositionedTopic = TrendTopic & {
  x: number
  y: number
  z: number
  size: number
}

const orbitRadii = [110, 170, 240]

function formatBuzz(buzz: number) {
  return `${buzz.toLocaleString('ko-KR')} 추정 반응`
}

function formatClock(isoString: string) {
  return new Date(isoString).toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function App() {
  const [topics, setTopics] = useState<TrendTopic[]>(() => buildFallbackTrends())
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [modalTopicId, setModalTopicId] = useState<string | null>(null)
  const [rotation, setRotation] = useState({ x: -18, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [status, setStatus] = useState<'loading' | 'live' | 'fallback'>('loading')
  const [statusCopy, setStatusCopy] = useState('한국 포털 트렌드 신호를 불러오는 중')
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
          setStatusCopy(
            data.mode === 'live'
              ? '네이버 DataLab 기준으로 한국 검색 흐름을 재구성했어요'
              : '실시간 API 없이 데모 트렌드로 우주 지도를 구성했어요',
          )
        }
      } catch {
        if (!ignore) {
          setTopics(buildFallbackTrends())
          setStatus('fallback')
          setStatusCopy('실시간 API가 없어 데모 트렌드 우주로 전환했어요')
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
          y: currentRotation.y + 0.3,
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
      const angle = topic.angle + index * 0.18
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = Math.sin(angle * 1.6) * 62 + (topic.orbit - 1) * 24
      const size = Math.max(74, Math.min(144, 48 + topic.trafficScore * 0.7))

      return {
        ...topic,
        x,
        y,
        z,
        size,
      }
    })
  }, [topics])

  const selectedTopic = positionedTopics.find((topic) => topic.id === selectedTopicId) ?? null
  const modalTopic = positionedTopics.find((topic) => topic.id === modalTopicId) ?? null
  const topTopic = positionedTopics[0]
  const sceneTransform = selectedTopic
    ? `translate3d(${-selectedTopic.x * 0.48}px, ${-selectedTopic.y * 0.52}px, 130px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(1.3)`
    : `translate3d(0, 0, 0) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(1)`

  function handleRefresh() {
    setTopics(buildFallbackTrends())
    setStatus('fallback')
    setStatusCopy('데모 트렌드 우주를 다시 섞어 보여주고 있어요')
    setSelectedTopicId(null)
    setModalTopicId(null)
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: rotation.x,
      baseY: rotation.y,
    }
    setIsDragging(true)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) {
      return
    }

    const deltaX = event.clientX - dragRef.current.startX
    const deltaY = event.clientY - dragRef.current.startY

    setRotation({
      x: Math.max(-52, Math.min(52, dragRef.current.baseX - deltaY * 0.12)),
      y: dragRef.current.baseY + deltaX * 0.18,
    })
  }

  function handlePointerUp() {
    dragRef.current = null
    setIsDragging(false)
  }

  function handleSelectTopic(topicId: string) {
    setSelectedTopicId(topicId)
    setModalTopicId(null)

    if (focusTimeoutRef.current !== null) {
      window.clearTimeout(focusTimeoutRef.current)
    }

    focusTimeoutRef.current = window.setTimeout(() => {
      setModalTopicId(topicId)
    }, 680)
  }

  return (
    <main className="app-shell">
      <div className="app-shell-inner">
        <section className="hero-panel">
          <div>
            <p className="eyebrow">대한민국 검색 시그널 오브 맵</p>
            <h1>지금 한국은 무엇을 크게 검색하고 있지?</h1>
            <p className="subcopy">
              네이버 DataLab 기반 흐름을 우주형 3D 네트워크로 재구성했어요.
              구체를 드래그로 돌리고, 클릭하면 해당 이슈 방향으로 깊게 줌 인됩니다.
            </p>
          </div>
          <div className="hero-actions">
            <button className="refresh-button" type="button" onClick={handleRefresh}>
              데모 재구성
            </button>
            <span className={`status-pill is-${status}`}>
              {status === 'live' ? 'LIVE' : status === 'loading' ? 'SYNC' : 'DEMO'}
            </span>
          </div>
        </section>

        <section className="signal-bar" aria-live="polite">
          <span className="signal-dot"></span>
          <p>{statusCopy}</p>
          <strong>{topTopic ? `${topTopic.label} 신호가 가장 크게 떠 있어요` : '데이터 준비 중'}</strong>
        </section>

        <section className="hud-grid">
          <article className="info-card">
            <span className="info-label">관측 범위</span>
            <strong>대한민국</strong>
            <p>전세계 이슈 대신 한국 포털 흐름에 맞춘 축소 버전입니다.</p>
          </article>
          <article className="info-card">
            <span className="info-label">현재 소스</span>
            <strong>{topTopic?.sourceLabel ?? '데이터 준비 중'}</strong>
            <p>{topTopic ? formatClock(topTopic.collectedAt) : '관측 시각을 계산 중입니다.'}</p>
          </article>
          <article className="info-card">
            <span className="info-label">탐색 방식</span>
            <strong>드래그 · 포커스 · 모달</strong>
            <p>구체를 누르면 그 이슈 방향으로 빠르게 이동한 뒤 해설을 띄웁니다.</p>
          </article>
        </section>

        <section className="scene-card">
          <div className="scene-copy">
            <div>
              <p className="eyebrow">Korea Search Constellation</p>
              <h2>트렌드 마인드맵을 우주 좌표로 옮긴 장면</h2>
            </div>
            <p>
              큰 구체일수록 현재 반응량이 크고, 궤도가 다를수록 카테고리 감각이 달라요.
              빈 공간은 네트워크 속을 떠다니는 느낌으로 채웠습니다.
            </p>
          </div>

          <div
            className={`scene-viewport ${isDragging ? 'is-dragging' : ''} ${selectedTopic ? 'is-focused' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <div className="scene-background">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="scene-grid"></div>
            <div className="scene-core"></div>
            <div className="scene-space" style={{ transform: sceneTransform }}>
              {positionedTopics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  className={`trend-orb ${selectedTopicId === topic.id ? 'is-selected' : ''}`}
                  style={{
                    '--orb-size': `${topic.size}px`,
                    '--orb-x': `${topic.x}px`,
                    '--orb-y': `${topic.y}px`,
                    '--orb-z': `${topic.z}px`,
                    '--orb-color': topic.color,
                  } as React.CSSProperties}
                  onClick={() => handleSelectTopic(topic.id)}
                >
                  <span className="orb-glow"></span>
                  <span className="orb-content">
                    <strong>{topic.label}</strong>
                    <small>{topic.category}</small>
                    <em>{topic.trafficScore}</em>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="ranking-panel">
          <div className="ranking-head">
            <div>
              <p className="eyebrow">관측 랭킹</p>
              <h2>현재 크게 떠 있는 한국 검색 주제</h2>
            </div>
            <p>구체를 못 잡겠으면 여기서 바로 클릭해도 같은 포커스 이동이 적용됩니다.</p>
          </div>

          <div className="ranking-list">
            {positionedTopics.slice(0, 6).map((topic) => (
              <button
                key={topic.id}
                type="button"
                className="ranking-card"
                onClick={() => handleSelectTopic(topic.id)}
              >
                <span className="ranking-order">{topic.trafficScore}</span>
                <div>
                  <strong>{topic.label}</strong>
                  <p>{topic.summary}</p>
                </div>
                <span className="ranking-buzz">{formatBuzz(topic.buzz)}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

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
              닫기
            </button>
            <p className="modal-kicker">{modalTopic.category} · {modalTopic.sourceLabel}</p>
            <h2>{modalTopic.label}</h2>
            <p className="modal-summary">{modalTopic.summary}</p>
            <div className="modal-stats">
              <div>
                <span>트래픽 지수</span>
                <strong>{modalTopic.trafficScore}</strong>
              </div>
              <div>
                <span>추정 반응량</span>
                <strong>{formatBuzz(modalTopic.buzz)}</strong>
              </div>
              <div>
                <span>관측 시각</span>
                <strong>{formatClock(modalTopic.collectedAt)}</strong>
              </div>
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
