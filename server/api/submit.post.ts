import { insertSalary, insertSalaryHistory, insertSubmissionAudit } from '../utils/storage'
import { moderateTextFields } from '../utils/claudeModeration'
import { estimateSalaryRange } from '../utils/claudeSalaryEstimate'
import { calculateUnderpaidScoreWithMarket, getSubmitMessage } from '../utils/salaryScoring'
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


  let marketEstimate: any = null
  try {

    marketEstimate = await estimateSalaryRange({
      job_title: row.job_title,
      city: row.city,
      state: row.state,
      country: row.country,
      currency_code: row.currency_code,
      years_experience: row.years_experience,
      company: row.company,
      level: row.level,
      work_mode: row.work_mode,
      pay_type: row.pay_type as 'salary' | 'hourly',
      bonus_percent: row.bonus_percent,
      equity_value: row.equity_value,
      education: row.education,
      is_dropout: Boolean(row.is_dropout),
      education_debt: row.education_debt,
    }, event)
  } catch (err: any) {
    throw createError({
      statusCode: err?.statusCode || 502,
      statusMessage: err?.statusMessage || 'Salary estimate failed. Try again.',
    })
  }

  if (!marketEstimate) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Salary estimate failed. Try again.',
    })
  }

  const underpaidScore = calculateUnderpaidScoreWithMarket({ salary: row.salary, yearsExp: row.years_experience, estimate: marketEstimate })

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
