function toNumber(value: unknown, fallback: number, opts?: { min?: number; max?: number }): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  const min = opts?.min ?? Number.NEGATIVE_INFINITY
  const max = opts?.max ?? Number.POSITIVE_INFINITY
  return Math.max(min, Math.min(max, n))
}

export function getOperationalConfig() {
  const runtime = useRuntimeConfig() as any
  const env = (process as any)?.env || {}

  return {
    currency: {
      ratesTtlMs: toNumber(runtime.currencyRatesTtlMs ?? env.NUXT_CURRENCY_RATES_TTL_MS, 30 * 60 * 1000, { min: 60_000 }),
      fetchTimeoutMs: toNumber(runtime.currencyFetchTimeoutMs ?? env.NUXT_CURRENCY_FETCH_TIMEOUT_MS, 5_000, { min: 1_000 }),
      providerUrl: String((runtime.currencyProviderUrl ?? env.NUXT_CURRENCY_PROVIDER_URL) || 'https://open.er-api.com/v6/latest/USD'),
    },
    mapGeocoding: {
      cacheTtlMs: toNumber(runtime.mapGeocodeCacheTtlMs ?? env.NUXT_MAP_GEOCODE_CACHE_TTL_MS, 1000 * 60 * 60 * 24 * 30, { min: 60_000 }),
      concurrency: toNumber(runtime.mapGeocodeConcurrency ?? env.NUXT_MAP_GEOCODE_CONCURRENCY, 4, { min: 1, max: 16 }),
      userAgent: String((runtime.mapGeocodeUserAgent ?? env.NUXT_MAP_GEOCODE_USER_AGENT) || 'whatdotheymake-map/1.0 (opensource@whatdotheymake.com)'),
    },
    salaryEstimate: {
      cacheTtlMs: toNumber(runtime.salaryEstimateCacheTtlMs ?? env.NUXT_SALARY_ESTIMATE_CACHE_TTL_MS, 1000 * 60 * 60 * 24, { min: 60_000 }),
    },
  }
}
