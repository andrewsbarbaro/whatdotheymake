import { submitPollVote } from '../utils/storage'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const pollId = String(body?.pollId || '')
  const optionIndex = parseInt(String(body?.optionIndex ?? ''))
  const optionCount = parseInt(String(body?.optionCount || '3'))

  if (!pollId || isNaN(optionIndex) || optionIndex < 0 || optionIndex >= optionCount) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid poll vote' })
  }

  const votes = await submitPollVote(event, pollId, optionIndex, optionCount)
  return { pollId, votes }
})
