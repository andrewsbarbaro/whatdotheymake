import { insertSalary, insertSalaryHistory, insertSubmissionAudit, getComparableSalaryStats } from '../utils/storage'
import { moderateTextFields } from '../utils/kimiModeration'
import { calculateUnderpaidScoreFromDatabase, getSubmitMessage } from '../utils/salaryScoring'
import { generateManagementToken, hashManagementToken } from '../utils/managementToken'
import { normalizeSubmissionFields } from '../utils/endpoints/submissionFields'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const normalized = normalizeSubmissionFields(body, {
    jobTitleRequiredMessage: 'Job title is required. What do you do??',
    salaryRequiredMessage: 'Salary is required. Spill the beans! 🫘',
    errorField: 'message',
  })

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
  const originalSalary = salary
  if (normalized.isAnonymized) {
    const fuzz = Math.floor(Math.random() * 1001) + 1000
    const direction = Math.random() > 0.5 ? 1 : -1
    salary = Math.max(0, salary + (direction * fuzz))
  }

  const managementToken = generateManagementToken()
  const tokenHash = await hashManagementToken(managementToken)

  const row = {
    id: crypto.randomUUID(),
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
    report_count: 0,
    is_anonymized: normalized.isAnonymized ? 1 : 0,
    delete_token: tokenHash,
    created_at: new Date().toISOString(),
  }


  const dbStats = await getComparableSalaryStats(event, {
    job_title: row.job_title,
    currency_code: row.currency_code,
  })

  const underpaidScore = dbStats
    ? calculateUnderpaidScoreFromDatabase({
        salary: row.salary,
        yearsExp: row.years_experience,
        low: dbStats.low,
        median: dbStats.median,
        high: dbStats.high,
        sampleCount: dbStats.count,
      })
    : calculateUnderpaidScoreLegacy(row.salary, row.years_experience)

  const marketEstimate = dbStats
    ? { low: dbStats.low, median: dbStats.median, high: dbStats.high, confidence: Math.min(1, (dbStats.count - 3) / 17) }
    : undefined

  await insertSalary(event, row)

  if (normalized.salaryHistoryDrafts.length > 0) {
    const historyEntries = normalized.salaryHistoryDrafts.map((entry) => ({
      id: crypto.randomUUID(),
      salary_id: row.id,
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
    salary_id: row.id,
    event_type: 'created',
    summary: 'Submission created.',
    created_at: new Date().toISOString(),
  })

  return {
    success: true,
    id: row.id,
    salary: row.salary,
    currency_code: row.currency_code,
    originalSalary,
    wasAnonymized: normalized.isAnonymized,
    managementToken,
    deleteToken: managementToken,
    underpaidScore,
    message: getSubmitMessage(underpaidScore.score),
    marketEstimate: marketEstimate || undefined,
  }
})
