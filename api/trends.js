import { buildFallbackTrends, trendTopicSeeds } from '../src/data/trendItems.js'

const anchorGroup = {
  groupName: '기준축',
  keywords: ['오늘 날씨', '날씨'],
}

function chunkTopics(items, size) {
  const chunks = []

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }

  return chunks
}

function getLatestRatio(item) {
  if (!item || !item.data || item.data.length === 0) {
    return 0
  }

  return item.data[item.data.length - 1].ratio ?? 0
}

function stripHtml(value = '') {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function formatPublishedAt(value) {
  if (!value) {
    return undefined
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.toISOString()
}

async function fetchBatch(topics, clientId, clientSecret) {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 6)

  const payload = {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: today.toISOString().slice(0, 10),
    timeUnit: 'date',
    keywordGroups: [
      anchorGroup,
      ...topics.map((topic) => ({
        groupName: topic.label,
        keywords: topic.keywords,
      })),
    ],
  }

  const response = await fetch('https://openapi.naver.com/v1/datalab/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Naver DataLab request failed: ${response.status}`)
  }

  const json = await response.json()
  const results = json.results ?? []
  const anchorRatio = Math.max(getLatestRatio(results[0]), 1)

  return topics.map((topic, index) => {
    const ratio = getLatestRatio(results[index + 1])
    const normalized = ratio / anchorRatio

    return {
      ...topic,
      trafficScore: Math.max(14, Math.round(normalized * 115)),
      buzz: Math.max(1400, Math.round(normalized * 16000)),
      sourceLabel: 'NAVER DataLab',
      collectedAt: new Date().toISOString(),
    }
  })
}

async function fetchSearchChannel({ clientId, clientSecret, query, path, source }) {
  const encodedQuery = encodeURIComponent(query)
  const response = await fetch(
    `https://openapi.naver.com/v1/search/${path}.json?query=${encodedQuery}&display=3&sort=date`,
    {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    },
  )

  if (!response.ok) {
    return []
  }

  const json = await response.json()
  const items = json.items ?? []

  return items
    .map((item) => ({
      source,
      title: stripHtml(item.title),
      snippet: stripHtml(item.description),
      link: item.originallink || item.link,
      publishedAt: formatPublishedAt(item.pubDate),
    }))
    .filter((item) => item.title || item.snippet)
}

async function fetchEvidence(topic, clientId, clientSecret) {
  const query = topic.keywords[0] ?? topic.label

  const [news, blogs, cafes] = await Promise.all([
    fetchSearchChannel({
      clientId,
      clientSecret,
      query,
      path: 'news',
      source: 'NEWS',
    }),
    fetchSearchChannel({
      clientId,
      clientSecret,
      query,
      path: 'blog',
      source: 'BLOG',
    }),
    fetchSearchChannel({
      clientId,
      clientSecret,
      query,
      path: 'cafearticle',
      source: 'CAFE',
    }),
  ])

  return [...news, ...blogs, ...cafes].slice(0, 5)
}

function buildIssueReason(topic, evidence) {
  if (!evidence.length) {
    return topic.issueReason
  }

  const newsItem = evidence.find((item) => item.source === 'NEWS')
  const communityItem = evidence.find((item) => item.source !== 'NEWS')
  const headline = evidence[0]
  const reasons = []

  if (headline?.title) {
    reasons.push(
      `${headline.source === 'NEWS' ? '기사' : '커뮤니티'}에서는 "${headline.title}" 같은 흐름이 먼저 크게 보이고 있어요.`,
    )
  }

  if (newsItem?.snippet) {
    reasons.push(`뉴스 반응은 ${newsItem.snippet} 같은 맥락으로 이어지고 있습니다.`)
  }

  if (communityItem?.snippet) {
    reasons.push(`블로그·카페 쪽에서는 ${communityItem.snippet} 같은 포인트가 같이 퍼지는 중이에요.`)
  }

  return reasons.slice(0, 3)
}

async function fetchNaverTrends() {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing NAVER_CLIENT_ID or NAVER_CLIENT_SECRET')
  }

  const batches = chunkTopics(trendTopicSeeds, 4)
  const responses = await Promise.all(
    batches.map((batch) => fetchBatch(batch, clientId, clientSecret)),
  )
  const rankedTopics = responses.flat().sort((left, right) => right.trafficScore - left.trafficScore)

  return Promise.all(
    rankedTopics.map(async (topic) => {
      const evidence = await fetchEvidence(topic, clientId, clientSecret)

      return {
        ...topic,
        sourceLabel: evidence.length ? 'NAVER DataLab + Search' : 'NAVER DataLab',
        issueReason: buildIssueReason(topic, evidence),
        evidence,
      }
    }),
  )
}

export default async function handler(_, response) {
  try {
    const topics = await fetchNaverTrends()

    response.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600')
    response.status(200).json({
      mode: 'live',
      sourceLabel: 'NAVER DataLab + Search',
      topics,
    })
  } catch (error) {
    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900')
    response.status(200).json({
      mode: 'fallback',
      sourceLabel: '데모 트렌드',
      reason:
        error instanceof Error
          ? error.message
          : 'Fallback data returned because live trend data is unavailable.',
      topics: buildFallbackTrends(),
    })
  }
}
