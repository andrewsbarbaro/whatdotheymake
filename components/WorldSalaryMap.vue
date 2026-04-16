<template>
  <section class="world-map-section">
    <div class="world-map-inner">
      <h2 class="world-map-title">Where salary submissions are coming from</h2>
      <p class="world-map-sub">
        Pan and zoom to explore submission density by location. Marker size reflects number of submissions.
        Location data here comes only from what people submit — not from user tracking.
      </p>

      <div v-if="pending" class="world-map-loading">Loading map points…</div>
      <div v-else-if="error" class="world-map-error">Could not load map data right now.</div>
      <div v-else ref="mapEl" class="world-map" />
    </div>
  </section>
</template>

<script setup lang="ts">
type MapPoint = {
  id: string
  label: string
  display_name: string
  lat: number
  lng: number
  count: number
}

type MapResponse = {
  points: MapPoint[]
  totalLocations: number
}

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
      integrity: 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=',
      crossorigin: '',
    }
  ]
})

const { data, pending, error } = await useFetch<MapResponse>('/api/map-locations?limit=250')
const points = computed(() => data.value?.points || [])
const mapEl = ref<HTMLElement | null>(null)

let map: any = null
let markerLayer: any = null

function pointRadius(count: number) {
  return Math.max(4, Math.min(18, Math.round(Math.sqrt(Math.max(1, count)) * 1.6)))
}

function renderMarkers(L: any) {
  if (!map) return
  if (markerLayer) markerLayer.remove()
  markerLayer = L.layerGroup()

  const usable = points.value.filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng))
  if (!usable.length) {
    markerLayer.addTo(map)
    return
  }

  for (const p of usable) {
    const marker = L.circleMarker([p.lat, p.lng], {
      radius: pointRadius(p.count),
      color: '#7c3f00',
      weight: 1.5,
      fillColor: '#a35400',
      fillOpacity: 0.42,
    })
    marker.bindPopup(`<strong>${p.label}</strong><br/>${p.count} submission${p.count === 1 ? '' : 's'}`)
    marker.addTo(markerLayer)
  }

  markerLayer.addTo(map)
  const bounds = markerLayer.getBounds?.()
  if (bounds?.isValid?.()) {
    map.fitBounds(bounds.pad(0.25), { maxZoom: 6 })
  }
}

function loadLeafletScript() {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if ((window as any).L) return Promise.resolve((window as any).L)

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-leaflet="true"]') as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).L), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed loading leaflet script')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
    script.crossOrigin = ''
    script.dataset.leaflet = 'true'
    script.onload = () => resolve((window as any).L)
    script.onerror = () => reject(new Error('Failed loading leaflet script'))
    document.head.appendChild(script)
  })
}

onMounted(async () => {
  if (!mapEl.value) return
  const L = await loadLeafletScript()
  if (!L) return

  map = L.map(mapEl.value, {
    worldCopyJump: true,
    minZoom: 2,
    maxZoom: 12,
    zoomControl: true,
  }).setView([20, 0], 2)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
    className: 'dark-osm-tiles',
  }).addTo(map)

  renderMarkers(L)

  watch(points, () => renderMarkers(L))
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.world-map-section {
  padding: 0.5rem 1.5rem 2rem;
  position: relative;
  z-index: 1;
}

.world-map :deep(.leaflet-pane),
.world-map :deep(.leaflet-top),
.world-map :deep(.leaflet-bottom) {
  z-index: 1;
}

.world-map :deep(.dark-osm-tiles) {
  filter: invert(100%) hue-rotate(180deg) brightness(82%) contrast(92%) saturate(70%);
}

.world-map-inner {
  max-width: 1100px;
  margin: 0 auto;
}

.world-map-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-900);
  text-align: center;
  margin-bottom: 0.4rem;
}

.world-map-sub {
  text-align: center;
  color: var(--gray-500);
  margin-bottom: 1rem;
}

.world-map {
  width: 100%;
  height: 520px;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  position: relative;
  z-index: 1;
}

.world-map-loading,
.world-map-error {
  text-align: center;
  color: var(--gray-600);
  padding: 2rem 1rem;
}

@media (max-width: 768px) {
  .world-map-section {
    padding: 0.5rem 1rem 2rem;
  }

  .world-map {
    height: 380px;
  }
}
</style>
