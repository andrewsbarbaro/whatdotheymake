import { insertFeedback } from '../utils/storage'
import { sanitizeString } from '../utils/submitUtils'

export default defineEventHandler(async (event) => {

  const body = await readBody(event)
  const message = sanitizeString(body?.message, 2000)
  if (!message || message.length < 10) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Feedback must be at least 10 characters.',
    })
  }


  await insertFeedback(event, {
    id: crypto.randomUUID(),
    message,
    created_at: new Date().toISOString(),
  })

  return { success: true }
})
