import type { TrendTopic } from '../data/trendItems'

export function computeSimilarity(
  topics: TrendTopic[],
): Map<string, Map<string, number>> {
  const matrix = new Map<string, Map<string, number>>()

  topics.forEach((topic) => {
    matrix.set(topic.id, new Map())
  })

  for (let i = 0; i < topics.length; i += 1) {
    for (let j = i + 1; j < topics.length; j += 1) {
      const topicA = topics[i]
      const topicB = topics[j]
      const linked =
        topicA.links?.includes(topicB.id) || topicB.links?.includes(topicA.id) ? 1 : 0
      const samecat = topicA.category === topicB.category ? 1 : 0
      const setA = new Set(topicA.keywords)
      const setB = new Set(topicB.keywords)
      const inter = [...setA].filter((keyword) => setB.has(keyword)).length
      const union = new Set([...setA, ...setB]).size
      const jaccard = union > 0 ? inter / union : 0
      const similarity = Math.min(1, 0.65 * linked + 0.2 * samecat + 0.15 * jaccard)

      matrix.get(topicA.id)!.set(topicB.id, similarity)
      matrix.get(topicB.id)!.set(topicA.id, similarity)
    }
  }

  return matrix
}
