import { getOperationalConfig } from '../operationalConfig'
type GeocodePoint = { lat: number; lng: number; display_name: string; cached_at: number }
const geocodeCache = new Map<string, GeocodePoint>()

function extractLocationParts(row: { city: string | null; state: string | null; country: string | null }) {
  const cityRaw = String(row.city || '').trim()
  const stateRaw = String(row.state || '').trim()
  const countryRaw = String(row.country || '').trim()
  const parts: string[] = []
  for (const segment of [cityRaw, stateRaw, countryRaw]) {
    const s = String(segment || '').trim()
    if (!s) continue
    for (const p of s.split(/[,|;/]/g)) {
      const part = p.trim()
      if (part) parts.push(part)
    }
  }

  const deduped: string[] = []
  const seen = new Set<string>()
  for (const part of parts) {
    const key = part.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(part)
  }
  return deduped
}

function buildLocationCandidates(parts: string[]) {
  if (!parts.length) return []
  const candidates: string[] = []
  const seen = new Set<string>()
  const push = (value: string) => {
    const v = value.trim()
    if (!v) return
    const key = v.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    candidates.push(v)
  }

  push(parts.join(', '))
  if (parts.length >= 3) {
    push(`${parts[0]}, ${parts[parts.length - 2]}, ${parts[parts.length - 1]}`)
  }
  if (parts.length >= 2) {
    push(`${parts[0]}, ${parts[parts.length - 1]}`)
  }
  if (parts.length >= 4) {
    push(parts.slice(-3).join(', '))
  }

  return candidates
}

function normalizeLocation(row: { city: string | null; state: string | null; country: string | null }) {
  const parts = extractLocationParts(row)
  if (parts.length === 0) return null
  const candidates = buildLocationCandidates(parts)
  if (!candidates.length) return null

  return {
    label: candidates[0],
    candidates,
  }
}

async function geocodeLocation(cacheKey: string, queries: string[]): Promise<GeocodePoint | null> {
  const config = getOperationalConfig()
  const key = cacheKey.toLowerCase()
  const cached = geocodeCache.get(key)
  if (cached && (Date.now() - cached.cached_at) < config.mapGeocoding.cacheTtlMs) return cached
  for (const query of queries) {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': config.mapGeocoding.userAgent,
        'Accept': 'application/json',
      },
    })
    if (!res.ok) continue

    const data = await res.json() as Array<{ lat?: string; lon?: string; display_name?: string }>
    if (!Array.isArray(data) || data.length === 0) continue

    const first = data[0]
    const lat = Number(first.lat)
    const lng = Number(first.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue

    const point: GeocodePoint = {
      lat,
      lng,
      display_name: String(first.display_name || query),
      cached_at: Date.now(),
    }
    geocodeCache.set(key, point)
    return point
  }

  return null
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const size = Math.max(1, Math.min(16, Math.round(concurrency)))
  const results: R[] = new Array(items.length)
  let cursor = 0

  const workers = new Array(size).fill(0).map(async () => {
    while (cursor < items.length) {
      const i = cursor
      cursor += 1
      results[i] = await fn(items[i])
    }
  })

  await Promise.all(workers)
  return results
}

export async function buildMapLocationsResponse(
  rows: Array<{ city: string | null; state: string | null; country: string | null; count: number }>,
  limit: number
) {
  const deduped = new Map<string, { label: string; candidates: string[]; count: number }>()
  for (const row of rows) {
    const normalized = normalizeLocation(row)
    if (!normalized?.label) continue
    const key = normalized.label.toLowerCase()
    const current = deduped.get(key)
    if (current) {
      current.count += Number(row.count || 0)
    } else {
      deduped.set(key, { label: normalized.label, candidates: normalized.candidates, count: Number(row.count || 0) })
    }
  }

  const locations = [...deduped.values()].sort((a, b) => b.count - a.count).slice(0, limit)
  const config = getOperationalConfig()
  const geocoded = await mapWithConcurrency(locations, config.mapGeocoding.concurrency, async (item) => {
    try {
      const point = await geocodeLocation(item.label, item.candidates)
      if (!point) return null
      return {
        id: item.label.toLowerCase(),
        label: item.label,
        display_name: point.display_name,
        lat: point.lat,
        lng: point.lng,
        count: item.count,
      }
    } catch {
      return null
    }
  })

  return {
    points: geocoded.filter(Boolean),
    totalLocations: locations.length,
  }
}
