import { createError } from 'h3'
import {
  collectFieldsToModerate,
  normalizeCountry,
  normalizeCurrencyCode,
  normalizeEquityValue,
  normalizeLevel,
  normalizeWorkMode,
  parseSalaryHistoryDrafts,
  sanitizeString,
  type SalaryHistoryDraft,
} from '../submitUtils'

type ErrorField = 'message' | 'statusMessage'

type NormalizeSubmissionOptions = {
  jobTitleRequiredMessage: string
  salaryRequiredMessage: string
  errorField: ErrorField
}

export type NormalizedSubmissionFields = {
  jobTitle: string
  salary: number
  payType: 'salary' | 'hourly'
  bonusPercent: number | null
  company: string | null
  city: string | null
  state: string | null
  country: string | null
  currencyCode: string
  yearsExperience: number | null
  level: string | null
  workMode: 'remote' | 'hybrid' | 'onsite' | null
  equityValue: number | null
  education: string | null
  isDropout: number
  educationDebt: number | null
  car: string | null
  isAnonymized: boolean
  salaryHistoryDrafts: SalaryHistoryDraft[]
  fieldsToModerate: Record<string, string>
}

export function normalizeSubmissionFields(body: any, options: NormalizeSubmissionOptions): NormalizedSubmissionFields {
  const throwValidationError = (message: string) => {
    throw createError({
      statusCode: 400,
      [options.errorField]: message,
    } as any)
  }

  if (!body?.job_title || typeof body.job_title !== 'string') {
    throwValidationError(options.jobTitleRequiredMessage)
  }
  if (!body?.salary || typeof body.salary !== 'number' || body.salary < 0) {
    throwValidationError(options.salaryRequiredMessage)
  }

  const jobTitleSanitized = sanitizeString(body.job_title, 150)
  if (!jobTitleSanitized) {
    throwValidationError(options.jobTitleRequiredMessage)
  }
  const jobTitle = jobTitleSanitized as string

  const payType: 'salary' | 'hourly' = body.pay_type === 'hourly' ? 'hourly' : 'salary'
  const bonusPercent = (typeof body.bonus_percent === 'number' && Number.isFinite(body.bonus_percent))
    ? Math.max(0, Math.min(200, Math.round(body.bonus_percent)))
    : null

  const company = sanitizeString(body.company, 150)
  const city = sanitizeString(body.city, 100)
  const state = sanitizeString(body.state, 50)
  const country = normalizeCountry(body.country)
  const currencyCode = normalizeCurrencyCode(body.currency_code) || 'USD'
  const level = normalizeLevel(body.level)
  const workMode = normalizeWorkMode(body.work_mode)
  const equityValue = normalizeEquityValue(body.equity_value)
  const education = sanitizeString(body.education, 100)
  const car = sanitizeString(body.car, 100)
  const yearsExperience = typeof body.years_experience === 'number'
    ? Math.max(0, Math.min(50, body.years_experience))
    : null
  const isDropout = body.is_dropout === true ? 1 : 0
  const educationDebt = typeof body.education_debt === 'number' ? Math.max(0, body.education_debt) : null
  const isAnonymized = body.is_anonymized === true

  const { rawHistory, drafts: salaryHistoryDrafts } = parseSalaryHistoryDrafts(body.salary_history, sanitizeString)

  const fieldsToModerate = collectFieldsToModerate({
    jobTitle,
    company,
    city,
    state,
    country,
    car,
    rawHistory,
    sanitize: sanitizeString,
  })

  return {
    jobTitle,
    salary: Math.round(body.salary),
    payType,
    bonusPercent,
    company,
    city,
    state,
    country,
    currencyCode,
    yearsExperience,
    level,
    workMode,
    equityValue,
    education,
    isDropout,
    educationDebt,
    car,
    isAnonymized,
    salaryHistoryDrafts,
    fieldsToModerate,
  }
}
