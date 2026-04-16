import { getSalaryByToken, updateSalaryByToken, deleteSalaryHistory, insertSalaryHistory, insertSubmissionAudit } from '../utils/storage'
import { moderateTextFields } from '../utils/claudeModeration'
import { requireManagementToken } from '../utils/endpoints/managementCode'
import { normalizeSubmissionFields } from '../utils/endpoints/submissionFields'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const token = requireManagementToken(body?.token, {
    missingMessage: 'Token is required.',
    invalidMessage: 'Invalid code.',
    errorField: 'statusMessage',
  })

  const normalized = normalizeSubmissionFields(body, {
    jobTitleRequiredMessage: 'Job title is required.',
    salaryRequiredMessage: 'Salary is required.',
    errorField: 'statusMessage',
  })

  const existing = await getSalaryByToken(event, token)
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'No submission found with that code.' })
  }

  const assessment = await moderateTextFields(normalized.fieldsToModerate, event)
  if (!assessment.allow) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Keep it clean. Offensive language is not allowed.',
      data: {
        violations: assessment.violations,
      },
    })
  }

  let salary = normalized.salary
  if (normalized.isAnonymized) {
    const fuzz = Math.floor(Math.random() * 1001) + 1000
    const direction = Math.random() > 0.5 ? 1 : -1
    salary = Math.max(0, salary + (direction * fuzz))
  }

  const updated = await updateSalaryByToken(event, token, {
    job_title: normalized.jobTitle,
    salary,
    pay_type: normalized.payType,
    bonus_percent: normalized.bonusPercent,
    company: normalized.company,
    city: normalized.city,
    state: normalized.state,
    country: normalized.country,
    years_experience: normalized.yearsExperience,
    currency_code: normalized.currencyCode,
    level: normalized.level,
    work_mode: normalized.workMode,
    equity_value: normalized.equityValue,
    education: normalized.education,
    is_dropout: normalized.isDropout,
    education_debt: normalized.educationDebt,
    car: normalized.car,
    is_anonymized: normalized.isAnonymized ? 1 : 0,
  })

  if (!updated) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to update. Try again.' })
  }

  await deleteSalaryHistory(event, existing.id)
  if (normalized.salaryHistoryDrafts.length > 0) {
    const historyEntries = normalized.salaryHistoryDrafts.map((entry) => ({
      id: crypto.randomUUID(),
      salary_id: existing.id,
      year: entry.year,
      job_title: entry.job_title,
      salary: entry.salary,
      company: entry.company,
      sort_order: entry.sort_order,
    }))
    await insertSalaryHistory(event, historyEntries as any)
  }

  await insertSubmissionAudit(event, {
    id: crypto.randomUUID(),
    salary_id: existing.id,
    event_type: 'edited',
    summary: 'Submission edited via management code.',
    created_at: new Date().toISOString(),
  })

  return { success: true, message: 'Your submission has been updated. Change history has been recorded.' }
})
