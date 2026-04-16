import { getOperationalConfig } from './operationalConfig'

let cachedUsdRates: Record<string, number> | null = null
let cachedAtMs = 0

function isCacheFresh(now: number, ttlMs: number) {
  return cachedUsdRates && (now - cachedAtMs) < ttlMs
}

export async function getLiveUsdRates(): Promise<Record<string, number> | null> {
  const config = getOperationalConfig()
  const now = Date.now()
  if (isCacheFresh(now, config.currency.ratesTtlMs)) return cachedUsdRates

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), config.currency.fetchTimeoutMs)
  try {
    const res = await fetch(config.currency.providerUrl, {
      method: 'GET',
      signal: controller.signal,
    })
    if (!res.ok) return cachedUsdRates

    const data: any = await res.json()
    if (String(data?.result || '').toLowerCase() !== 'success') return cachedUsdRates

    const rawRates = data?.rates
    if (!rawRates || typeof rawRates !== 'object') return cachedUsdRates

    const rates: Record<string, number> = {}
    for (const [code, value] of Object.entries(rawRates)) {
      const n = Number(value)
      if (!Number.isFinite(n) || n <= 0) continue
      rates[String(code).toUpperCase()] = n
    }
    rates.USD = 1

    if (Object.keys(rates).length === 0) return cachedUsdRates
    cachedUsdRates = rates
    cachedAtMs = now
    return cachedUsdRates
  } catch {
    return cachedUsdRates
  } finally {
    clearTimeout(timeout)
  }
}
