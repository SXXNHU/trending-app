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
    `https://openapi.naver.com/v1/search/${path}.json?query=${encodedQuery}&display=${path === 'news' ? 8 : 4}&sort=date`,
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

function decodeScriptString(value = '') {
  return value
    .replace(/\\u003c/g, '<')
    .replace(/\\u003e/g, '>')
    .replace(/\\u0026/g, '&')
    .replace(/\\u0027/g, "'")
    .replace(/\\u0026quot;/g, '"')
    .replace(/\\"/g, '"')
}

function extractNewsItemsFromScript(script) {
  const decoded = decodeScriptString(script)
  const chunks = decoded.split('"templateId":"newsItem"')
  const items = []

  for (let index = 0; index < chunks.length - 1; index += 1) {
    const chunk = chunks[index]
    const titleMatch = chunk.match(/"title":"([^"]+)"/g)
    const hrefMatch = chunk.match(/"titleHref":"([^"]+)"/g)
    const contentMatch = chunk.match(/"content":"([^"]*)"/g)

    const rawTitle = titleMatch?.[titleMatch.length - 1]?.match(/"title":"([^"]+)"/)?.[1]
    const rawHref = hrefMatch?.[hrefMatch.length - 1]?.match(/"titleHref":"([^"]+)"/)?.[1]
    const rawContent = contentMatch?.[contentMatch.length - 1]?.match(/"content":"([^"]*)"/)?.[1]

    if (!rawTitle || !rawHref) {
      continue
    }

    items.push({
      source: 'NEWS',
      title: stripHtml(rawTitle),
      snippet: stripHtml(rawContent ?? ''),
      link: stripHtml(rawHref),
      publishedAt: undefined,
    })
  }

  return items
}

async function fetchNaverNewsFragmentEvidence(query) {
  const encodedQuery = encodeURIComponent(query)
  const response = await fetch(
    `https://s.search.naver.com/p/newssearch/3/api/tab/more?query=${encodedQuery}&where=news&ssc=tab.news.all&sort=0&start=1`,
  )

  if (!response.ok) {
    return []
  }

  const json = await response.json()
  const script = json.collection?.[0]?.script ?? ''
  const items = extractNewsItemsFromScript(script)

  return items.filter((item) => item.title || item.snippet).slice(0, 8)
}

async function fetchEvidence(topic, clientId, clientSecret) {
  const query = topic.keywords[0] ?? topic.label

  const [newsApi, blogs, cafes, newsFragment] = await Promise.all([
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
    fetchNaverNewsFragmentEvidence(query),
  ])

  const news = newsFragment.length ? newsFragment : newsApi
  return [...news.slice(0, 8), ...blogs.slice(0, 4), ...cafes.slice(0, 4)]
}

function buildIssueReason(topic, evidence) {
  const newsItems = evidence.filter((item) => item.source === 'NEWS')

  if (!newsItems.length) {
    return topic.issueReason
  }

  const reasons = []
  const first = newsItems[0]
  const second = newsItems[1]

  reasons.push(`네이버 기사에서는 "${first.title}" 같은 흐름이 먼저 크게 보이고 있어요.`)

  if (first.snippet) {
    reasons.push(`핵심 맥락은 ${first.snippet} 같은 내용으로 모이고 있습니다.`)
  }

  if (second?.title) {
    reasons.push(`비슷한 시점의 다른 기사들도 "${second.title}" 같은 포인트를 함께 짚고 있어요.`)
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
