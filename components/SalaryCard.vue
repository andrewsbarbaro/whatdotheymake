<template>
  <div class="salary-card">
    <div class="card-header">
      <h3 class="card-title">{{ salary.job_title }}</h3>
      <div class="card-salary-wrap">
        <div class="card-salary">
          {{ salaryDisplay }}
          <span v-if="salary.is_anonymized" class="anonymized-badge" title="Salary was fuzzed ±$1-2k">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
          <span v-if="salary.is_outlier" class="outlier-flag" title="Too good to be true?">🚩</span>
        </div>
        <div v-if="usdEquivalentDisplay" class="usd-conversion-note">
          ≈ {{ usdEquivalentDisplay }} USD
        </div>
        <div v-if="salary.is_outlier && salary.outlier_note" class="outlier-note">
          {{ salary.outlier_note }}
        </div>
        <div v-if="showReportWarning" class="reported-note">
          ⚠ Reported multiple times as bad data — use caution when trusting this entry.
        </div>
      </div>
    </div>

    <div class="card-meta">
      <span v-if="salary.company" class="meta-item">
        <svg class="meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        {{ salary.company }}
      </span>
      <span v-if="salary.city || salary.state || salary.country" class="meta-item">
        <svg class="meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        {{ [salary.city, salary.state, salary.country].filter(Boolean).join(', ') }}
      </span>
      <span v-if="salary.currency_code" class="meta-item">
        <svg class="meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        Currency: {{ salary.currency_code }}
      </span>
      <span v-if="salary.years_experience" class="meta-item">
        <svg class="meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        {{ salary.years_experience }} {{ salary.years_experience === 1 ? 'year' : 'years' }}
      </span>
      <span v-if="salary.level" class="meta-item">
        <svg class="meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4-8 4-8-4 8-4z"/><path d="M4 11l8 4 8-4"/><path d="M4 15l8 4 8-4"/></svg>
        Level: {{ salary.level }}
      </span>
      <span v-if="salary.work_mode" class="meta-item">
        <svg class="meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8"/><path d="M12 16v4"/></svg>
        {{ workModeLabel }}
      </span>
      <span v-if="salary.equity_value !== null && salary.equity_value > 0" class="meta-item">
        <svg class="meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg>
        Equity: {{ salary.currency_code || 'USD' }} {{ formatSalary(salary.equity_value) }}/yr
      </span>
      <span v-if="salary.bonus_percent && salary.bonus_percent > 0" class="meta-item">
        <svg class="meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        Bonus: {{ salary.bonus_percent }}%
      </span>
      <span v-if="salary.education || salary.is_dropout" class="meta-item">
        <svg class="meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 6 3 6 3s6-1 6-3v-5"/></svg>
        {{ salary.is_dropout ? 'Dropout' : salary.education }}
      </span>
      <span v-if="salary.education_debt !== null" class="meta-item debt-item">
        <svg class="meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        {{ debtLabel }}: {{ salary.currency_code || 'USD' }} {{ formatSalary(salary.education_debt) }}
      </span>
      <span v-if="salary.car" class="meta-item">
        <svg class="meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14v-5l-2-6H7l-2 6v5z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/></svg>
        {{ salary.car }}
      </span>
    </div>

    <!-- Salary Timeline -->
    <div v-if="salary.salary_history && salary.salary_history.length" class="card-timeline">
      <div class="timeline-header" @click="showTimeline = !showTimeline">
        <svg class="meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        <span>Career timeline ({{ salary.salary_history.length + 1 }} roles)</span>
        <svg class="timeline-chevron" :class="{ open: showTimeline }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <Transition name="expand">
        <div v-if="showTimeline" class="timeline-body">
          <div v-for="(h, i) in sortedHistory" :key="i" class="timeline-entry">
            <div class="timeline-dot" />
            <div class="timeline-line" v-if="i < sortedHistory.length" />
            <div class="timeline-content">
              <span class="timeline-year">{{ h.year }}</span>
              <span class="timeline-title">{{ h.job_title }}</span>
              <span v-if="h.company" class="timeline-company">@ {{ h.company }}</span>
              <span class="timeline-pay">{{ salary.currency_code || 'USD' }} {{ formatSalary(h.salary) }}</span>
            </div>
          </div>
          <!-- Current role as last entry -->
          <div class="timeline-entry timeline-current">
            <div class="timeline-dot current-dot" />
            <div class="timeline-content">
              <span class="timeline-year">Now</span>
              <span class="timeline-title">{{ salary.job_title }}</span>
              <span v-if="salary.company" class="timeline-company">@ {{ salary.company }}</span>
              <span class="timeline-pay current-pay">{{ salary.currency_code || 'USD' }} {{ salary.pay_type === 'hourly' ? formatSalary(Math.round(salary.salary / 2080)) + '/hr' : formatSalary(salary.salary) + '/yr' }}</span>
            </div>
          </div>
          <!-- Growth indicator -->
          <div v-if="growthPercent !== null" class="timeline-growth">
            <span :class="growthPercent >= 0 ? 'growth-up' : 'growth-down'">
              {{ growthPercent >= 0 ? '↑' : '↓' }} {{ Math.abs(growthPercent) }}% since {{ sortedHistory[0].year }}
            </span>
          </div>
        </div>
      </Transition>
    </div>

    <div class="card-footer">
      <span class="downvote-chip" :class="{ warned: showReportWarning }">
        ↓ {{ localReportCount }}
      </span>
      <button class="report-btn" type="button" :disabled="reporting || reported" @click="reportBadData">
        {{ reportButtonText }}
      </button>
      <span v-if="salary.submission_number" class="submission-number">#{{ salary.submission_number }}</span>
      <span class="card-time">{{ timeAgo(salary.created_at) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface HistoryEntry {
  year: number
  job_title: string
  salary: number
  company: string | null
}

interface Salary {
  id: string
  job_title: string
  salary: number
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
  car: string | null
  is_anonymized: number
  pay_type: string | null
  usd_equivalent?: number | null
  submission_number?: number | null
  bonus_percent?: number | null
  is_outlier?: boolean
  outlier_note?: string | null
  education_debt: number | null
  created_at: string
  salary_history?: HistoryEntry[]
  report_count?: number | null
}

const props = defineProps<{
  salary: Salary
}>()
const emit = defineEmits<{
  hidden: [id: string]
}>()

const showTimeline = ref(false)
const reporting = ref(false)
const reported = ref(false)
const localReportCount = ref(Number(props.salary.report_count || 0))

const sortedHistory = computed(() => {
  if (!props.salary.salary_history?.length) return []
  return [...props.salary.salary_history].sort((a, b) => a.year - b.year)
})

const workModeLabel = computed(() => {
  if (props.salary.work_mode === 'remote') return 'Remote'
  if (props.salary.work_mode === 'hybrid') return 'Hybrid'
  if (props.salary.work_mode === 'onsite') return 'Onsite'
  return ''
})

const growthPercent = computed(() => {
  if (!sortedHistory.value.length) return null
  const first = sortedHistory.value[0].salary
  if (first === 0) return null
  return Math.round(((props.salary.salary - first) / first) * 100)
})

const debtLabel = computed(() => {
  if (props.salary.is_dropout) return 'Debt'
  const edu = props.salary.education || ''
  if (edu === 'High School' || edu === 'Self-taught') return 'Debt'
  return 'Spent on college'
})

const salaryDisplay = computed(() => {
  const currency = props.salary.currency_code || 'USD'
  if (props.salary.pay_type === 'hourly') {
    const hourly = Math.round(props.salary.salary / 2080)
    return `${currency} ${formatSalary(hourly)}/hr`
  }
  return `${currency} ${formatSalary(props.salary.salary)}/yr`
})


const usdEquivalentDisplay = computed(() => {
  const code = String(props.salary.currency_code || 'USD').toUpperCase()
  if (code === 'USD') return ''
  const annualUsd = Number(props.salary.usd_equivalent || 0)
  if (!Number.isFinite(annualUsd) || annualUsd <= 0) return ''
  if (props.salary.pay_type === 'hourly') {
    return `$${formatSalary(Math.round(annualUsd / 2080))}/hr`
  }
  return `$${formatSalary(Math.round(annualUsd))}/yr`
})

const reportButtonText = computed(() => {
  if (reporting.value) return 'Reporting...'
  if (reported.value) return 'Thanks for the report'
  return 'Report bad data'
})

const showReportWarning = computed(() => localReportCount.value >= 10)

function formatSalary(num: number) {
  return num.toLocaleString()
}

function timeAgo(isoDate: string) {
  const now = new Date()
  const then = new Date(isoDate)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return then.toLocaleDateString()
}

async function reportBadData() {
  if (reporting.value || reported.value) return
  reporting.value = true
  try {
    const res = await $fetch('/api/report', {
      method: 'POST',
      body: { salary_id: props.salary.id }
    }) as { hidden?: boolean; reportCount?: number }

    reported.value = true
    localReportCount.value = Number(res?.reportCount ?? (localReportCount.value + 1))
    if (res?.hidden) {
      emit('hidden', props.salary.id)
    }
  } catch {
    reported.value = false
  } finally {
    reporting.value = false
  }
}
</script>

<style scoped>
.salary-card {
  background: var(--white);
  border: 2px solid var(--green-100);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: all 0.2s;
}

.salary-card:hover {
  border-color: var(--green-200);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.card-title {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--gray-900);
  flex: 1;
}

.card-salary-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;
}

.card-salary {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--green-600);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.usd-conversion-note {
  font-size: 0.78rem;
  color: var(--gray-500);
  font-weight: 600;
}

.outlier-flag {
  font-size: 1rem;
  line-height: 1;
  color: #ef4444;
}

.outlier-note {
  max-width: 320px;
  text-align: right;
  font-size: 0.85rem;
  color: #ef4444;
  font-weight: 600;
  line-height: 1.25;
}

.reported-note {
  max-width: 320px;
  text-align: right;
  font-size: 0.82rem;
  color: #b45309;
  font-weight: 600;
  line-height: 1.25;
}

.anonymized-badge {
  font-size: 0.9rem;
  opacity: 0.7;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--gray-600);
  background: var(--gray-50);
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-full);
  font-weight: 500;
}

.meta-icon {
  flex-shrink: 0;
  opacity: 0.6;
}

.debt-item {
  background: var(--green-50);
  color: var(--green-700);
}

/* Timeline */
.card-timeline {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--green-100);
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--green-600);
  cursor: pointer;
  padding: 0.25rem 0;
  user-select: none;
}

.timeline-header:hover { color: var(--green-700); }

.timeline-chevron {
  margin-left: auto;
  transition: transform 0.2s;
}

.timeline-chevron.open {
  transform: rotate(180deg);
}

.timeline-body {
  padding: 1rem 0 0.25rem 0.5rem;
}

.timeline-entry {
  position: relative;
  padding-left: 1.5rem;
  padding-bottom: 1rem;
}

.timeline-entry:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 0.35rem;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--green-200);
  border: 2px solid white;
  box-shadow: 0 0 0 2px var(--green-200);
}

.current-dot {
  background: var(--green-500);
  box-shadow: 0 0 0 2px var(--green-500);
  width: 12px;
  height: 12px;
}

.timeline-line {
  position: absolute;
  left: 4px;
  top: 14px;
  bottom: 0;
  width: 2px;
  background: var(--green-100);
}

.timeline-content {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.85rem;
  line-height: 1.4;
}

.timeline-year {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--gray-500);
  min-width: 36px;
}

.timeline-current .timeline-year {
  color: var(--green-600);
}

.timeline-title {
  font-weight: 600;
  color: var(--gray-800);
}

.timeline-company {
  color: var(--gray-400);
  font-size: 0.8rem;
}

.timeline-pay {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--gray-500);
  margin-left: auto;
}

.current-pay {
  color: var(--green-600);
  font-size: 0.95rem;
}

.timeline-growth {
  padding: 0.5rem 0 0 1.5rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.growth-up { color: var(--green-600); }
.growth-down { color: #ef4444; }

.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to, .expand-leave-from {
  opacity: 1;
  max-height: 600px;
}

.card-footer {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--gray-100);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.card-time {
  font-size: 0.8rem;
  color: var(--gray-400);
}
.submission-number {
  font-size: 0.75rem;
  color: var(--gray-400);
  font-weight: 600;
}

.report-btn {
  border: 1px solid var(--gray-200);
  background: var(--white);
  color: var(--gray-500);
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.report-btn:hover:not(:disabled) {
  border-color: #fca5a5;
  color: #b91c1c;
  background: #fef2f2;
}

.report-btn:disabled {
  opacity: 0.65;
  cursor: default;
}

.downvote-chip {
  border: 1px solid var(--gray-200);
  background: var(--gray-50);
  color: var(--gray-600);
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.downvote-chip.warned {
  border-color: #fbbf24;
  background: #fffbeb;
  color: #b45309;
}

@media (max-width: 640px) {
  .salary-card {
    padding: 1.25rem;
  }
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .card-salary {
    font-size: 1.3rem;
  }
  .card-title {
    font-size: 1.1rem;
  }
}
</style>
