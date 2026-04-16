import { querySalaries, getSalaryHistory } from '../utils/storage'
import { getLiveUsdRates } from '../utils/currency'
import { toAnnualSalary } from '../utils/analyticsConfig'
import {
  buildComparableGroupKey,
  buildComparableGroupStats,
  buildOutlierNote,
  evaluateSalaryOutlier,
  type ComparableSalaryRow,
} from '../utils/outlierAnalysis'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(query.limit as string) || 20))
  const search = typeof query.search === 'string' ? query.search.trim().slice(0, 100) : undefined
  const country = typeof query.country === 'string' ? query.country.trim().slice(0, 80) : undefined
  const currency_code = typeof query.currency_code === 'string' ? query.currency_code.trim().toUpperCase().slice(0, 3) : undefined
  const min_salary = Number.isFinite(Number(query.min_salary)) ? Math.max(0, Number(query.min_salary)) : undefined
  const max_salary = Number.isFinite(Number(query.max_salary)) ? Math.max(0, Number(query.max_salary)) : undefined
  const min_years_experience = Number.isFinite(Number(query.min_years_experience)) ? Math.max(0, Number(query.min_years_experience)) : undefined
  const max_years_experience = Number.isFinite(Number(query.max_years_experience)) ? Math.max(0, Number(query.max_years_experience)) : undefined
  const pay_type = (query.pay_type === 'salary' || query.pay_type === 'hourly') ? query.pay_type : undefined
  const work_mode = (query.work_mode === 'remote' || query.work_mode === 'hybrid' || query.work_mode === 'onsite') ? query.work_mode : undefined
  const sort = (query.sort === 'newest' || query.sort === 'oldest' || query.sort === 'salary_desc' || query.sort === 'salary_asc')
    ? query.sort
    : 'newest'

  const { salaries, total } = await querySalaries(event, {
    search,
    country,
    currency_code,
    min_salary,
    max_salary,
    min_years_experience,
    max_years_experience,
    pay_type,
    work_mode,
    sort,
    page,
    limit
  })
  const usdRates = await getLiveUsdRates()

  // Attach salary history to each result
  const ids = (salaries as any[]).map((s: any) => s.id)
  const historyMap = await getSalaryHistory(event, ids)

  const comparableRows: ComparableSalaryRow[] = (salaries as any[])
    .map((s: any) => ({
      job_title: s?.job_title ? String(s.job_title) : null,
      country: s?.country ? String(s.country) : null,
      currency_code: s?.currency_code ? String(s.currency_code) : null,
      annual_salary: toAnnualSalary(s?.salary, s?.pay_type),
    }))
    .filter((row) => Number.isFinite(row.annual_salary) && row.annual_salary > 0)

  const groups = buildComparableGroupStats(comparableRows)

  const salariesWithHistory = (salaries as any[]).map((s: any, index: number) => {
    const offset = (page - 1) * limit
    const position = offset + index + 1
    const submission_number = sort === 'oldest'
      ? position
      : Math.max(1, total - (position - 1))
    const salary = Number(s?.salary || 0)
    const currency = String(s?.currency_code || 'USD').toUpperCase()
    const rate = usdRates?.[currency]
    const usd_equivalent = (currency === 'USD' || !Number.isFinite(salary) || salary <= 0)
      ? (Number.isFinite(salary) && salary > 0 ? Math.round(salary) : null)
      : (rate && rate > 0 ? Math.round(salary / rate) : null)
    const annualSalary = toAnnualSalary(salary, s?.pay_type)
    const groupKey = buildComparableGroupKey(s?.job_title, s?.country, s?.currency_code)
    const evaluation = evaluateSalaryOutlier(annualSalary, groups.get(groupKey))
    const is_outlier = evaluation.isOutlier
    const outlier_note = buildOutlierNote(evaluation)

    return {
      ...s,
      submission_number,
      usd_equivalent,
      is_outlier,
      outlier_note,
      salary_history: historyMap[s.id] || []
    }
  })

  return {
    salaries: salariesWithHistory,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  }
})
