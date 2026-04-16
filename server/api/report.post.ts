import { reportSalary } from '../utils/storage'
import { isUuid } from '../utils/submitUtils'

export default defineEventHandler(async (event) => {

  const body = await readBody(event)
  const salaryId = typeof body?.salary_id === 'string' ? body.salary_id.trim() : ''

  if (!salaryId || !isUuid(salaryId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid salary id.' })
  }

  const result = await reportSalary(event, salaryId)
  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'Salary not found.' })
  }

  return {
    success: true,
    reportCount: result.reportCount,
    hidden: result.hidden,
  }
})
