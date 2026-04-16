import { getSalaryByToken, getSalaryHistory, getSubmissionAudit } from '../utils/storage'
import { requireManagementToken } from '../utils/endpoints/managementCode'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const token = requireManagementToken(body?.token, {
    missingMessage: 'Token is required.',
    invalidMessage: "That doesn't look like a valid code.",
    errorField: 'statusMessage',
  })

  const salary = await getSalaryByToken(event, token)
  if (!salary) {
    throw createError({ statusCode: 404, statusMessage: 'No submission found with that code.' })
  }

  // Fetch salary history
  const historyMap = await getSalaryHistory(event, [salary.id])
  const salary_history = historyMap[salary.id] || []
  const submission_audit = await getSubmissionAudit(event, salary.id, 20)

  return { ...salary, salary_history, submission_audit }
})
