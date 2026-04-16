<template>
  <section class="landing-stats">
    <div class="inner">
      <h2 class="title">Salary Insights</h2>
      <p class="sub">
        Snapshot views from anonymous submissions, grouped by location and currency. (Hourly pay is annualized to ~2080 hrs/yr.)
      </p>

      <div v-if="pending" class="loading">
        <div class="loading-dot" /><div class="loading-dot" /><div class="loading-dot" />
      </div>

      <div v-else-if="error" class="error">
        Failed to load stats.
      </div>

      <div v-else class="grid">
        <div class="card card-expandable">
          <h3 class="card-title">Top regions by average salary</h3>
          <div v-if="salaryByState.length === 0" class="empty">
            Not enough data yet.
          </div>
          <div v-else class="rows">
            <div v-for="r in displayedStates" :key="r.state" class="row">
              <div class="row-left">
                <span class="pill">{{ formatScopeLabel(r.state) }}</span>
                <span class="count">{{ formatNum(r.count) }} drops</span>
              </div>
              <div class="row-right">
                <span class="value">{{ formatMoney(r.mean_salary, r.state) }}</span>
              </div>
            </div>
          </div>

          <button
            v-if="hasMoreStates"
            type="button"
            class="show-more"
            @click="showAllStates = !showAllStates"
          >
            {{ showAllStates ? 'Show less' : `Show more (${salaryByState.length - 5} more)` }}
          </button>
        </div>

        <div class="card card-expandable">
          <h3 class="card-title">Cars with the highest average salary</h3>
          <div v-if="salaryByCar.length === 0" class="empty">
            Not enough data yet.
          </div>
          <div v-else class="rows">
            <div v-for="r in displayedCars" :key="r.car" class="row">
              <div class="row-left">
                <span class="car">{{ formatScopeLabel(r.car) }}</span>
                <span class="count">{{ formatNum(r.count) }} owners</span>
              </div>
              <div class="row-right">
                <span class="value">{{ formatMoney(r.mean_salary, r.car) }}</span>
              </div>
            </div>
          </div>

          <button
            v-if="hasMoreCars"
            type="button"
            class="show-more"
            @click="showAllCars = !showAllCars"
          >
            {{ showAllCars ? 'Show less' : `Show more (${salaryByCar.length - 5} more)` }}
          </button>

        </div>
        <div class="card card-expandable">
          <h3 class="card-title">Top job titles by average salary</h3>
          <div v-if="salaryByJobTitle.length === 0" class="empty">
            Not enough data yet.
          </div>
          <div v-else class="rows">
            <div v-for="r in displayedJobTitles" :key="r.job_title" class="row">
              <div class="row-left">
                <span class="car">{{ formatScopeLabel(r.job_title) }}</span>
                <span class="count">{{ formatNum(r.count) }} submissions</span>
              </div>
              <div class="row-right">
                <span class="value">{{ formatMoney(r.mean_salary, r.job_title) }}</span>
              </div>
            </div>
          </div>
          <button
            v-if="hasMoreJobTitles"
            type="button"
            class="show-more"
            @click="showAllJobTitles = !showAllJobTitles"
          >
            {{ showAllJobTitles ? 'Show less' : `Show more (${salaryByJobTitle.length - 5} more)` }}
          </button>
        </div>
        <div class="card card-expandable">
          <h3 class="card-title">Work mode by average salary</h3>
          <div v-if="salaryByWorkMode.length === 0" class="empty">
            Not enough data yet.
          </div>
          <div v-else class="rows">
            <div v-for="r in displayedWorkModes" :key="r.work_mode" class="row">
              <div class="row-left">
                <span class="car">{{ formatScopeLabel(r.work_mode) }}</span>
                <span class="count">{{ formatNum(r.count) }} submissions</span>
              </div>
              <div class="row-right">
                <span class="value">{{ formatMoney(r.mean_salary, r.work_mode) }}</span>
              </div>
            </div>
          </div>
          <button
            v-if="hasMoreWorkModes"
            type="button"
            class="show-more"
            @click="showAllWorkModes = !showAllWorkModes"
          >
            {{ showAllWorkModes ? 'Show less' : `Show more (${salaryByWorkMode.length - 5} more)` }}
          </button>
        </div>
        <div class="card card-stat card-expandable">
          <h3 class="card-title">Average bonus percentage</h3>
          <div v-if="bonusSampleSize <= 0" class="empty">
            Not enough data yet.
          </div>
          <div v-else class="stat-wrap">
            <div class="stat-value">{{ formatPercent(avgBonusPercent) }}</div>
            <div class="count">{{ formatNum(bonusSampleSize) }} submissions with bonus data</div>
            <div v-if="bonusBreakdown.length > 0" class="rows">
              <div v-for="r in displayedBonusBreakdown" :key="r.bonus_percent" class="row">
                <div class="row-left">
                  <span class="car">{{ r.bonus_percent }}% bonus</span>
                </div>
                <div class="row-right">
                  <span class="count">{{ formatNum(r.count) }} submissions</span>
                </div>
              </div>
            </div>
            <button
              v-if="hasMoreBonusBreakdown"
              type="button"
              class="show-more"
              @click="showAllBonusBreakdown = !showAllBonusBreakdown"
            >
              {{ showAllBonusBreakdown ? 'Show less' : `Show more (${bonusBreakdown.length - 5} more)` }}
            </button>
          </div>
        </div>
        <div class="card card-expandable">
          <h3 class="card-title">Education by average salary</h3>
          <div v-if="salaryByEducation.length === 0" class="empty">
            Not enough data yet.
          </div>
          <div v-else class="rows">
            <div v-for="r in displayedEducation" :key="r.education" class="row">
              <div class="row-left">
                <span class="car">{{ r.education }}</span>
                <span class="count">{{ formatNum(r.count) }} submissions</span>
              </div>
              <div class="row-right">
                <span class="value">{{ formatMoney(r.mean_salary) }}</span>
              </div>
            </div>
          </div>
          <button
            v-if="hasMoreEducation"
            type="button"
            class="show-more"
            @click="showAllEducation = !showAllEducation"
          >
            {{ showAllEducation ? 'Show less' : `Show more (${salaryByEducation.length - 5} more)` }}
          </button>
        </div>
        <div class="card card-expandable">
          <h3 class="card-title">Years of experience vs salary</h3>
          <div v-if="salaryByYearsExperience.length === 0" class="empty">
            Not enough data yet.
          </div>
          <div v-else class="rows">
            <div v-for="r in displayedYearsExperience" :key="r.years_experience" class="row">
              <div class="row-left">
                <span class="car">{{ r.years_experience }} {{ r.years_experience === 1 ? 'year' : 'years' }}</span>
                <span class="count">{{ formatNum(r.count) }} submissions</span>
              </div>
              <div class="row-right">
                <span class="value">{{ formatMoney(r.mean_salary) }}</span>
              </div>
            </div>
          </div>
          <button
            v-if="hasMoreYearsExperience"
            type="button"
            class="show-more"
            @click="showAllYearsExperience = !showAllYearsExperience"
          >
            {{ showAllYearsExperience ? 'Show less' : `Show more (${salaryByYearsExperience.length - 5} more)` }}
          </button>
        </div>
        <div class="card card-expandable">
          <h3 class="card-title">Outlier forensics</h3>
          <div v-if="outlierForensicsPending" class="empty">Loading outlier signals...</div>
          <div v-else-if="!outlierForensics || outlierForensics.sample_size === 0" class="empty">
            Not enough data yet.
          </div>
          <div v-else class="rows">
            <div class="row">
              <div class="row-left">
                <span class="car">Feed red-flag rule coverage</span>
                <span class="count">Uses the same extreme-value and statistical checks as salary cards</span>
              </div>
              <div class="row-right">
                <span class="count">{{ formatPercent(outlierForensics.comparable_sample_coverage * 100) }} with 5+ comparable peers</span>
              </div>
            </div>
            <div class="row">
              <div class="row-left">
                <span class="car">Flagged outliers</span>
                <span class="count">{{ formatNum(outlierForensics.sample_size) }} analyzed submissions</span>
              </div>
              <div class="row-right">
                <span class="value">{{ formatPercent(outlierForensics.outlier_rate * 100) }}</span>
              </div>
            </div>
            <div class="row">
              <div class="row-left">
                <span class="car">Extreme highs / lows</span>
                <span class="count">{{ formatNum(outlierForensics.high_outliers) }} high · {{ formatNum(outlierForensics.low_outliers) }} low</span>
              </div>
              <div class="row-right">
                <span class="count">{{ formatNum(outlierForensics.total_outliers) }} total</span>
              </div>
            </div>
            <div class="row">
              <div class="row-left">
                <span class="car">Statistical deviations</span>
                <span class="count">Large z-score deltas versus comparable submissions</span>
              </div>
              <div class="row-right">
                <span class="count">{{ formatNum(outlierForensics.statistical_outliers) }}</span>
              </div>
            </div>
            <div class="row">
              <div class="row-left">
                <span class="car">Limited-verification flags</span>
                <span class="count">Extreme values with fewer than 5 comparable submissions</span>
              </div>
              <div class="row-right">
                <span class="count">{{ formatNum(outlierForensics.verification_limited_outliers) }}</span>
              </div>
            </div>
            <div v-for="r in outlierForensics.top_outlier_roles" :key="r.job_title" class="row">
              <div class="row-left">
                <span class="car">{{ formatScopeLabel(r.job_title) }}</span>
                <span class="count">{{ formatNum(r.outlier_count) }} / {{ formatNum(r.sample_size) }} flagged</span>
              </div>
              <div class="row-right">
                <span class="value">{{ formatPercent(r.outlier_rate * 100) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="card card-wide">
          <h3 class="card-title">Market heatmap over time</h3>
          <div v-if="marketHeatmapPending" class="empty">Loading heatmap...</div>
          <div v-else-if="marketHeatmap.rows.length === 0" class="empty">
            Not enough data yet.
          </div>
          <div v-else class="heatmap-wrap">
            <div class="heatmap-header" :style="heatmapGridStyle">
              <span class="heatmap-role-col">Role</span>
              <span v-for="week in marketHeatmap.weeks" :key="week" class="heatmap-week">{{ week }}</span>
              <span class="heatmap-momentum-col">Momentum</span>
            </div>
            <div v-for="row in marketHeatmap.rows" :key="row.job_title" class="heatmap-row" :style="heatmapGridStyle">
              <span class="heatmap-role" :title="row.job_title">{{ row.job_title }}</span>
              <span
                v-for="(count, idx) in row.counts"
                :key="`${row.job_title}-${idx}`"
                class="heatmap-cell"
                :style="heatCellStyle(count)"
                :title="`${row.job_title}: ${count} submissions`"
              >
                {{ count || '' }}
              </span>
              <span class="heatmap-momentum" :class="row.change_pct >= 0 ? 'up' : 'down'">
                {{ formatSignedPercent(row.change_pct) }}
              </span>
            </div>
          </div>
        </div>
        <div class="card card-wide">
          <h3 class="card-title">Submission trend (last 30 days)</h3>
          <div v-if="submissionsOverTime.length === 0" class="empty">
            Not enough data yet.
          </div>
          <div v-else class="trend-wrap">
            <div class="trend-summary">
              <span>{{ formatNum(totalTrendSubmissions) }} submissions</span>
              <span>Peak: {{ formatNum(peakTrendPoint.count) }} on {{ formatDay(peakTrendPoint.date) }}</span>
            </div>

            <div class="trend-chart-wrap">
              <svg class="trend-chart" viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label="Submissions over time">
                <line class="trend-grid" x1="0" y1="8" x2="100" y2="8" />
                <line class="trend-grid" x1="0" y1="16" x2="100" y2="16" />
                <line class="trend-grid" x1="0" y1="24" x2="100" y2="24" />
                <line class="trend-grid" x1="0" y1="32" x2="100" y2="32" />
                <path v-if="trendAreaPath" class="trend-area" :d="trendAreaPath" />
                <polyline v-if="trendLinePoints" class="trend-line" :points="trendLinePoints" />
                <circle
                  v-for="p in trendPoints"
                  :key="p.key"
                  class="trend-dot"
                  :cx="p.x"
                  :cy="p.y"
                  r="0.7"
                />
              </svg>
            </div>

            <div class="trend-axis">
              <span>{{ trendStartLabel }}</span>
              <span>{{ trendEndLabel }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type ByStateRow = { state: string; count: number; mean_salary: number }
type ByCarRow = { car: string; count: number; mean_salary: number }
type ByJobTitleRow = { job_title: string; count: number; mean_salary: number }
type ByWorkModeRow = { work_mode: string; count: number; mean_salary: number }
type ByEducationRow = { education: string; count: number; mean_salary: number }
type BonusBreakdownRow = { bonus_percent: number; count: number }
type ByYearsExperienceRow = { years_experience: number; count: number; mean_salary: number }
type TrendRow = { date: string; count: number }
type OutlierRole = { job_title: string; sample_size: number; outlier_count: number; outlier_rate: number }
type OutlierForensicsResponse = {
  sample_size: number
  total_outliers: number
  high_outliers: number
  low_outliers: number
  statistical_outliers: number
  verification_limited_outliers: number
  comparable_sample_coverage: number
  outlier_rate: number
  top_outlier_roles: OutlierRole[]
}
type MarketHeatmapRow = { job_title: string; counts: number[]; total: number; change_pct: number }
type MarketHeatmapResponse = { weeks: string[]; rows: MarketHeatmapRow[]; max_cell_count: number }

type StatsResponse = {
  totalSubmissions: number
  salaryByState?: ByStateRow[]
  salaryByCar?: ByCarRow[]
  salaryByJobTitle?: ByJobTitleRow[]
  salaryByWorkMode?: ByWorkModeRow[]
  salaryByEducation?: ByEducationRow[]
  bonusBreakdown?: BonusBreakdownRow[]
  salaryByYearsExperience?: ByYearsExperienceRow[]
  avgBonusPercent?: number
  bonusSampleSize?: number
  submissionsOverTime?: TrendRow[]
}

const { data, pending, error } = await useFetch<StatsResponse>('/api/stats')
const { data: outlierForensicsData, pending: outlierForensicsPending } = await useFetch<OutlierForensicsResponse>('/api/outlier-forensics')
const { data: marketHeatmapData, pending: marketHeatmapPending } = await useFetch<MarketHeatmapResponse>('/api/market-heatmap')

const salaryByState = computed(() => data.value?.salaryByState || [])
const salaryByCar = computed(() => data.value?.salaryByCar || [])
const salaryByJobTitle = computed(() => data.value?.salaryByJobTitle || [])
const salaryByWorkMode = computed(() => data.value?.salaryByWorkMode || [])
const salaryByEducation = computed(() => data.value?.salaryByEducation || [])
const bonusBreakdown = computed(() => data.value?.bonusBreakdown || [])
const salaryByYearsExperience = computed(() => data.value?.salaryByYearsExperience || [])
const avgBonusPercent = computed(() => Number(data.value?.avgBonusPercent || 0))
const bonusSampleSize = computed(() => Number(data.value?.bonusSampleSize || 0))
const submissionsOverTime = computed(() => data.value?.submissionsOverTime || [])

const showAllStates = ref(false)
const showAllCars = ref(false)
const showAllJobTitles = ref(false)
const showAllWorkModes = ref(false)
const showAllEducation = ref(false)
const showAllBonusBreakdown = ref(false)
const showAllYearsExperience = ref(false)

const hasMoreStates = computed(() => salaryByState.value.length > 5)
const hasMoreCars = computed(() => salaryByCar.value.length > 5)
const hasMoreJobTitles = computed(() => salaryByJobTitle.value.length > 5)
const hasMoreWorkModes = computed(() => salaryByWorkMode.value.length > 5)
const hasMoreEducation = computed(() => salaryByEducation.value.length > 5)
const hasMoreBonusBreakdown = computed(() => bonusBreakdown.value.length > 5)
const hasMoreYearsExperience = computed(() => salaryByYearsExperience.value.length > 5)

const displayedStates = computed(() => showAllStates.value ? salaryByState.value : salaryByState.value.slice(0, 5))
const displayedCars = computed(() => showAllCars.value ? salaryByCar.value : salaryByCar.value.slice(0, 5))
const displayedJobTitles = computed(() => showAllJobTitles.value ? salaryByJobTitle.value : salaryByJobTitle.value.slice(0, 5))
const displayedWorkModes = computed(() => showAllWorkModes.value ? salaryByWorkMode.value : salaryByWorkMode.value.slice(0, 5))
const displayedEducation = computed(() => showAllEducation.value ? salaryByEducation.value : salaryByEducation.value.slice(0, 5))
const displayedBonusBreakdown = computed(() => showAllBonusBreakdown.value ? bonusBreakdown.value : bonusBreakdown.value.slice(0, 5))
const displayedYearsExperience = computed(() => showAllYearsExperience.value ? salaryByYearsExperience.value : salaryByYearsExperience.value.slice(0, 5))
const outlierForensics = computed(() => outlierForensicsData.value || null)
const marketHeatmap = computed<MarketHeatmapResponse>(() => marketHeatmapData.value || { weeks: [], rows: [], max_cell_count: 0 })
const heatmapGridStyle = computed(() => {
  const weekCount = Math.max(1, Number(marketHeatmap.value.weeks?.length || 0))
  return {
    gridTemplateColumns: `minmax(0, 1.5fr) repeat(${weekCount}, minmax(0, 1fr)) minmax(0, 1fr)`,
  }
})

function trendScaleValue(count: number) {
  return Math.log1p(Math.max(0, Number(count || 0)))
}

const trendMaxScaled = computed(() => {
  const values = submissionsOverTime.value.map((r) => trendScaleValue(Number(r.count || 0)))
  return Math.max(1, ...values)
})

const trendPoints = computed(() => {
  const rows = submissionsOverTime.value
  const maxScaled = trendMaxScaled.value
  if (rows.length === 0) return []

  return rows.map((row, i) => {
    const count = Number(row.count || 0)
    const scaled = trendScaleValue(count)
    const x = rows.length === 1 ? 50 : (i / (rows.length - 1)) * 100
    const y = 36 - ((scaled / maxScaled) * 30)
    return {
      key: `${row.date}-${i}`,
      date: row.date,
      count,
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3)),
    }
  })
})

const trendLinePoints = computed(() => trendPoints.value.map(p => `${p.x},${p.y}`).join(' '))

const trendAreaPath = computed(() => {
  const points = trendPoints.value
  if (points.length === 0) return ''

  const first = points[0]
  const last = points[points.length - 1]
  const lineSegments = points.map((p) => `L ${p.x} ${p.y}`).join(' ')
  return `M ${first.x} 36 ${lineSegments} L ${last.x} 36 Z`
})

const totalTrendSubmissions = computed(() =>
  submissionsOverTime.value.reduce((sum, p) => sum + Number(p.count || 0), 0)
)

const peakTrendPoint = computed(() => {
  const rows = submissionsOverTime.value
  if (rows.length === 0) return { date: '', count: 0 }
  return rows.reduce((best, row) => (Number(row.count || 0) > Number(best.count || 0) ? row : best), rows[0])
})

const trendStartLabel = computed(() =>
  submissionsOverTime.value.length ? formatDay(submissionsOverTime.value[0].date) : ''
)

const trendEndLabel = computed(() =>
  submissionsOverTime.value.length ? formatDay(submissionsOverTime.value[submissionsOverTime.value.length - 1].date) : ''
)

function formatNum(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function formatMoney(n: number, scope?: string) {
  const v = Math.round(Number(n) || 0)
  const m = /\(([A-Z]{3})\)\s*$/.exec(String(scope || ''))
  const currency = m?.[1] || 'USD'
  if (currency === 'USD') return `$${formatNum(v)}`
  return `${formatNum(v)} ${currency}`
}

function formatPercent(n: number) {
  return `${(Math.round(Number(n || 0) * 10) / 10).toFixed(1)}%`
}

function formatSignedPercent(n: number) {
  const v = Math.round(Number(n || 0))
  if (v > 0) return `+${v}%`
  return `${v}%`
}

function heatCellStyle(count: number) {
  const max = Number(marketHeatmap.value.max_cell_count || 0)
  if (!count || max <= 0) {
    return {
      background: 'color-mix(in srgb, var(--gray-200) 35%, transparent)',
      color: 'var(--gray-500)',
    }
  }
  const alpha = Math.max(0.15, Math.min(0.92, Number(count) / max))
  return {
    background: `color-mix(in srgb, var(--green-500) ${Math.round(alpha * 100)}%, transparent)`,
    color: alpha > 0.5 ? 'white' : 'var(--green-700)',
  }
}

function formatScopeLabel(scope?: string) {
  const s = String(scope || '').trim()
  if (!s) return s
  const withoutCurrency = s.replace(/\s*\(([A-Z]{3})\)\s*$/i, '').trim()
  const parts = withoutCurrency.split('·').map(p => p.trim()).filter(Boolean)
  if (parts.length < 2) return withoutCurrency
  const country = parts[parts.length - 1].toLowerCase()
  if (country === 'united states') {
    return parts.slice(0, -1).join(' · ')
  }
  return withoutCurrency
}

function formatDay(day: string) {
  const d = new Date(`${day}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return day
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.landing-stats {
  padding: 2.5rem 1.5rem 1rem;
}

.inner {
  max-width: 900px;
  margin: 0 auto;
}

.title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-900);
  text-align: center;
  margin-bottom: 0.5rem;
}

.sub {
  text-align: center;
  color: var(--gray-500);
  margin-bottom: 1.75rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  align-items: start;
}

.grid > * {
  min-width: 0;
}

.card {
  background: var(--white);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
  align-self: start;
}

.card-expandable {
  position: relative;
}

.card-wide {
  grid-column: 1 / -1;
}

.card-stat {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.stat-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  color: var(--green-700);
  line-height: 1;
}

.show-more {
  margin-top: 0.75rem;
  width: 100%;
  border: 1px dashed var(--gray-300);
  background: var(--gray-50);
  color: var(--gray-700);
  border-radius: var(--radius-md);
  padding: 0.55rem 0.75rem;
  font-weight: 700;
  cursor: pointer;
  opacity: 1;
  transform: none;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.show-more:hover {
  background: var(--green-50);
  border-color: var(--green-200);
  color: var(--green-700);
}


.card-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 1rem;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--gray-100);
}

.row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.row-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.row-right {
  min-width: 0;
}

.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 10px;
  border-radius: var(--radius-full);
  background: var(--green-50);
  border: 1px solid var(--green-200);
  color: var(--green-700);
  font-weight: 700;
  font-size: 0.8rem;
  width: fit-content;
}

.car {
  font-weight: 600;
  color: var(--gray-800);
  overflow-wrap: anywhere;
}

.count {
  font-size: 0.8rem;
  color: var(--gray-500);
  overflow-wrap: anywhere;
}

.value {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--green-700);
  overflow-wrap: anywhere;
  text-align: right;
}

.heatmap-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.heatmap-header,
.heatmap-row {
  display: grid;
  align-items: center;
  gap: 0.35rem;
}

.heatmap-header {
  font-size: 0.72rem;
  color: var(--gray-500);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.heatmap-role,
.heatmap-role-col {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.heatmap-week,
.heatmap-cell,
.heatmap-momentum,
.heatmap-momentum-col {
  text-align: center;
}

.heatmap-cell {
  border-radius: 8px;
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid color-mix(in srgb, var(--gray-200) 60%, transparent);
}

.heatmap-role {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gray-800);
}

.heatmap-momentum {
  font-size: 0.78rem;
  font-weight: 700;
}

.heatmap-momentum.up { color: var(--green-700); }
.heatmap-momentum.down { color: #ef4444; }


.trend-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.trend-summary {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  color: var(--gray-500);
  font-size: 0.85rem;
  font-weight: 600;
}

.trend-chart-wrap {
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-md);
  background: linear-gradient(180deg, var(--green-50) 0%, var(--white) 100%);
  padding: 0.25rem;
}

.trend-chart {
  width: 100%;
  height: 180px;
  display: block;
}

.trend-grid {
  stroke: var(--gray-200);
  stroke-width: 0.35;
}

.trend-area {
  fill: color-mix(in srgb, var(--green-500) 18%, transparent);
}

.trend-line {
  fill: none;
  stroke: var(--green-600);
  stroke-width: 1.4;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.trend-dot {
  fill: var(--green-700);
}

.trend-axis {
  display: flex;
  justify-content: space-between;
  color: var(--gray-500);
  font-size: 0.8rem;
  font-weight: 600;
}

.hint {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: var(--gray-500);
}


.loading {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
}

.loading-dot {
  width: 10px;
  height: 10px;
  background: var(--green-400);
  border-radius: 50%;
  animation: pulse 1.2s ease-in-out infinite;
}

.loading-dot:nth-child(2) { animation-delay: 0.2s; }
.loading-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes pulse {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.error {
  text-align: center;
  color: var(--gray-600);
  padding: 2rem;
}

.empty {
  color: var(--gray-500);
  font-size: 0.95rem;
  padding: 0.75rem 0;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }

}
</style>
