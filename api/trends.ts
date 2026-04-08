import {
  buildFallbackTrends,
  trendTopicSeeds,
  type TrendTopic,
} from '../src/data/trendItems'

type DataLabItem = {
  title: string
  data: Array<{
    period: string
    ratio: number
  }>
}

const anchorGroup = {
  groupName: '기준축',
  keywords: ['오늘 날씨', '날씨'],
}

function chunkTopics<T>(items: T[], size: number) {
  const chunks: T[][] = []

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }

  return chunks
}

function getLatestRatio(item?: DataLabItem) {
  return item?.data.at(-1)?.ratio ?? 0
}

async function fetchBatch(topics: typeof trendTopicSeeds) {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing NAVER_CLIENT_ID or NAVER_CLIENT_SECRET')
  }

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

  const json = (await response.json()) as { results?: DataLabItem[] }
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

async function fetchNaverTrends(): Promise<TrendTopic[]> {
  const batches = chunkTopics(trendTopicSeeds, 4)
  const responses = await Promise.all(batches.map((batch) => fetchBatch(batch)))

  return responses.flat().sort((left, right) => right.trafficScore - left.trafficScore)
}

export default async function handler(_: unknown, response: any) {
  try {
    const topics = await fetchNaverTrends()

    response.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600')
    response.status(200).json({
      mode: 'live',
      sourceLabel: 'NAVER DataLab',
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
