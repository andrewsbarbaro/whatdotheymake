<template>
  <section class="hero">
    <!-- Full-bleed live map backdrop -->
    <div class="hero-map-bg" aria-hidden="true">
      <ClientOnly>
        <WorldSalaryMap embedded backdrop />
        <template #fallback>
          <div class="hero-map-bg-fallback" />
        </template>
      </ClientOnly>
    </div>
    <div class="hero-scrim" aria-hidden="true" />

    <!-- Live ticker of real recent salaries -->
    <div v-if="tickerItems.length" class="ticker" aria-hidden="true">
      <span class="ticker-live"><span class="live-dot" />Live feed</span>
      <div class="ticker-viewport">
        <div class="ticker-track">
          <span v-for="(s, i) in tickerLoop" :key="i" class="ticker-chip">
            <span class="ticker-pay">{{ compactPay(s) }}</span>
            <span class="ticker-role">{{ s.job_title }}</span>
            <span v-if="locLabel(s)" class="ticker-loc">{{ locLabel(s) }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Floating content -->
    <div class="hero-inner">
      <div class="hero-panel">
        <h1 class="hero-title">
          What do they
          <span class="hero-highlight">actually</span>
          make?
        </h1>

        <p class="hero-sub">
          Real salaries from real people, shared anonymously.
          No login walls, no ads, no paywalls — just the numbers.
        </p>

        <div class="hero-actions">
          <NuxtLink to="/submit" class="btn-primary hero-cta">
            Drop your salary now
          </NuxtLink>
          <NuxtLink to="/feed" class="hero-scroll">
            or browse the feed
          </NuxtLink>
        </div>

        <p class="hero-pledge">
          Every submission is anonymous — no email, no accounts, no trackers, no
          ads, ever.
          <a
            href="https://github.com/andrewsbarbaro/whatdotheymake"
            target="_blank"
            rel="noopener noreferrer"
            class="hero-pledge-link"
          >Open source</a>
          and fully auditable.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type TickerSalary = {
  job_title: string
  salary: number
  pay_type?: string
  currency_code?: string
  city?: string
  country?: string
}

type SalariesResponse = {
  salaries?: TickerSalary[]
  pagination?: { total?: number }
}

const { data } = await useFetch<SalariesResponse>('/api/salaries', {
  params: { page: '1', limit: '24' },
})

const tickerItems = computed<TickerSalary[]>(() =>
  (data.value?.salaries || []).filter(s => s && s.job_title && Number(s.salary) > 0)
)

// Duplicate the list so the marquee can loop seamlessly.
const tickerLoop = computed(() => [...tickerItems.value, ...tickerItems.value])

function compactPay(s: TickerSalary) {
  const code = String(s.currency_code || 'USD').toUpperCase()
  const annual = Number(s.salary || 0)
  const k = annual >= 1000 ? `${Math.round(annual / 1000)}k` : `${annual}`
  return code === 'USD' ? `$${k}` : `${k} ${code}`
}

function locLabel(s: TickerSalary) {
  return s.city || s.country || ''
}
</script>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  min-height: 640px;
  display: flex;
  flex-direction: column;
  background: #0b3d2e;
}

/* Live map backdrop */
.hero-map-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-map-bg-fallback {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(700px 400px at 30% 25%, rgba(34, 197, 94, 0.22), transparent 60%),
    linear-gradient(160deg, #0d4a37 0%, #082a20 100%);
}

.hero-map-bg :deep(.world-map-section),
.hero-map-bg :deep(.world-map-inner),
.hero-map-bg :deep(.world-map) {
  height: 100%;
  min-height: 100%;
}

/* Darken/tint the map so the glass panel reads clearly */
.hero-scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(900px 520px at 50% 52%, rgba(8, 30, 22, 0.4), transparent 72%),
    linear-gradient(180deg, rgba(6, 26, 19, 0.42) 0%, rgba(6, 26, 19, 0.22) 45%, rgba(6, 26, 19, 0.5) 100%);
}

/* Ticker */
.ticker {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(6, 26, 19, 0.55);
  backdrop-filter: blur(6px);
  overflow: hidden;
}

.ticker-live {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  padding: 0 1rem;
  background: var(--green-600);
  color: #fff;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}

.ticker-live .live-dot {
  background: #fff;
}

.ticker-viewport {
  position: relative;
  flex: 1;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent);
}

.ticker-track {
  display: inline-flex;
  align-items: center;
  gap: 1.75rem;
  padding: 0.55rem 1.75rem;
  white-space: nowrap;
  animation: ticker-scroll 55s linear infinite;
  will-change: transform;
}

.ticker:hover .ticker-track {
  animation-play-state: paused;
}

@keyframes ticker-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .ticker-track { animation: none; }
}

.ticker-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 0.45rem;
  font-size: 0.86rem;
  color: rgba(255, 255, 255, 0.82);
}

.ticker-pay {
  font-family: var(--font-display);
  font-weight: 800;
  color: var(--green-300, #86efac);
}

.ticker-role {
  font-weight: 650;
  color: #fff;
}

.ticker-loc {
  color: rgba(255, 255, 255, 0.6);
}

.ticker-loc::before {
  content: '· ';
}

/* Floating content */
.hero-inner {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem 3rem;
  pointer-events: none;
}

.hero-panel {
  pointer-events: auto;
  width: min(620px, 100%);
  text-align: center;
  padding: 2.25rem 2.25rem 2rem;
  border-radius: var(--radius-xl);
  background:
    linear-gradient(160deg, rgba(16, 54, 41, 0.66) 0%, rgba(7, 28, 21, 0.74) 100%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    0 24px 70px rgba(3, 18, 13, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px) saturate(130%);
  -webkit-backdrop-filter: blur(18px) saturate(130%);
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green-500);
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.55);
  animation: live-pulse 2s ease-out infinite;
}

@keyframes live-pulse {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.55); }
  70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .live-dot { animation: none; }
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.3rem, 5vw, 3.6rem);
  font-weight: 750;
  color: #fff;
  line-height: 1.05;
  margin-bottom: 0.9rem;
}

.hero-highlight {
  position: relative;
  display: inline-block;
  padding: 0 0.1em;
  color: #bbf7d0;
  z-index: 0;
}

.hero-highlight::before {
  content: '';
  position: absolute;
  left: -2%;
  right: -2%;
  bottom: 0.08em;
  height: 0.28em;
  background: rgba(34, 197, 94, 0.45);
  border-radius: var(--radius-full);
  z-index: -1;
}

.hero-sub {
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.84);
  line-height: 1.65;
  margin: 0 auto 1.4rem;
  max-width: 34rem;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
}

.hero-cta {
  font-size: 1.12rem;
  padding: 1rem 2.4rem;
}

.hero-scroll {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.9rem;
  transition: color 0.2s;
}

.hero-scroll:hover {
  color: #bbf7d0;
}

.hero-pledge {
  margin: 1.25rem auto 0;
  max-width: 32rem;
  font-size: 0.88rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.66);
}

.hero-pledge-link {
  color: #bbf7d0;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.hero-pledge-link:hover {
  color: #dcfce7;
}

@media (max-width: 640px) {
  .hero {
    min-height: 560px;
  }

  .hero-inner {
    padding: 1.75rem 1rem 2.25rem;
  }

  .hero-panel {
    padding: 1.75rem 1.25rem 1.5rem;
  }

  .ticker-live {
    padding: 0 0.7rem;
    font-size: 0.66rem;
  }
}
</style>
