export type SalaryHistoryDraft = {
  year: number
  job_title: string
  salary: number
  company: string | null
  sort_order: number
}

export function sanitizeString(val: any, maxLen = 100): string | null {
  if (!val || typeof val !== 'string') return null
  return val
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen) || null
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

const CURRENCY_CODE_RE = /^[A-Z]{3}$/

export function normalizeCountry(val: any): string | null {
  const sanitized = sanitizeString(val, 80)
  if (!sanitized) return null
  return sanitized
}

export function normalizeCurrencyCode(val: any): string | null {
  const sanitized = sanitizeString(val, 8)
  if (!sanitized) return null
  const upper = sanitized.toUpperCase()
  if (!CURRENCY_CODE_RE.test(upper)) return null
  return upper
}

export function normalizeLevel(val: any): string | null {
  return sanitizeString(val, 80)
}

export function normalizeWorkMode(val: any): 'remote' | 'hybrid' | 'onsite' | null {
  const sanitized = sanitizeString(val, 32)?.toLowerCase()
  if (!sanitized) return null
  if (sanitized === 'remote' || sanitized === 'hybrid' || sanitized === 'onsite') return sanitized
  return null
}

export function normalizeEquityValue(val: any): number | null {
  if (typeof val !== 'number' || !Number.isFinite(val)) return null
  return Math.max(0, Math.round(val))
}

export function parseSalaryHistoryDrafts(raw: any, sanitize = sanitizeString): { rawHistory: any[]; drafts: SalaryHistoryDraft[] } {
  const maxHistoryEntries = 10
  const rawHistory = Array.isArray(raw) ? raw.slice(0, maxHistoryEntries) : []
  const currentYear = new Date().getFullYear()

  const drafts: SalaryHistoryDraft[] = rawHistory
    .map((entry: any, i: number) => {
      const title = sanitize(entry?.job_title, 150)
      const company = sanitize(entry?.company, 150)
      if (!title || entry?.year == null || entry?.salary == null) return null

      return {
        year: Math.max(1950, Math.min(currentYear, Math.round(Number(entry.year)))),
        job_title: title,
        salary: Math.max(0, Math.round(Number(entry.salary))),
        company,
        sort_order: i,
      }
    })
    .filter(Boolean) as SalaryHistoryDraft[]

  return { rawHistory, drafts }
}

export function collectFieldsToModerate(opts: {
  jobTitle: string
  company?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  car?: string | null
  rawHistory: any[]
  sanitize?: typeof sanitizeString
}): Record<string, string> {
  const sanitize = opts.sanitize || sanitizeString

  const fields: Record<string, string> = { job_title: opts.jobTitle }
  if (opts.company) fields.company = opts.company
  if (opts.city) fields.city = opts.city
  if (opts.state) fields.state = opts.state
  if (opts.country) fields.country = opts.country
  if (opts.car) fields.car = opts.car

  for (let i = 0; i < opts.rawHistory.length; i++) {
    const title = sanitize(opts.rawHistory[i]?.job_title, 150)
    const histCompany = sanitize(opts.rawHistory[i]?.company, 150)

    if (title) fields[`salary_history[${i}].job_title`] = title
    if (histCompany) fields[`salary_history[${i}].company`] = histCompany
  }

  return fields
}
