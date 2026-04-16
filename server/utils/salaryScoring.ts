import type { SalaryEstimate } from './claudeSalaryEstimate'

export type UnderpaidScore = { score: number; tier: string; emoji: string }

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function calculateUnderpaidScoreLegacy(salary: number, yearsExp?: number | null): UnderpaidScore {
  let score = 50

  if (salary < 40000) score = 90
  else if (salary < 55000) score = 75
  else if (salary < 75000) score = 60
  else if (salary < 100000) score = 50
  else if (salary < 130000) score = 40
  else if (salary < 175000) score = 30
  else if (salary < 250000) score = 20
  else score = 10

  if (yearsExp) {
    if (yearsExp > 10 && salary < 100000) score += 15
    else if (yearsExp > 5 && salary < 75000) score += 10
    else if (yearsExp > 3 && salary < 55000) score += 10
    else if (yearsExp > 15 && salary > 200000) score -= 10
  }

  score = clamp(score, 0, 100)
  return tierForScore(score)
}

export function calculateUnderpaidScoreWithMarket(opts: {
  salary: number
  yearsExp?: number | null
  estimate: SalaryEstimate
}): UnderpaidScore {
  const { salary, yearsExp, estimate } = opts

  const median = Number(estimate?.median || 0)
  const low = Number(estimate?.low || 0)
  const high = Number(estimate?.high || 0)
  const confidence = clamp(Number(estimate?.confidence ?? 0.5), 0, 1)

  // AI-only: this scorer requires a valid market estimate.
  if (!Number.isFinite(median) || median <= 0) {
    throw new Error('Invalid market salary estimate (median)')
  }

  // Ratio vs median.
  const ratio = salary / median
  // Base: ratio=1 => 50, with a softer slope than before to reduce false positives.
  let score = 50 + (1 - ratio) * 55

  // Small neutral zone around median.
  if (ratio >= 0.92 && ratio <= 1.08) {
    score = 50 + (score - 50) * 0.35
  }

  // If they're below the estimated p25, treat as underpaid only when model confidence is reasonable.
  if (confidence >= 0.65 && low > 0 && salary < low * 0.92) score = Math.max(score, 72)

  // If they're above the estimated p75 by a lot, treat as \"overpaid\" only with reasonable confidence.
  if (confidence >= 0.65 && high > 0 && salary > high * 1.2) score = Math.min(score, 28)

  // Experience adjustment (light): if you're very experienced and still below market, bump score.
  if (yearsExp && yearsExp >= 10 && ratio < 0.9) score += 8
  if (yearsExp && yearsExp >= 15 && ratio < 0.85) score += 6
  // Pull low-confidence estimates toward neutral to avoid overconfident labels.
  const confidenceWeight = 0.35 + (0.65 * confidence)
  score = 50 + (score - 50) * confidenceWeight

  score = clamp(score, 0, 100)
  return tierForScore(score)
}

export function tierForScore(score: number): UnderpaidScore {
  const s = clamp(Math.round(score), 0, 100)

  const tiers = [
    { min: 80, tier: 'Highway Robbery', emoji: '🚨' },
    { min: 60, tier: 'Definitely Underpaid', emoji: '😤' },
    { min: 40, tier: "It's Fine™", emoji: '😐' },
    { min: 20, tier: 'Living Good', emoji: '😎' },
    { min: 0, tier: 'Overpaid Legend', emoji: '🤑' },
  ]

  for (const t of tiers) {
    if (s >= t.min) return { score: s, tier: t.tier, emoji: t.emoji }
  }

  return { score: s, tier: "It's Fine™", emoji: '😐' }
}

export function getSubmitMessage(score: number): string {
  if (score >= 80) return 'This looks significantly below the estimated market range for similar roles.'
  if (score >= 60) return 'This appears below market for similar roles.'
  if (score >= 40) return 'This appears roughly in line with many comparable submissions.'
  if (score >= 20) return 'This appears above many comparable submissions.'
  return 'This appears at the high end of comparable submissions.'
}
