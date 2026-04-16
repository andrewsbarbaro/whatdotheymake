export const ANALYTICS_CONFIG = {
  annualHoursPerYear: 2080,
  hourlyInputAnnualCutoff: 1000,
  reportHideThreshold: 30,
  insightsSalaryMinAnnual: 15_000,
  insightsSalaryMaxAnnual: 1_000_000,
  submissionTrendDays: 30,
  marketHeatmapWeeks: 3,
  marketHeatmapTopRolesLimit: 8,
  leaderboardLimit: 10,
  leaderboardPrimaryMinSampleSize: 2,
  outliers: {
    extremeHighAnnual: 1_000_000,
    extremeLowAnnual: 15_000,
    comparableSampleMinSize: 5,
    highZScoreThreshold: 3.5,
    lowZScoreThreshold: -3,
    highStatMinAnnualSalary: 300_000,
    lowFloorRatio: 0.35,
    forensicsQueryLimit: 10_000,
    topRolesLimit: 8,
  },
} as const

export const ANNUAL_SALARY_SQL_EXPRESSION = `
CASE
  WHEN pay_type = 'hourly' AND salary <= ${ANALYTICS_CONFIG.hourlyInputAnnualCutoff} THEN salary * ${ANALYTICS_CONFIG.annualHoursPerYear}
  ELSE salary
END
`.trim()

export const INSIGHTS_ANNUAL_SALARY_SQL_FILTER = `
(${ANNUAL_SALARY_SQL_EXPRESSION}) BETWEEN ${ANALYTICS_CONFIG.insightsSalaryMinAnnual} AND ${ANALYTICS_CONFIG.insightsSalaryMaxAnnual}
`.trim()

export function toAnnualSalary(salary: unknown, payType: unknown): number {
  const s = Number(salary || 0)
  if (!Number.isFinite(s) || s <= 0) return 0

  const pt = String(payType || 'salary')
  if (pt === 'hourly') {
    if (s > ANALYTICS_CONFIG.hourlyInputAnnualCutoff) return s
    return s * ANALYTICS_CONFIG.annualHoursPerYear
  }

  return s
}

export function isInsightsSalaryInRange(annualSalary: number): boolean {
  return Number.isFinite(annualSalary)
    && annualSalary >= ANALYTICS_CONFIG.insightsSalaryMinAnnual
    && annualSalary <= ANALYTICS_CONFIG.insightsSalaryMaxAnnual
}
