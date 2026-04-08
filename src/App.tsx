import { useEffect, useState } from 'react'
import './App.css'
import { trendItems, type TrendItem } from './data/trendItems'

const categoryClassMap: Record<string, string> = {
  연애: 'category-love',
  밈: 'category-meme',
  상식: 'category-fact',
  음식: 'category-food',
  AI: 'category-ai',
  대학생: 'category-campus',
  시험기간: 'category-exam',
}

const liveMessages = [
  '방금 128명이 새로 들어옴',
  '지금 이 카드 묶음에 41명이 동시에 머무는 중',
  '새벽 피크 시간대라 조회 수가 다시 오르는 중',
  '시험기간 특수로 AI 카테고리 클릭이 몰리는 중',
  '방금 음식 카드 3개가 급상승 목록에 진입함',
  '연애 카테고리 체류 시간이 괜히 길어지는 중',
]

function shuffle<T>(items: T[]) {
  const clone = [...items]

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]]
  }

  return clone
}

function varyViewers(viewers: number) {
  const amount = Math.floor(Math.random() * 121) - 30
  return Math.max(120, viewers + amount)
}

function buildSeedItems() {
  return shuffle(trendItems).map((item) => ({
    ...item,
    viewers: varyViewers(item.viewers),
  }))
}

function formatViewers(viewers: number) {
  return `${viewers.toLocaleString('ko-KR')}명 보는 중`
}

function App() {
  const [items, setItems] = useState<TrendItem[]>(() => buildSeedItems())
  const [liveMessage, setLiveMessage] = useState(liveMessages[0])
  const [selectedItem, setSelectedItem] = useState<TrendItem | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const bannerTimer = window.setInterval(() => {
      setLiveMessage(
        liveMessages[Math.floor(Math.random() * liveMessages.length)],
      )
    }, 5200)

    const viewerTimer = window.setInterval(() => {
      setItems((currentItems) => {
        const nextItems = [...currentItems]
        const randomIndex = Math.floor(Math.random() * nextItems.length)
        const target = nextItems[randomIndex]

        if (!target) {
          return currentItems
        }

        nextItems[randomIndex] = {
          ...target,
          viewers: varyViewers(target.viewers),
        }

        return nextItems
      })
    }, 6400)

    return () => {
      window.clearInterval(bannerTimer)
      window.clearInterval(viewerTimer)
    }
  }, [])

  function handleRefresh() {
    setIsRefreshing(true)
    setItems((currentItems) =>
      shuffle(currentItems).map((item) => ({
        ...item,
        viewers: varyViewers(item.viewers),
      })),
    )

    window.setTimeout(() => {
      setIsRefreshing(false)
    }, 380)
  }

  return (
    <>
      <div className="app-shell">
        <header className="hero">
          <div className="hero-copy">
            <p className="eyebrow">지금 이 순간, 사람들이 괜히 눌러보는 것들</p>
            <h1>지금 다들 뭐 보고 있지?</h1>
            <p className="subcopy">시험기간에 절대 누르면 안 되는 것들</p>
          </div>
          <button className="refresh-button" type="button" onClick={handleRefresh}>
            {isRefreshing ? '섞는 중...' : '새로고침'}
          </button>
        </header>

        <section className="live-banner" aria-live="polite">
          <span className="live-dot"></span>
          <p>{liveMessage}</p>
        </section>

        <section className="feed-meta">
          <div>
            <strong>실시간 느낌 피드</strong>
            <p>카드를 눌러 왜 뜨는지 확인해보세요.</p>
          </div>
          <span className="feed-chip">오늘의 낭비 리스트</span>
        </section>

        <main className="feed">
          {items.map((item, index) => (
            <article
              className="trend-card"
              key={item.id}
              style={{ animationDelay: `${Math.min(index * 0.04, 0.4)}s` }}
            >
              <div className="card-top">
                <span className={`category-badge ${categoryClassMap[item.category] ?? ''}`}>
                  {item.category}
                </span>
                <span className="hot-score">HOT {item.hotScore}</span>
              </div>
              <h2>{item.title}</h2>
              <p className="summary">{item.summary}</p>
              <p className="hook">{item.hook}</p>
              <div className="card-bottom">
                <div className="viewer-box">
                  <span className="viewer-label">지금 보는 사람 수</span>
                  <strong>{formatViewers(item.viewers)}</strong>
                </div>
                <button
                  className="reason-button"
                  type="button"
                  onClick={() => setSelectedItem(item)}
                >
                  왜 뜨는지 보기
                </button>
              </div>
            </article>
          ))}
        </main>
      </div>

      <div
        className={`sheet-backdrop ${selectedItem ? '' : 'hidden'}`}
        onClick={() => setSelectedItem(null)}
      />
      <section className={`bottom-sheet ${selectedItem ? '' : 'hidden'}`} aria-hidden={!selectedItem}>
        {selectedItem ? (
          <>
            <div className="sheet-handle"></div>
            <button
              className="sheet-close"
              type="button"
              onClick={() => setSelectedItem(null)}
            >
              닫기
            </button>
            <p className="sheet-category">
              {selectedItem.category} · {formatViewers(selectedItem.viewers)}
            </p>
            <h2>{selectedItem.reasonTitle}</h2>
            <div className="sheet-body">
              {selectedItem.reasonBody.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </>
        ) : null}
      </section>
    </>
  )
}

export default App
