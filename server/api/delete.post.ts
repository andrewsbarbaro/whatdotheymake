import { deleteSalaryByToken } from '../utils/storage'
import { requireManagementToken } from '../utils/endpoints/managementCode'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const token = requireManagementToken(body?.token, {
    missingMessage: 'Delete code is required.',
    invalidMessage: "That doesn't look like a valid delete code.",
    errorField: 'message',
  })

  const deleted = await deleteSalaryByToken(event, token)

  if (!deleted) {
    throw createError({ statusCode: 404, message: 'No submission found with that code. It may have already been deleted.' })
  }

  return { success: true, message: 'Your submission has been permanently deleted. Gone forever.' }
})
