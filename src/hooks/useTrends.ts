import { useCallback, useEffect, useMemo, useState } from 'react'
import { buildFallbackTrends, type TrendTopic } from '../data/trendItems'

const REFRESH_INTERVAL_MS = 10 * 60 * 1000
const REFRESH_INTERVAL_SECS = 600

type TrendsResponse = {
  mode?: 'live' | 'fallback'
  topics?: TrendTopic[]
}

async function fetchTrends() {
  const response = await fetch('/api/trends')
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return (await response.json()) as TrendsResponse
}

export function useTrends() {
  const [topics, setTopics] = useState<TrendTopic[]>(() => buildFallbackTrends())
  const [status, setStatus] = useState<'loading' | 'live' | 'fallback'>('loading')
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null)
  const [refreshCountdown, setRefreshCountdown] = useState(REFRESH_INTERVAL_SECS)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const applyResponse = useCallback((data: TrendsResponse) => {
    if (!data.topics?.length) return
    setTopics(data.topics)
    setStatus(data.mode === 'live' ? 'live' : 'fallback')
  }, [])

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const data = await fetchTrends()
      applyResponse(data)
    } catch {
      setStatus((prev) => (prev === 'loading' ? 'fallback' : prev))
    } finally {
      setIsRefreshing(false)
      setLastSyncAt(new Date())
    }
  }, [applyResponse])

  useEffect(() => {
    let countdownInterval: number | null = null
    let refreshTimeout: number | null = null
    let cancelled = false

    function startCountdown() {
      if (countdownInterval !== null) clearInterval(countdownInterval)
      setRefreshCountdown(REFRESH_INTERVAL_SECS)
      countdownInterval = window.setInterval(() => {
        setRefreshCountdown((prev) => Math.max(0, prev - 1))
      }, 1000)
    }

    function scheduleNext() {
      if (refreshTimeout !== null) clearTimeout(refreshTimeout)
      refreshTimeout = window.setTimeout(async () => {
        await refresh()
        if (cancelled) return
        startCountdown()
        scheduleNext()
      }, REFRESH_INTERVAL_MS)
    }

    void refresh().then(() => {
      if (cancelled) return
      startCountdown()
      scheduleNext()
    })

    return () => {
      cancelled = true
      if (countdownInterval !== null) clearInterval(countdownInterval)
      if (refreshTimeout !== null) clearTimeout(refreshTimeout)
    }
  }, [refresh])

  const maxBuzz = useMemo(() => Math.max(...topics.map((topic) => topic.buzz)), [topics])
  const hudStatus = isRefreshing ? 'loading' : status

  const manualRefresh = useCallback(async () => {
    if (isRefreshing) return
    await refresh()
    setRefreshCountdown(REFRESH_INTERVAL_SECS)
  }, [isRefreshing, refresh])

  return {
    topics,
    status,
    hudStatus,
    lastSyncAt,
    refreshCountdown,
    isRefreshing,
    maxBuzz,
    manualRefresh,
  }
}
