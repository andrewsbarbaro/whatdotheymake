import { ANALYTICS_CONFIG } from './analyticsConfig'

type ComparableGroupStats = {
  n: number
  sum: number
  sumSq: number
}

export type ComparableSalaryRow = {
  job_title: string | null
  country: string | null
  currency_code: string | null
  annual_salary: number
}

export type OutlierEvaluation = {
  hasComparableSample: boolean
  peerSampleSize: number
  mean: number
  std: number
  zScore: number
  isExtremeHigh: boolean
  isExtremeLow: boolean
  isHighStatOutlier: boolean
  isLowStatOutlier: boolean
  isStatOutlier: boolean
  isHighOutlier: boolean
  isLowOutlier: boolean
  isOutlier: boolean
}

export function buildComparableGroupKey(jobTitle: unknown, country: unknown, currencyCode: unknown): string {
  return [
    String(jobTitle || '').trim().toLowerCase(),
    String(country || '').trim().toLowerCase(),
    String(currencyCode || '').trim().toUpperCase(),
  ].join('|')
}

export function buildComparableGroupStats(rows: ComparableSalaryRow[]): Map<string, ComparableGroupStats> {
  const groups = new Map<string, ComparableGroupStats>()

  for (const row of rows) {
    const salary = Number(row.annual_salary || 0)
    if (!Number.isFinite(salary) || salary <= 0) continue

    const key = buildComparableGroupKey(row.job_title, row.country, row.currency_code)
    const cur = groups.get(key) || { n: 0, sum: 0, sumSq: 0 }
    cur.n += 1
    cur.sum += salary
    cur.sumSq += salary * salary
    groups.set(key, cur)
  }

  return groups
}

export function evaluateSalaryOutlier(annualSalary: number, comparableGroup?: ComparableGroupStats): OutlierEvaluation {
  const salary = Number(annualSalary || 0)
  const group = comparableGroup
  const hasComparableSample = !!group && group.n >= ANALYTICS_CONFIG.outliers.comparableSampleMinSize
  const mean = group && group.n > 0 ? (group.sum / group.n) : 0
  const variance = group && group.n > 0 ? Math.max(0, (group.sumSq / group.n) - (mean * mean)) : 0
  const std = Math.sqrt(variance)
  const zScore = std > 0 ? (salary - mean) / std : 0

  const isExtremeHigh = salary >= ANALYTICS_CONFIG.outliers.extremeHighAnnual
  const isExtremeLow = salary > 0 && salary <= ANALYTICS_CONFIG.outliers.extremeLowAnnual

  const isHighStatOutlier = salary > 0
    && hasComparableSample
    && std > 0
    && zScore >= ANALYTICS_CONFIG.outliers.highZScoreThreshold
    && salary >= ANALYTICS_CONFIG.outliers.highStatMinAnnualSalary

  const lowEndFloor = Math.max(
    ANALYTICS_CONFIG.outliers.extremeLowAnnual,
    mean * ANALYTICS_CONFIG.outliers.lowFloorRatio
  )

  const isLowStatOutlier = salary > 0
    && hasComparableSample
    && std > 0
    && zScore <= ANALYTICS_CONFIG.outliers.lowZScoreThreshold
    && salary <= lowEndFloor

  const isStatOutlier = isHighStatOutlier || isLowStatOutlier
  const isHighOutlier = isExtremeHigh || isHighStatOutlier
  const isLowOutlier = isExtremeLow || isLowStatOutlier
  const isOutlier = isHighOutlier || isLowOutlier

  return {
    hasComparableSample,
    peerSampleSize: group?.n || 0,
    mean,
    std,
    zScore,
    isExtremeHigh,
    isExtremeLow,
    isHighStatOutlier,
    isLowStatOutlier,
    isStatOutlier,
    isHighOutlier,
    isLowOutlier,
    isOutlier,
  }
}

export function buildOutlierNote(evaluation: OutlierEvaluation): string | null {
  if (!evaluation.isOutlier) return null

  const zAbs = Math.abs(evaluation.zScore)

  if ((evaluation.isExtremeHigh || evaluation.isExtremeLow) && !evaluation.hasComparableSample) {
    return 'Flagged: this value is far outside typical ranges, and there are fewer than 5 comparable submissions for reliable verification.'
  }

  if (evaluation.isHighStatOutlier) {
    return `Flagged: this value is significantly above comparable submissions (${evaluation.peerSampleSize} peers, z-score ${zAbs.toFixed(1)}).`
  }

  if (evaluation.isLowStatOutlier) {
    return `Flagged: this value is significantly below comparable submissions (${evaluation.peerSampleSize} peers, z-score ${zAbs.toFixed(1)}).`
  }

  if (evaluation.isExtremeHigh) {
    return 'Flagged: this value is far above the expected range and may reflect incorrect units, typo, or unverified data.'
  }

  if (evaluation.isExtremeLow) {
    return 'Flagged: this value is far below the expected range and may reflect incorrect units, typo, or unverified data.'
  }

  return 'Flagged: this value is unusually far from comparable submissions and could not be confidently validated.'
}
