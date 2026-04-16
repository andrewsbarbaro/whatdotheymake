import { getPollVotes } from '../utils/storage'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const pollId = String(query.pollId || '')
  const optionCount = parseInt(String(query.optionCount || '3'))

  if (!pollId) {
    throw createError({ statusCode: 400, statusMessage: 'pollId is required' })
  }

  const votes = await getPollVotes(event, pollId, optionCount)
  return { pollId, votes }
})
