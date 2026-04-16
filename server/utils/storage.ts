import type { H3Event } from 'h3'
import { hashManagementToken } from './managementToken'
import {
  ANALYTICS_CONFIG,
  ANNUAL_SALARY_SQL_EXPRESSION,
  INSIGHTS_ANNUAL_SALARY_SQL_FILTER,
  isInsightsSalaryInRange,
  toAnnualSalary,
} from './analyticsConfig'
import {
  buildComparableGroupKey,
  buildComparableGroupStats,
  evaluateSalaryOutlier,
  type ComparableSalaryRow,
} from './outlierAnalysis'

// ============================================================
// Dev fallback: in-memory store so `nuxt dev` works without wrangler
// ============================================================
interface SalaryRow {
  id: string
  job_title: string
  salary: number
  pay_type: string
  bonus_percent: number | null
  company: string | null
  city: string | null
  state: string | null
  country: string | null
  currency_code: string | null
  years_experience: number | null
  level: string | null
  work_mode: string | null
  equity_value: number | null
  education: string | null
  is_dropout: number
  education_debt: number | null
  car: string | null
  report_count: number
  is_anonymized: number
  // Stores the hashed management token for new submissions.
  // Legacy rows may still contain plaintext UUID tokens.
  delete_token: string
  created_at: string
}

const US_STATE_CODES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI',
  'MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT',
  'VT','VA','WA','WV','WI','WY','DC'
])

const devSalaries: SalaryRow[] = []
interface SubmissionAuditEvent {
  id: string
  salary_id: string
  event_type: 'created' | 'edited'
  summary: string | null
  created_at: string
}
const devSubmissionAudit: SubmissionAuditEvent[] = []
let submissionAuditTableReady = false
type FeedbackRow = {
  id: string
  message: string
  created_at: string
}
const devFeedback: FeedbackRow[] = []
let feedbackTableReady = false


// ============================================================
// Bindings
// ============================================================
export function getBindings(event: H3Event) {
  const cf = (event.context as any).cloudflare
  return {
    db: cf?.env?.DB ?? null,
  }
}

export function isDev() {
  return process.env.NODE_ENV === 'development' || import.meta.dev
}

const REPORT_HIDE_THRESHOLD = ANALYTICS_CONFIG.reportHideThreshold

function stripPrivateFields(row: SalaryRow): Omit<SalaryRow, 'delete_token'> {
  const { delete_token, ...rest } = row
  return rest
}

async function resolveTokenCandidates(token: string): Promise<string[]> {
  const hashed = await hashManagementToken(token)
  return hashed === token ? [token] : [hashed, token]
}

async function migrateLegacyTokenIfNeeded(event: H3Event, salaryId: string, storedToken: string, rawToken: string, hashedToken: string) {
  if (storedToken !== rawToken) return

  const { db } = getBindings(event)
  if (db) {
    await db.prepare('UPDATE salaries SET delete_token = ?1 WHERE id = ?2').bind(hashedToken, salaryId).run()
    return
  }

  const row = devSalaries.find(r => r.id === salaryId)
  if (row) row.delete_token = hashedToken
}

async function findSalaryByToken(event: H3Event, token: string): Promise<SalaryRow | null> {
  const { db } = getBindings(event)
  const [hashedToken, rawToken] = await resolveTokenCandidates(token)

  if (db) {
    const row = await db.prepare(`
      SELECT id, job_title, salary, pay_type, bonus_percent, company, city, state, country, currency_code, years_experience, level, work_mode, equity_value, education, is_dropout, education_debt, car, report_count, is_anonymized, delete_token, created_at
      FROM salaries
      WHERE delete_token = ?1 OR delete_token = ?2
      LIMIT 1
    `).bind(hashedToken, rawToken).first()

    if (!row) return null
    const salaryRow = row as SalaryRow
    await migrateLegacyTokenIfNeeded(event, salaryRow.id, salaryRow.delete_token, rawToken, hashedToken)
    if (salaryRow.delete_token === rawToken) {
      salaryRow.delete_token = hashedToken
    }
    return salaryRow
  }

  const found = devSalaries.find(r => r.delete_token === hashedToken || r.delete_token === rawToken)
  if (!found) return null

  await migrateLegacyTokenIfNeeded(event, found.id, found.delete_token, rawToken, hashedToken)
  if (found.delete_token === rawToken) {
    found.delete_token = hashedToken
  }
  return found
}

async function ensureSubmissionAuditTable(db: any) {
  if (submissionAuditTableReady) return

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS submission_audit (
      id TEXT PRIMARY KEY,
      salary_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      summary TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (salary_id) REFERENCES salaries(id) ON DELETE CASCADE
    )
  `).run()
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_submission_audit_salary_id ON submission_audit(salary_id, created_at DESC)').run()
  submissionAuditTableReady = true
}
async function ensureFeedbackTable(db: any) {
  if (feedbackTableReady) return

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run()
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC)').run()
  feedbackTableReady = true
}

// ============================================================
// DB helpers — dev fallback uses in-memory array
// ============================================================
export async function insertSalary(event: H3Event, row: SalaryRow) {
  const { db } = getBindings(event)

  if (db) {
    await db.prepare(`
      INSERT INTO salaries (id, job_title, salary, pay_type, bonus_percent, company, city, state, country, currency_code, years_experience, level, work_mode, equity_value, education, is_dropout, education_debt, car, report_count, is_anonymized, delete_token, created_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22)
    `).bind(
      row.id, row.job_title, row.salary, row.pay_type, row.bonus_percent, row.company, row.city, row.state, row.country, row.currency_code,
      row.years_experience, row.level, row.work_mode, row.equity_value, row.education, row.is_dropout, row.education_debt, row.car, row.report_count ?? 0, row.is_anonymized, row.delete_token, row.created_at
    ).run()
    return
  }

  // Dev fallback
  row.report_count = Number(row.report_count || 0)
  devSalaries.unshift(row)
}

export async function insertFeedback(event: H3Event, row: FeedbackRow): Promise<void> {
  const { db } = getBindings(event)
  if (db) {
    await ensureFeedbackTable(db)
    await db.prepare(`
      INSERT INTO feedback (id, message, created_at)
      VALUES (?1, ?2, ?3)
    `).bind(row.id, row.message, row.created_at).run()
    return
  }

  devFeedback.unshift(row)
}

export async function getSalaryByToken(event: H3Event, token: string): Promise<Omit<SalaryRow, 'delete_token'> | null> {
  const found = await findSalaryByToken(event, token)
  if (!found) return null
  return stripPrivateFields(found)
}

export async function updateSalaryByToken(event: H3Event, token: string, fields: Partial<Omit<SalaryRow, 'id' | 'created_at'>>): Promise<boolean> {
  const found = await findSalaryByToken(event, token)
  if (!found) return false
  const { db } = getBindings(event)

  if (db) {
    const sets: string[] = []
    const values: any[] = []
    let idx = 1

    const allowed = ['job_title', 'salary', 'pay_type', 'bonus_percent', 'company', 'city', 'state', 'country', 'currency_code', 'years_experience', 'level', 'work_mode', 'equity_value', 'education', 'is_dropout', 'education_debt', 'car', 'is_anonymized'] as const
    for (const key of allowed) {
      if (key in fields) {
        sets.push(`${key} = ?${idx}`)
        values.push((fields as any)[key])
        idx++
      }
    }

    if (sets.length === 0) return false

    values.push(found.id)
    const result = await db.prepare(
      `UPDATE salaries SET ${sets.join(', ')} WHERE id = ?${idx}`
    ).bind(...values).run()
    return (result?.meta?.changes ?? 0) > 0
  }

  // Dev fallback
  const row = devSalaries.find(r => r.id === found.id)
  if (!row) return false
  Object.assign(row, fields)
  return true
}

export async function deleteSalaryHistory(event: H3Event, salaryId: string): Promise<void> {
  const { db } = getBindings(event)
  if (db) {
    await db.prepare('DELETE FROM salary_history WHERE salary_id = ?1').bind(salaryId).run()
    return
  }
  // Dev fallback
  for (let i = devHistory.length - 1; i >= 0; i--) {
    if (devHistory[i].salary_id === salaryId) devHistory.splice(i, 1)
  }
}

export async function deleteSalaryByToken(event: H3Event, token: string): Promise<boolean> {
  const found = await findSalaryByToken(event, token)
  if (!found) return false
  const { db } = getBindings(event)

  if (db) {
    const result = await db.prepare('DELETE FROM salaries WHERE id = ?1').bind(found.id).run()
    return (result?.meta?.changes ?? 0) > 0
  }

  // Dev fallback
  const idx = devSalaries.findIndex(r => r.id === found.id)
  if (idx !== -1) {
    devSalaries.splice(idx, 1)
    return true
  }
  return false
}


export async function querySalaries(event: H3Event, opts: {
  search?: string
  country?: string
  currency_code?: string
  min_salary?: number
  max_salary?: number
  min_years_experience?: number
  max_years_experience?: number
  pay_type?: 'salary' | 'hourly'
  work_mode?: 'remote' | 'hybrid' | 'onsite'
  sort?: 'newest' | 'oldest' | 'salary_desc' | 'salary_asc'
  page: number
  limit: number
}) {
  const { db } = getBindings(event)
  const offset = (opts.page - 1) * opts.limit
  const cols = 'id, job_title, salary, pay_type, bonus_percent, company, city, state, country, currency_code, years_experience, level, work_mode, equity_value, education, is_dropout, education_debt, car, report_count, is_anonymized, created_at'

  if (db) {
    const whereClauses: string[] = []
    const whereValues: any[] = []

    whereClauses.push(`(report_count IS NULL OR report_count < ${REPORT_HIDE_THRESHOLD})`)

    if (opts.search) {
      const pattern = `%${opts.search}%`
      whereClauses.push('(job_title LIKE ? OR company LIKE ? OR city LIKE ? OR country LIKE ?)')
      whereValues.push(pattern, pattern, pattern, pattern)
    }

    if (opts.country) {
      whereClauses.push('LOWER(country) = LOWER(?)')
      whereValues.push(opts.country)
    }

    if (opts.currency_code) {
      whereClauses.push('currency_code = ?')
      whereValues.push(opts.currency_code)
    }

    if (typeof opts.min_salary === 'number' && Number.isFinite(opts.min_salary)) {
      whereClauses.push('salary >= ?')
      whereValues.push(Math.max(0, Math.round(opts.min_salary)))
    }

    if (typeof opts.max_salary === 'number' && Number.isFinite(opts.max_salary)) {
      whereClauses.push('salary <= ?')
      whereValues.push(Math.max(0, Math.round(opts.max_salary)))
    }

    if (typeof opts.min_years_experience === 'number' && Number.isFinite(opts.min_years_experience)) {
      whereClauses.push('years_experience IS NOT NULL AND years_experience >= ?')
      whereValues.push(Math.max(0, Math.round(opts.min_years_experience)))
    }

    if (typeof opts.max_years_experience === 'number' && Number.isFinite(opts.max_years_experience)) {
      whereClauses.push('years_experience IS NOT NULL AND years_experience <= ?')
      whereValues.push(Math.max(0, Math.round(opts.max_years_experience)))
    }

    if (opts.pay_type === 'salary' || opts.pay_type === 'hourly') {
      whereClauses.push('pay_type = ?')
      whereValues.push(opts.pay_type)
    }

    if (opts.work_mode === 'remote' || opts.work_mode === 'hybrid' || opts.work_mode === 'onsite') {
      whereClauses.push('work_mode = ?')
      whereValues.push(opts.work_mode)
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const orderSql =
      opts.sort === 'oldest' ? 'ORDER BY created_at ASC' :
      opts.sort === 'salary_desc' ? 'ORDER BY salary DESC, created_at DESC' :
      opts.sort === 'salary_asc' ? 'ORDER BY salary ASC, created_at DESC' :
      'ORDER BY created_at DESC'
    const results = await db.prepare(
      `SELECT ${cols} FROM salaries ${whereSql} ${orderSql} LIMIT ? OFFSET ?`
    ).bind(...whereValues, opts.limit, offset).all()

    const statsRow = await db.prepare(
      `SELECT COUNT(*) as total, AVG(salary) as mean, AVG(salary * salary) as mean2 FROM salaries ${whereSql}`
    ).bind(...whereValues).first()

    const total = Number(statsRow?.total || 0)
    const mean = Number(statsRow?.mean || 0)
    const mean2 = Number(statsRow?.mean2 || 0)
    const variance = Math.max(0, mean2 - mean * mean)
    const std = Math.sqrt(variance)

    return {
      salaries: results?.results || [],
      total,
      stats: { mean, std },
    }
  }

  const strip = (rows: SalaryRow[]) => rows.map(({ delete_token, ...rest }) => rest)

  let filtered = devSalaries.filter(r => Number(r.report_count || 0) < REPORT_HIDE_THRESHOLD)
  if (opts.search) {
    const s = opts.search.toLowerCase()
    filtered = filtered.filter(r =>
      r.job_title.toLowerCase().includes(s)
      || (r.company && r.company.toLowerCase().includes(s))
      || (r.city && r.city.toLowerCase().includes(s))
      || (r.country && r.country.toLowerCase().includes(s))
    )
  }

  if (opts.country) {
    const country = String(opts.country).toLowerCase()
    filtered = filtered.filter(r => String(r.country || '').toLowerCase() === country)
  }

  if (opts.currency_code) {
    filtered = filtered.filter(r => r.currency_code === opts.currency_code)
  }

  if (typeof opts.min_salary === 'number' && Number.isFinite(opts.min_salary)) {
    const minSalary = Math.max(0, Math.round(opts.min_salary))
    filtered = filtered.filter(r => Number(r.salary || 0) >= minSalary)
  }

  if (typeof opts.max_salary === 'number' && Number.isFinite(opts.max_salary)) {
    const maxSalary = Math.max(0, Math.round(opts.max_salary))
    filtered = filtered.filter(r => Number(r.salary || 0) <= maxSalary)
  }

  if (typeof opts.min_years_experience === 'number' && Number.isFinite(opts.min_years_experience)) {
    const minExp = Math.max(0, Math.round(opts.min_years_experience))
    filtered = filtered.filter(r => Number.isFinite(Number(r.years_experience)) && Number(r.years_experience) >= minExp)
  }

  if (typeof opts.max_years_experience === 'number' && Number.isFinite(opts.max_years_experience)) {
    const maxExp = Math.max(0, Math.round(opts.max_years_experience))
    filtered = filtered.filter(r => Number.isFinite(Number(r.years_experience)) && Number(r.years_experience) <= maxExp)
  }

  if (opts.pay_type === 'salary' || opts.pay_type === 'hourly') {
    filtered = filtered.filter(r => String(r.pay_type || '') === opts.pay_type)
  }

  if (opts.work_mode === 'remote' || opts.work_mode === 'hybrid' || opts.work_mode === 'onsite') {
    filtered = filtered.filter(r => String(r.work_mode || '').toLowerCase() === opts.work_mode)
  }

  if (opts.sort === 'oldest') {
    filtered = [...filtered].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
  } else if (opts.sort === 'salary_desc') {
    filtered = [...filtered].sort((a, b) => Number(b.salary || 0) - Number(a.salary || 0))
  } else if (opts.sort === 'salary_asc') {
    filtered = [...filtered].sort((a, b) => Number(a.salary || 0) - Number(b.salary || 0))
  } else {
    filtered = [...filtered].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
  }

  const total = filtered.length
  if (total === 0) {
    return { salaries: [], total: 0, stats: { mean: 0, std: 0 } }
  }

  let sum = 0
  let sumSq = 0
  for (const r of filtered) {
    const x = Number(r.salary || 0)
    sum += x
    sumSq += x * x
  }

  const mean = sum / total
  const mean2 = sumSq / total
  const variance = Math.max(0, mean2 - mean * mean)
  const std = Math.sqrt(variance)

  return {
    salaries: strip(filtered.slice(offset, offset + opts.limit)),
    total,
    stats: { mean, std },
  }
}

export async function reportSalary(event: H3Event, salaryId: string): Promise<{ reportCount: number; hidden: boolean } | null> {
  const { db } = getBindings(event)

  if (db) {
    await db.prepare(`
      UPDATE salaries
      SET report_count = MIN(${REPORT_HIDE_THRESHOLD}, COALESCE(report_count, 0) + 1)
      WHERE id = ?1
    `).bind(salaryId).run()

    const row = await db.prepare('SELECT report_count FROM salaries WHERE id = ?1').bind(salaryId).first()
    if (!row) return null
    const reportCount = Number((row as any).report_count || 0)
    return { reportCount, hidden: reportCount >= REPORT_HIDE_THRESHOLD }
  }

  const row = devSalaries.find(r => r.id === salaryId)
  if (!row) return null
  row.report_count = Math.min(REPORT_HIDE_THRESHOLD, Number(row.report_count || 0) + 1)
  return { reportCount: row.report_count, hidden: row.report_count >= REPORT_HIDE_THRESHOLD }
}

export async function getJobTitleSuggestions(event: H3Event, q: string, limit = 8): Promise<string[]> {
  const query = String(q || '').trim()
  if (!query) return []
  const safeLimit = Math.max(1, Math.min(20, Math.round(limit)))
  const { db } = getBindings(event)

  if (db) {
    const pattern = `${query}%`
    const rows = await db.prepare(`
      SELECT job_title, COUNT(*) as c
      FROM salaries
      WHERE job_title IS NOT NULL
        AND TRIM(job_title) != ''
        AND job_title LIKE ?1
      GROUP BY job_title
      ORDER BY c DESC, job_title ASC
      LIMIT ?2
    `).bind(pattern, safeLimit).all()

    return ((rows?.results || []) as Array<{ job_title: string }>).map(r => String(r.job_title))
  }

  const lower = query.toLowerCase()
  const counts = new Map<string, number>()
  for (const row of devSalaries) {
    const title = String(row.job_title || '').trim()
    if (!title) continue
    if (!title.toLowerCase().startsWith(lower)) continue
    counts.set(title, (counts.get(title) || 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, safeLimit)
    .map(([title]) => title)
}

function normalizeState(input: string | null): string | null {
  if (!input) return null
  let s = String(input).trim()
  if (!s) return null

  // If someone shoved "Remote, Indiana" or similar in, take the last segment.
  if (s.includes(',')) s = s.split(',').pop()?.trim() || s

  const upper = s.toUpperCase()
  if (upper.length === 2) return upper

  const map: Record<string, string> = {
    ALABAMA: 'AL', ALASKA: 'AK', ARIZONA: 'AZ', ARKANSAS: 'AR', CALIFORNIA: 'CA', COLORADO: 'CO', CONNECTICUT: 'CT',
    DELAWARE: 'DE', FLORIDA: 'FL', GEORGIA: 'GA', HAWAII: 'HI', IDAHO: 'ID', ILLINOIS: 'IL', INDIANA: 'IN',
    IOWA: 'IA', KANSAS: 'KS', KENTUCKY: 'KY', LOUISIANA: 'LA', MAINE: 'ME', MARYLAND: 'MD', MASSACHUSETTS: 'MA',
    MICHIGAN: 'MI', MINNESOTA: 'MN', MISSISSIPPI: 'MS', MISSOURI: 'MO', MONTANA: 'MT', NEBRASKA: 'NE', NEVADA: 'NV',
    'NEW HAMPSHIRE': 'NH', 'NEW JERSEY': 'NJ', 'NEW MEXICO': 'NM', 'NEW YORK': 'NY', 'NORTH CAROLINA': 'NC',
    'NORTH DAKOTA': 'ND', OHIO: 'OH', OKLAHOMA: 'OK', OREGON: 'OR', PENNSYLVANIA: 'PA', 'RHODE ISLAND': 'RI',
    'SOUTH CAROLINA': 'SC', 'SOUTH DAKOTA': 'SD', TENNESSEE: 'TN', TEXAS: 'TX', UTAH: 'UT', VERMONT: 'VT',
    VIRGINIA: 'VA', WASHINGTON: 'WA', 'WEST VIRGINIA': 'WV', WISCONSIN: 'WI', WYOMING: 'WY',
    'D.C.': 'DC', DC: 'DC', 'DISTRICT OF COLUMBIA': 'DC',
  }

  return map[upper] || upper
}

function normalizeCarMake(input: string | null): string | null {
  if (!input) return null
  const raw = String(input).trim()
  if (!raw) return null

  // Strip a leading year (e.g. "2018 Mazda 6")
  const s = raw.replace(/^\d{4}\s+/, '')
  const make = s.split(/\s+/)[0]
  if (!make) return null

  // Normalize common casing
  return make.charAt(0).toUpperCase() + make.slice(1).toLowerCase()
}

function normalizeCountryForGrouping(input: string | null): string {
  const trimmed = String(input || '').trim()
  if (!trimmed) return 'unknown country'
  const lower = trimmed.toLowerCase()
  if (['usa', 'us', 'u.s.', 'u.s.a.', 'united states', 'united states of america'].includes(lower)) return 'united states'
  if (['uk', 'u.k.', 'great britain', 'britain', 'england'].includes(lower)) return 'united kingdom'
  if (['uae', 'u.a.e.'].includes(lower)) return 'united arab emirates'
  return lower
}

function normalizeWorkModeForGrouping(input: string | null): string | null {
  const v = String(input || '').trim().toLowerCase()
  if (!v) return null
  if (v === 'remote') return 'Remote'
  if (v === 'hybrid') return 'Hybrid'
  if (v === 'onsite') return 'Onsite'
  return v.charAt(0).toUpperCase() + v.slice(1)
}

function normalizeEducationForGrouping(input: string | null, isDropout?: number | boolean | null): string | null {
  const v = String(input || '').trim()
  if (!v) return null
  const lower = v.toLowerCase()

  if (isDropout) return 'College Dropout'
  if (lower === 'high school') return 'High School'
  if (lower === 'some college') return 'Some College'
  if (lower === 'college dropout') return 'College Dropout'
  if (lower === "bachelor's" || lower === 'bachelors' || lower === 'bachelor') return "Bachelor's"
  if (lower === "master's" || lower === 'masters' || lower === 'master') return "Master's"
  if (lower === 'phd' || lower === 'ph.d') return 'PhD'
  if (lower === 'self-taught' || lower === 'self taught') return 'Self-taught'
  if (lower === 'bootcamp') return 'Bootcamp'
  if (lower === 'trade school') return 'Trade School'
  return v
}

function buildMeanLeaderboard<T extends string>(rows: Array<{ key: T; salary: number }>, minCount = ANALYTICS_CONFIG.leaderboardPrimaryMinSampleSize) {
  const map = new Map<T, { key: T; count: number; sum: number }>()
  for (const r of rows) {
    const cur = map.get(r.key) || { key: r.key, count: 0, sum: 0 }
    cur.count++
    cur.sum += Number(r.salary || 0)
    map.set(r.key, cur)
  }

  const compute = (threshold: number) => [...map.values()]
    .filter(x => x.count >= threshold)
    .map(x => ({ key: x.key, count: x.count, mean_salary: x.sum / x.count }))
    .sort((a, b) => (b.mean_salary as number) - (a.mean_salary as number))
    .slice(0, ANALYTICS_CONFIG.leaderboardLimit)

  // If dataset is sparse, fall back to showing whatever we have.
  const primary = compute(minCount)
  if (primary.length > 0) return primary
  return compute(1)
}

type SubmissionTrendPoint = { date: string; count: number }

function toUtcDateKey(input: Date): string {
  return input.toISOString().slice(0, 10)
}

function buildRecentUtcDateKeys(days: number): string[] {
  const normalizedDays = Math.max(1, Math.min(365, Math.round(days)))
  const now = new Date()
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

  const keys: string[] = []
  for (let i = normalizedDays - 1; i >= 0; i--) {
    const d = new Date(todayUtc)
    d.setUTCDate(todayUtc.getUTCDate() - i)
    keys.push(toUtcDateKey(d))
  }
  return keys
}

function buildSubmissionTrendSeries(rows: Array<{ day: string; count: number }>, days = ANALYTICS_CONFIG.submissionTrendDays): SubmissionTrendPoint[] {
  const keys = buildRecentUtcDateKeys(days)
  const counts = new Map<string, number>()

  for (const row of rows) {
    const day = String(row?.day || '').slice(0, 10)
    if (!day) continue
    counts.set(day, Number(row?.count || 0))
  }

  return keys.map((date) => ({ date, count: counts.get(date) || 0 }))
}

function extractDateKey(value: string | null | undefined): string | null {
  const raw = String(value || '').trim()
  if (!raw) return null

  const m = raw.match(/(\d{4}-\d{2}-\d{2})/)
  if (m?.[1]) return m[1]

  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return null
  return toUtcDateKey(d)
}

export type MapLocationRow = {
  city: string | null
  state: string | null
  country: string | null
  count: number
}

export async function getMapLocations(event: H3Event, limit = 100): Promise<MapLocationRow[]> {
  const { db } = getBindings(event)
  const safeLimit = Math.max(25, Math.min(1000, Math.round(limit || 100)))

  if (db) {
    const result = await db.prepare(`
      SELECT city, state, country, COUNT(*) as count
      FROM salaries
      WHERE country IS NOT NULL
        AND TRIM(country) != ''
        AND (report_count IS NULL OR report_count < ${REPORT_HIDE_THRESHOLD})
      GROUP BY city, state, country
      ORDER BY count DESC
      LIMIT ?1
    `).bind(safeLimit).all()

    return ((result?.results || []) as any[]).map((r) => ({
      city: r.city ? String(r.city) : null,
      state: r.state ? String(r.state) : null,
      country: r.country ? String(r.country) : null,
      count: Number(r.count || 0),
    }))
  }

  const grouped = new Map<string, MapLocationRow>()
  for (const row of devSalaries) {
    if (Number(row.report_count || 0) >= REPORT_HIDE_THRESHOLD) continue
    const country = String(row.country || '').trim()
    if (!country) continue
    const city = String(row.city || '').trim() || null
    const state = String(row.state || '').trim() || null
    const key = `${city || ''}|${state || ''}|${country}`
    const existing = grouped.get(key)
    if (existing) {
      existing.count += 1
    } else {
      grouped.set(key, { city, state, country, count: 1 })
    }
  }

  return [...grouped.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, safeLimit)
}

export async function getStats(event: H3Event) {
  const { db } = getBindings(event)

  if (db) {
    const trendStart = buildRecentUtcDateKeys(ANALYTICS_CONFIG.submissionTrendDays)[0]

    const [totalResult, dropoutStats, carRows, stateAgg, carAgg, jobAgg, workModeAgg, trendRows, bonusAgg, educationAgg, bonusBreakdownAgg, yearsExperienceAgg] = await Promise.all([
      db.prepare('SELECT COUNT(*) as total FROM salaries').first(),
      db.prepare(`
        SELECT is_dropout, COUNT(*) as count, MAX(salary) as top_salary
        FROM salaries GROUP BY is_dropout
      `).all(),
      db.prepare(`
        SELECT job_title, salary, car, company FROM salaries
        WHERE car IS NOT NULL AND car != ''
        ORDER BY created_at DESC LIMIT 20
      `).all(),

      // Aggregate first by RAW user input, then normalize/merge in JS.
      // This avoids sampling (previously LIMIT 5000) while keeping normalization logic.
      db.prepare(`
        SELECT state as raw_state,
               country as raw_country,
               currency_code as raw_currency_code,
               COUNT(*) as count,
               SUM(${ANNUAL_SALARY_SQL_EXPRESSION}) as sum_salary
        FROM salaries
        WHERE state IS NOT NULL AND state != '' AND salary IS NOT NULL AND salary > 0
          AND ${INSIGHTS_ANNUAL_SALARY_SQL_FILTER}
        GROUP BY state, country, currency_code
      `).all(),
      db.prepare(`
        SELECT car as raw_car,
               COUNT(*) as count,
               SUM(${ANNUAL_SALARY_SQL_EXPRESSION}) as sum_salary
        FROM salaries
        WHERE car IS NOT NULL AND car != '' AND salary IS NOT NULL AND salary > 0
          AND ${INSIGHTS_ANNUAL_SALARY_SQL_FILTER}
        GROUP BY car
      `).all(),
      db.prepare(`
        SELECT job_title as raw_job_title,
               COUNT(*) as count,
               SUM(${ANNUAL_SALARY_SQL_EXPRESSION}) as sum_salary
        FROM salaries
        WHERE job_title IS NOT NULL AND TRIM(job_title) != '' AND salary IS NOT NULL AND salary > 0
          AND ${INSIGHTS_ANNUAL_SALARY_SQL_FILTER}
        GROUP BY job_title
      `).all(),
      db.prepare(`
        SELECT LOWER(work_mode) as raw_work_mode,
               COUNT(*) as count,
               SUM(${ANNUAL_SALARY_SQL_EXPRESSION}) as sum_salary
        FROM salaries
        WHERE work_mode IS NOT NULL AND TRIM(work_mode) != '' AND salary IS NOT NULL AND salary > 0
          AND LOWER(work_mode) IN ('remote', 'hybrid', 'onsite')
          AND ${INSIGHTS_ANNUAL_SALARY_SQL_FILTER}
        GROUP BY LOWER(work_mode)
      `).all(),
      db.prepare(`
        SELECT DATE(created_at) as day, COUNT(*) as count
        FROM salaries
        WHERE DATE(created_at) >= DATE(?1)
        GROUP BY day
        ORDER BY day ASC
      `).bind(trendStart).all(),
      db.prepare(`
        SELECT COUNT(*) as count, AVG(bonus_percent) as avg_bonus_percent
        FROM salaries
        WHERE bonus_percent IS NOT NULL AND bonus_percent > 0 AND bonus_percent <= 200
      `).first(),
      db.prepare(`
        SELECT education as raw_education,
               is_dropout as raw_is_dropout,
               COUNT(*) as count,
               SUM(${ANNUAL_SALARY_SQL_EXPRESSION}) as sum_salary
        FROM salaries
        WHERE education IS NOT NULL AND TRIM(education) != '' AND salary IS NOT NULL AND salary > 0
          AND ${INSIGHTS_ANNUAL_SALARY_SQL_FILTER}
        GROUP BY education, is_dropout
      `).all(),
      db.prepare(`
        SELECT CAST(ROUND(bonus_percent) AS INTEGER) as bonus_percent,
               COUNT(*) as count
        FROM salaries
        WHERE bonus_percent IS NOT NULL AND bonus_percent > 0 AND bonus_percent <= 200
        GROUP BY CAST(ROUND(bonus_percent) AS INTEGER)
        ORDER BY count DESC, bonus_percent DESC
        LIMIT 10
      `).all(),
      db.prepare(`
        SELECT CAST(ROUND(years_experience) AS INTEGER) as raw_years_experience,
               COUNT(*) as count,
               SUM(${ANNUAL_SALARY_SQL_EXPRESSION}) as sum_salary
        FROM salaries
        WHERE years_experience IS NOT NULL AND years_experience >= 0 AND salary IS NOT NULL AND salary > 0
          AND ${INSIGHTS_ANNUAL_SALARY_SQL_FILTER}
        GROUP BY CAST(ROUND(years_experience) AS INTEGER)
      `).all(),
    ])

    type AggRow = { count: number; sum_salary: number }

    const mergeAgg = <T extends string>(
      rows: Array<{ raw: string; count: number; sum_salary: number }>,
      normalize: (raw: string | null) => T | null
    ) => {
      const map = new Map<T, AggRow>()
      for (const r of rows) {
        const key = normalize(r.raw)
        if (!key) continue
        const cur = map.get(key) || { count: 0, sum_salary: 0 }
        cur.count += Number(r.count || 0)
        cur.sum_salary += Number(r.sum_salary || 0)
        map.set(key, cur)
      }

      const toSorted = (minCount: number) => [...map.entries()]
        .map(([key, v]) => ({ key, count: v.count, mean_salary: v.count > 0 ? v.sum_salary / v.count : 0 }))
        .filter(x => x.count >= minCount)
        .sort((a, b) => b.mean_salary - a.mean_salary)
        .slice(0, ANALYTICS_CONFIG.leaderboardLimit)

      const primary = toSorted(ANALYTICS_CONFIG.leaderboardPrimaryMinSampleSize)
      return primary.length ? primary : toSorted(1)
    }

    const stateAggRows = (stateAgg?.results || []) as Array<{ raw_state: string; raw_country: string | null; raw_currency_code: string | null; count: number; sum_salary: number }>
    const carAggRows = (carAgg?.results || []) as Array<{ raw_car: string; count: number; sum_salary: number }>
    const jobAggRows = (jobAgg?.results || []) as Array<{ raw_job_title: string; count: number; sum_salary: number }>
    const workModeAggRows = (workModeAgg?.results || []) as Array<{ raw_work_mode: string; count: number; sum_salary: number }>
    const educationAggRows = (educationAgg?.results || []) as Array<{ raw_education: string; raw_is_dropout: number | null; count: number; sum_salary: number }>
    const bonusBreakdownRows = (bonusBreakdownAgg?.results || []) as Array<{ bonus_percent: number; count: number }>
    const yearsExperienceAggRows = (yearsExperienceAgg?.results || []) as Array<{ raw_years_experience: number; count: number; sum_salary: number }>

    const salaryByState = mergeAgg(
      stateAggRows.map(r => ({
        raw: (() => {
          const stateKey = normalizeState(r.raw_state) || String(r.raw_state || '').trim()
          let countryKey = normalizeCountryForGrouping(r.raw_country)
          if (countryKey === 'unknown country' && US_STATE_CODES.has(String(stateKey || '').toUpperCase())) {
            countryKey = 'united states'
          }
          return `${stateKey}|${countryKey}|${String(r.raw_currency_code || '').trim().toUpperCase()}`
        })(),
        count: r.count,
        sum_salary: r.sum_salary
      })),
      (raw) => {
        if (!raw) return null
        const [state, country, currency] = String(raw).split('|')
        if (!state) return null
        const countryLabel = country || 'Unknown country'
        const currencyLabel = currency || 'UNK'
        return `${state} · ${countryLabel} (${currencyLabel})`
      }
    ).map(r => ({ state: r.key, count: r.count, mean_salary: r.mean_salary }))

    const salaryByCar = mergeAgg(
      carAggRows.map(r => ({
        raw: `${normalizeCarMake(r.raw_car) || String(r.raw_car || '').trim()}`,
        count: r.count,
        sum_salary: r.sum_salary
      })),
      (raw) => {
        if (!raw) return null
        const [car] = String(raw).split('|')
        if (!car) return null
        return `${car}`
      }
    ).map(r => ({ car: r.key, count: r.count, mean_salary: r.mean_salary }))

    const salaryByJobTitle = mergeAgg(
      jobAggRows.map(r => ({
        raw: `${String(r.raw_job_title || '').trim()}`,
        count: r.count,
        sum_salary: r.sum_salary
      })),
      (raw) => {
        if (!raw) return null
        const [jobTitle] = String(raw).split('|')
        if (!jobTitle) return null
        return `${jobTitle}`
      }
    ).map(r => ({ job_title: r.key, count: r.count, mean_salary: r.mean_salary }))

    const salaryByWorkMode = mergeAgg(
      workModeAggRows.map(r => ({
        raw: `${normalizeWorkModeForGrouping(r.raw_work_mode) || ''}`,
        count: r.count,
        sum_salary: r.sum_salary
      })),
      (raw) => {
        if (!raw) return null
        const [workMode] = String(raw).split('|')
        if (!workMode) return null
        return `${workMode}`
      }
    ).map(r => ({ work_mode: r.key, count: r.count, mean_salary: r.mean_salary }))

    const salaryByEducation = mergeAgg(
      educationAggRows.map(r => ({
        raw: `${normalizeEducationForGrouping(r.raw_education, r.raw_is_dropout) || ''}`,
        count: r.count,
        sum_salary: r.sum_salary
      })),
      (raw) => {
        if (!raw) return null
        const [education] = String(raw).split('|')
        if (!education) return null
        return `${education}`
      }
    ).map(r => ({ education: r.key, count: r.count, mean_salary: r.mean_salary }))

    const bonusBreakdown = bonusBreakdownRows
      .map(r => ({ bonus_percent: Math.round(Number(r.bonus_percent || 0)), count: Number(r.count || 0) }))
      .filter(r => Number.isFinite(r.bonus_percent) && r.bonus_percent > 0 && r.count > 0)
      .sort((a, b) => b.count - a.count || b.bonus_percent - a.bonus_percent)
      .slice(0, ANALYTICS_CONFIG.leaderboardLimit)

    const salaryByYearsExperienceRaw = yearsExperienceAggRows
      .map(r => ({
        years_experience: Math.max(0, Math.round(Number(r.raw_years_experience || 0))),
        count: Number(r.count || 0),
        mean_salary: Number(r.count || 0) > 0 ? Number(r.sum_salary || 0) / Number(r.count || 0) : 0
      }))
      .filter(r => Number.isFinite(r.years_experience) && r.years_experience >= 0 && r.years_experience <= 60 && r.count > 0)
    const salaryByYearsExperiencePrimary = salaryByYearsExperienceRaw
      .filter(r => r.count >= ANALYTICS_CONFIG.leaderboardPrimaryMinSampleSize)
      .sort((a, b) => a.years_experience - b.years_experience)
      .slice(0, 20)
    const salaryByYearsExperience = (salaryByYearsExperiencePrimary.length ? salaryByYearsExperiencePrimary : salaryByYearsExperienceRaw
      .sort((a, b) => a.years_experience - b.years_experience)
      .slice(0, 20))

    const submissionsOverTime = buildSubmissionTrendSeries(
      (trendRows?.results || []) as Array<{ day: string; count: number }>,
      ANALYTICS_CONFIG.submissionTrendDays
    )

    return {
      totalSubmissions: Number((totalResult as any)?.total || 0),
      dropoutStats: dropoutStats?.results || [],
      carMismatches: carRows?.results || [],
      salaryByState,
      salaryByCar,
      salaryByJobTitle,
      salaryByWorkMode,
      avgBonusPercent: Number((bonusAgg as any)?.avg_bonus_percent || 0),
      bonusSampleSize: Number((bonusAgg as any)?.count || 0),
      bonusBreakdown,
      salaryByEducation,
      salaryByYearsExperience,
      submissionsOverTime,
    }
  }

  // Dev fallback
  const totalSubmissions = devSalaries.length

  const salaryByState = buildMeanLeaderboard(
    devSalaries
      .map(r => ({ key: normalizeState(r.state), salary: toAnnualSalary(r.salary, r.pay_type) }))
      .filter(r => Boolean(r.key) && isInsightsSalaryInRange(r.salary)) as Array<{ key: string; salary: number }>
  ).map(r => ({ state: r.key, count: r.count, mean_salary: r.mean_salary }))

  const salaryByCar = buildMeanLeaderboard(
    devSalaries
      .map(r => ({ key: normalizeCarMake(r.car), salary: toAnnualSalary(r.salary, r.pay_type) }))
      .filter(r => Boolean(r.key) && isInsightsSalaryInRange(r.salary)) as Array<{ key: string; salary: number }>
  ).map(r => ({ car: r.key, count: r.count, mean_salary: r.mean_salary }))

  const salaryByJobTitle = buildMeanLeaderboard(
    devSalaries
      .map(r => {
        const title = String(r.job_title || '').trim()
        if (!title) return null
        return { key: title, salary: toAnnualSalary(r.salary, r.pay_type) }
      })
      .filter(r => Boolean(r && r.key) && isInsightsSalaryInRange(Number((r as any)?.salary || 0))) as Array<{ key: string; salary: number }>
  ).map(r => ({ job_title: r.key, count: r.count, mean_salary: r.mean_salary }))

  const salaryByWorkMode = buildMeanLeaderboard(
    devSalaries
      .map(r => {
        const mode = normalizeWorkModeForGrouping(r.work_mode)
        if (!mode) return null
        if (!['Remote', 'Hybrid', 'Onsite'].includes(mode)) return null
        return { key: mode, salary: toAnnualSalary(r.salary, r.pay_type) }
      })
      .filter(r => Boolean(r && r.key) && isInsightsSalaryInRange(Number((r as any)?.salary || 0))) as Array<{ key: string; salary: number }>
  ).map(r => ({ work_mode: r.key, count: r.count, mean_salary: r.mean_salary }))

  const salaryByEducation = buildMeanLeaderboard(
    devSalaries
      .map(r => {
        const education = normalizeEducationForGrouping(r.education, r.is_dropout)
        if (!education) return null
        return { key: education, salary: toAnnualSalary(r.salary, r.pay_type) }
      })
      .filter(r => Boolean(r && r.key) && isInsightsSalaryInRange(Number((r as any)?.salary || 0))) as Array<{ key: string; salary: number }>
  ).map(r => ({ education: r.key, count: r.count, mean_salary: r.mean_salary }))

  const bonusRows = devSalaries.filter(r => {
    const v = Number(r.bonus_percent)
    return Number.isFinite(v) && v > 0 && v <= 200
  })
  const bonusSampleSize = bonusRows.length
  const avgBonusPercent = bonusSampleSize > 0
    ? bonusRows.reduce((sum, r) => sum + Number(r.bonus_percent || 0), 0) / bonusSampleSize
    : 0
  const bonusBreakdownMap = new Map<number, number>()
  for (const row of bonusRows) {
    const bonus = Math.round(Number(row.bonus_percent || 0))
    if (!Number.isFinite(bonus) || bonus <= 0) continue
    bonusBreakdownMap.set(bonus, (bonusBreakdownMap.get(bonus) || 0) + 1)
  }
  const bonusBreakdown = [...bonusBreakdownMap.entries()]
    .map(([bonus_percent, count]) => ({ bonus_percent, count }))
    .sort((a, b) => b.count - a.count || b.bonus_percent - a.bonus_percent)
    .slice(0, ANALYTICS_CONFIG.leaderboardLimit)

  const yearsExpMap = new Map<number, { count: number; sum: number }>()
  for (const row of devSalaries) {
    const years = Number(row.years_experience)
    const annualSalary = toAnnualSalary(row.salary, row.pay_type)
    if (!Number.isFinite(years) || years < 0 || years > 60) continue
    if (!isInsightsSalaryInRange(annualSalary)) continue
    const yearsKey = Math.round(years)
    const cur = yearsExpMap.get(yearsKey) || { count: 0, sum: 0 }
    cur.count += 1
    cur.sum += annualSalary
    yearsExpMap.set(yearsKey, cur)
  }
  const salaryByYearsExperienceRaw = [...yearsExpMap.entries()]
    .map(([years_experience, v]) => ({ years_experience, count: v.count, mean_salary: v.count > 0 ? v.sum / v.count : 0 }))
    .sort((a, b) => a.years_experience - b.years_experience)
  const salaryByYearsExperiencePrimary = salaryByYearsExperienceRaw
    .filter(r => r.count >= ANALYTICS_CONFIG.leaderboardPrimaryMinSampleSize)
    .slice(0, 20)
  const salaryByYearsExperience = (salaryByYearsExperiencePrimary.length ? salaryByYearsExperiencePrimary : salaryByYearsExperienceRaw.slice(0, 20))

  const trendMap = new Map<string, number>()
  for (const row of devSalaries) {
    const day = extractDateKey(row.created_at)
    if (!day) continue
    trendMap.set(day, (trendMap.get(day) || 0) + 1)
  }

  const submissionsOverTime = buildSubmissionTrendSeries(
    [...trendMap.entries()].map(([day, count]) => ({ day, count })),
    ANALYTICS_CONFIG.submissionTrendDays
  )

  return {
    totalSubmissions,
    dropoutStats: [],
    carMismatches: devSalaries.filter(r => r.car).slice(0, 20),
    salaryByState,
    salaryByCar,
    salaryByJobTitle,
    salaryByWorkMode,
    avgBonusPercent,
    bonusSampleSize,
    bonusBreakdown,
    salaryByEducation,
    salaryByYearsExperience,
    submissionsOverTime,
  }
}

type OutlierRoleRow = {
  job_title: string
  sample_size: number
  outlier_count: number
  outlier_rate: number
}

export type OutlierForensicsResult = {
  sample_size: number
  total_outliers: number
  high_outliers: number
  low_outliers: number
  statistical_outliers: number
  verification_limited_outliers: number
  comparable_sample_coverage: number
  outlier_rate: number
  top_outlier_roles: OutlierRoleRow[]
}

type HeatmapRow = {
  job_title: string
  counts: number[]
  total: number
  change_pct: number
}

export type MarketHeatmapResult = {
  weeks: string[]
  rows: HeatmapRow[]
  max_cell_count: number
}

function startOfUtcWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay()
  const diff = (day + 6) % 7 // Monday=0
  d.setUTCDate(d.getUTCDate() - diff)
  return d
}

function weekKey(date: Date): string {
  return startOfUtcWeek(date).toISOString().slice(0, 10)
}

function buildRecentWeekKeys(weeks: number): string[] {
  const now = new Date()
  const current = startOfUtcWeek(now)
  const keys: string[] = []
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(current)
    d.setUTCDate(current.getUTCDate() - (i * 7))
    keys.push(d.toISOString().slice(0, 10))
  }
  return keys
}

function formatWeekLabel(weekStartKey: string): string {
  const d = new Date(`${weekStartKey}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return weekStartKey
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export async function getOutlierForensics(event: H3Event): Promise<OutlierForensicsResult> {
  const { db } = getBindings(event)
  let rows: ComparableSalaryRow[] = []

  if (db) {
    const result = await db.prepare(`
      SELECT job_title,
             country,
             currency_code,
             ${ANNUAL_SALARY_SQL_EXPRESSION} as annual_salary
      FROM salaries
      WHERE salary IS NOT NULL AND salary > 0
        AND (report_count IS NULL OR report_count < ${REPORT_HIDE_THRESHOLD})
        AND ${INSIGHTS_ANNUAL_SALARY_SQL_FILTER}
      LIMIT ${ANALYTICS_CONFIG.outliers.forensicsQueryLimit}
    `).all()

    rows = ((result?.results || []) as any[]).map(r => ({
      job_title: r.job_title ? String(r.job_title) : null,
      country: r.country ? String(r.country) : null,
      currency_code: r.currency_code ? String(r.currency_code) : null,
      annual_salary: Number(r.annual_salary || 0),
    }))
  } else {
    rows = devSalaries
      .filter(r => Number(r.report_count || 0) < REPORT_HIDE_THRESHOLD)
      .map(r => ({
        job_title: r.job_title || null,
        country: r.country || null,
        currency_code: r.currency_code || null,
        annual_salary: toAnnualSalary(r.salary, r.pay_type),
      }))
      .filter(r => isInsightsSalaryInRange(r.annual_salary))
  }

  const groups = buildComparableGroupStats(rows)
  const byRole = new Map<string, { sample_size: number; outlier_count: number }>()
  let sample_size = 0
  let high_outliers = 0
  let low_outliers = 0
  let statistical_outliers = 0
  let verification_limited_outliers = 0
  let comparable_sample_count = 0

  for (const row of rows) {
    const salary = Number(row.annual_salary || 0)
    if (!isInsightsSalaryInRange(salary)) continue
    sample_size += 1

    const key = buildComparableGroupKey(row.job_title, row.country, row.currency_code)
    const evaluation = evaluateSalaryOutlier(salary, groups.get(key))
    if (evaluation.hasComparableSample) comparable_sample_count += 1
    if (evaluation.isExtremeHigh) high_outliers += 1
    if (evaluation.isExtremeLow) low_outliers += 1
    if (evaluation.isStatOutlier) statistical_outliers += 1
    if (evaluation.isOutlier && !evaluation.hasComparableSample) verification_limited_outliers += 1

    const roleKey = String(row.job_title || '').trim() || 'Unknown role'
    const cur = byRole.get(roleKey) || { sample_size: 0, outlier_count: 0 }
    cur.sample_size += 1
    if (evaluation.isOutlier) cur.outlier_count += 1
    byRole.set(roleKey, cur)
  }

  const total_outliers = [...byRole.values()].reduce((sum, r) => sum + Number(r.outlier_count || 0), 0)
  const outlier_rate = sample_size > 0 ? total_outliers / sample_size : 0
  const comparable_sample_coverage = sample_size > 0 ? comparable_sample_count / sample_size : 0

  const top_outlier_roles: OutlierRoleRow[] = [...byRole.entries()]
    .map(([job_title, v]) => ({
      job_title,
      sample_size: v.sample_size,
      outlier_count: v.outlier_count,
      outlier_rate: v.sample_size > 0 ? v.outlier_count / v.sample_size : 0,
    }))
    .filter(r => r.sample_size >= ANALYTICS_CONFIG.outliers.comparableSampleMinSize && r.outlier_count > 0)
    .sort((a, b) => b.outlier_rate - a.outlier_rate || b.outlier_count - a.outlier_count)
    .slice(0, ANALYTICS_CONFIG.outliers.topRolesLimit)

  return {
    sample_size,
    total_outliers,
    high_outliers,
    low_outliers,
    statistical_outliers,
    verification_limited_outliers,
    comparable_sample_coverage,
    outlier_rate,
    top_outlier_roles,
  }
}

export async function getMarketHeatmap(event: H3Event): Promise<MarketHeatmapResult> {
  const { db } = getBindings(event)
  const weekKeys = buildRecentWeekKeys(ANALYTICS_CONFIG.marketHeatmapWeeks)
  const startWeekKey = weekKeys[0]

  let rows: Array<{ job_title: string | null; created_at: string | null }> = []
  if (db) {
    const result = await db.prepare(`
      SELECT job_title, created_at
      FROM salaries
      WHERE job_title IS NOT NULL AND TRIM(job_title) != ''
        AND DATE(created_at) >= DATE(?1)
        AND (report_count IS NULL OR report_count < ${REPORT_HIDE_THRESHOLD})
    `).bind(startWeekKey).all()

    rows = ((result?.results || []) as any[]).map(r => ({
      job_title: r.job_title ? String(r.job_title) : null,
      created_at: r.created_at ? String(r.created_at) : null,
    }))
  } else {
    rows = devSalaries
      .filter(r => Number(r.report_count || 0) < REPORT_HIDE_THRESHOLD)
      .map(r => ({ job_title: r.job_title || null, created_at: r.created_at || null }))
  }

  const countsByRoleWeek = new Map<string, { label: string; weekMap: Map<string, number>; labelCounts: Map<string, number> }>()
  for (const row of rows) {
    const title = String(row.job_title || '').trim()
    if (!title) continue
    const normalizedTitle = title.toLowerCase()
    const dateKey = extractDateKey(row.created_at || '')
    if (!dateKey) continue
    const wk = weekKey(new Date(`${dateKey}T00:00:00Z`))
    if (!weekKeys.includes(wk)) continue
    const existing = countsByRoleWeek.get(normalizedTitle) || {
      label: title,
      weekMap: new Map<string, number>(),
      labelCounts: new Map<string, number>(),
    }
    existing.weekMap.set(wk, (existing.weekMap.get(wk) || 0) + 1)
    existing.labelCounts.set(title, (existing.labelCounts.get(title) || 0) + 1)

    let bestLabel = existing.label
    let bestLabelCount = Number(existing.labelCounts.get(bestLabel) || 0)
    for (const [label, count] of existing.labelCounts.entries()) {
      if (count > bestLabelCount) {
        bestLabel = label
        bestLabelCount = count
      }
    }
    existing.label = bestLabel
    countsByRoleWeek.set(normalizedTitle, existing)
  }

  const topTitles = [...countsByRoleWeek.entries()]
    .map(([, role]) => ({
      job_title: role.label,
      total: weekKeys.reduce((sum, wk) => sum + Number(role.weekMap.get(wk) || 0), 0),
      weekMap: role.weekMap,
    }))
    .filter(r => r.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, ANALYTICS_CONFIG.marketHeatmapTopRolesLimit)

  const rowsOut: HeatmapRow[] = topTitles.map(({ job_title, weekMap, total }) => {
    const counts = weekKeys.map(wk => Number(weekMap.get(wk) || 0))
    const prev = counts.length > 1 ? counts[counts.length - 2] : 0
    const last = counts.length ? counts[counts.length - 1] : 0
    const change_pct = prev > 0 ? ((last - prev) / prev) * 100 : (last > 0 ? 100 : 0)
    return { job_title, counts, total, change_pct }
  })

  const max_cell_count = rowsOut.reduce((max, row) => Math.max(max, ...row.counts, 0), 0)

  return {
    weeks: weekKeys.map(formatWeekLabel),
    rows: rowsOut,
    max_cell_count,
  }
}

// ============================================================
// Salary history helpers
// ============================================================
interface HistoryEntry {
  id: string
  salary_id: string
  year: number
  job_title: string
  salary: number
  company: string | null
  sort_order: number
}

const devHistory: HistoryEntry[] = []

export async function insertSalaryHistory(event: H3Event, entries: HistoryEntry[]) {
  if (entries.length === 0) return
  const { db } = getBindings(event)

  if (db) {
    const stmt = db.prepare(
      'INSERT INTO salary_history (id, salary_id, year, job_title, salary, company, sort_order) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)'
    )
    const batch = entries.map(e =>
      stmt.bind(e.id, e.salary_id, e.year, e.job_title, e.salary, e.company, e.sort_order)
    )
    await db.batch(batch)
    return
  }

  // Dev fallback
  devHistory.push(...entries)
}

export async function getSalaryHistory(event: H3Event, salaryIds: string[]): Promise<Record<string, HistoryEntry[]>> {
  if (salaryIds.length === 0) return {}
  const { db } = getBindings(event)

  if (db) {
    const placeholders = salaryIds.map((_, i) => `?${i + 1}`).join(',')
    const results = await db.prepare(
      `SELECT id, salary_id, year, job_title, salary, company, sort_order FROM salary_history WHERE salary_id IN (${placeholders}) ORDER BY sort_order ASC`
    ).bind(...salaryIds).all()

    const map: Record<string, HistoryEntry[]> = {}
    for (const row of (results?.results || []) as HistoryEntry[]) {
      if (!map[row.salary_id]) map[row.salary_id] = []
      map[row.salary_id].push(row)
    }
    return map
  }

  // Dev fallback
  const map: Record<string, HistoryEntry[]> = {}
  for (const e of devHistory) {
    if (salaryIds.includes(e.salary_id)) {
      if (!map[e.salary_id]) map[e.salary_id] = []
      map[e.salary_id].push(e)
    }
  }
  return map
}

export async function insertSubmissionAudit(event: H3Event, entry: SubmissionAuditEvent): Promise<void> {
  const { db } = getBindings(event)
  if (db) {
    await ensureSubmissionAuditTable(db)
    await db.prepare(`
      INSERT INTO submission_audit (id, salary_id, event_type, summary, created_at)
      VALUES (?1, ?2, ?3, ?4, ?5)
    `).bind(entry.id, entry.salary_id, entry.event_type, entry.summary, entry.created_at).run()
    return
  }

  devSubmissionAudit.push(entry)
}

export async function getSubmissionAudit(event: H3Event, salaryId: string, limit = 20): Promise<SubmissionAuditEvent[]> {
  const { db } = getBindings(event)

  if (db) {
    await ensureSubmissionAuditTable(db)
    const result = await db.prepare(`
      SELECT id, salary_id, event_type, summary, created_at
      FROM submission_audit
      WHERE salary_id = ?1
      ORDER BY created_at DESC
      LIMIT ?2
    `).bind(salaryId, Math.max(1, Math.min(50, Math.round(limit || 20)))).all()

    return (result?.results || []) as SubmissionAuditEvent[]
  }

  return devSubmissionAudit
    .filter(x => x.salary_id === salaryId)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .slice(0, Math.max(1, Math.min(50, Math.round(limit || 20))))
}

// ============================================================
// Poll helpers
// ============================================================
const devPollVotes = new Map<string, number[]>()

export async function getPollVotes(event: H3Event, pollId: string, optionCount: number): Promise<number[]> {
  const { db } = getBindings(event)

  if (db) {
    const results = await db.prepare(
      'SELECT option_index, vote_count FROM poll_votes WHERE poll_id = ?1'
    ).bind(pollId).all()

    const votes = new Array(optionCount).fill(0)
    for (const row of (results?.results || []) as any[]) {
      if (row.option_index < optionCount) {
        votes[row.option_index] = row.vote_count
      }
    }
    return votes
  }

  // Dev fallback
  return devPollVotes.get(pollId) || new Array(optionCount).fill(0)
}

export async function submitPollVote(event: H3Event, pollId: string, optionIndex: number, optionCount: number): Promise<number[]> {
  const { db } = getBindings(event)

  if (db) {
    await db.prepare(`
      INSERT INTO poll_votes (poll_id, option_index, vote_count)
      VALUES (?1, ?2, 1)
      ON CONFLICT(poll_id, option_index) DO UPDATE SET vote_count = vote_count + 1
    `).bind(pollId, optionIndex).run()

    return getPollVotes(event, pollId, optionCount)
  }

  // Dev fallback
  const votes = devPollVotes.get(pollId) || new Array(optionCount).fill(0)
  votes[optionIndex]++
  devPollVotes.set(pollId, votes)
  return [...votes]
}
