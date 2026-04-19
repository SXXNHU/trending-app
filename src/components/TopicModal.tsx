import type { TrendTopic } from '../data/trendItems'

type TopicModalProps = {
  topic: TrendTopic | null
  trafficPercent: number
  onClose: () => void
  formatBuzz: (buzz: number) => string
  formatClock: (value: string) => string
  formatEvidenceSource: (source: 'NEWS' | 'BLOG' | 'CAFE') => string
}

export function TopicModal({
  topic,
  trafficPercent,
  onClose,
  formatBuzz,
  formatClock,
  formatEvidenceSource,
}: TopicModalProps) {
  return (
    <>
      <div
        className={`modal-backdrop${topic ? '' : ' hidden'}`}
        onPointerDown={onClose}
      />

      <section
        className={`topic-modal${topic ? '' : ' hidden'}`}
        aria-hidden={!topic}
        onPointerDown={(event) => event.stopPropagation()}
        onPointerUp={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        {topic ? (
          <>
            <div
              className="modal-handle-bar"
              role="button"
              tabIndex={0}
              aria-label="Close"
              onClick={onClose}
              onKeyDown={(event) => event.key === 'Enter' && onClose()}
            />

            <div className="modal-header">
              <p className="modal-kicker">
                {topic.category}&nbsp;·&nbsp;{topic.sourceLabel}
              </p>
              <button className="modal-close" type="button" onClick={onClose}>
                X CLOSE
              </button>
            </div>

            <h2>{topic.label}</h2>
            <p className="modal-summary">{topic.summary}</p>

            <div className="modal-meta">
              <div className="modal-traffic-row">
                <span className="modal-buzz-label">{formatBuzz(topic.buzz)}</span>
                <div
                  className="modal-traffic-bar"
                  title={`${trafficPercent}% of peak activity`}
                  aria-label={`${trafficPercent}% of peak`}
                >
                  <div className="modal-traffic-fill" style={{ width: `${trafficPercent}%` }} />
                </div>
                <span className="modal-traffic-pct">{trafficPercent}%</span>
              </div>
              <span className="modal-time">{formatClock(topic.collectedAt)}</span>
            </div>

            <div className="keyword-row">
              {topic.keywords.map((keyword) => (
                <span key={keyword}>{keyword}</span>
              ))}
            </div>

            <div className="modal-reasons">
              {topic.issueReason.map((reason) => (
                <p key={reason}>{reason}</p>
              ))}
            </div>

            {topic.evidence?.length ? (
              <div className="evidence-list">
                {topic.evidence.map((item) => (
                  <a
                    key={`${item.title}-${item.link}`}
                    className="evidence-card"
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="evidence-card-meta">
                      <span className="evidence-source">{formatEvidenceSource(item.source)}</span>
                      {item.publishedAt && (
                        <time className="evidence-date" dateTime={item.publishedAt}>
                          {formatClock(item.publishedAt)}
                        </time>
                      )}
                    </div>
                    <strong>{item.title}</strong>
                    <p>{item.snippet}</p>
                  </a>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </section>
    </>
  )
}
