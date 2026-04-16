import { getJobTitleSuggestions } from '../utils/storage'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : ''
  const limit = Math.min(20, Math.max(1, Number(query.limit) || 8))

  if (!q) return { suggestions: [] }

  const suggestions = await getJobTitleSuggestions(event, q, limit)
  return { suggestions }
})
