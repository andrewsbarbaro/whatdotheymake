<template>
  <div class="feed-page">
    <div class="feed-header">
      <h1 class="feed-title">All Salaries</h1>
      <p class="feed-sub">Anonymous self-reported salaries. Helpful directional data, not ground truth.</p>
    </div>
    <div class="feed-search">
      <SearchBar v-model="search" />
    </div>
    <div class="feed-filters">
      <input v-model="country" class="feed-filter-input" type="text" placeholder="Country (e.g. United States)" />
      <select v-model="currency_code" class="feed-filter-input">
        <option value="">All currencies</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="GBP">GBP</option>
        <option value="CAD">CAD</option>
        <option value="AUD">AUD</option>
        <option value="INR">INR</option>
        <option value="JPY">JPY</option>
        <option value="BRL">BRL</option>
      </select>
      <select v-model="pay_type" class="feed-filter-input">
        <option value="">All pay types</option>
        <option value="salary">Salary</option>
        <option value="hourly">Hourly</option>
      </select>
      <select v-model="work_mode" class="feed-filter-input">
        <option value="">All work modes</option>
        <option value="remote">Remote</option>
        <option value="hybrid">Hybrid</option>
        <option value="onsite">Onsite</option>
      </select>
      <input v-model="min_salary" class="feed-filter-input" type="number" min="0" step="1000" placeholder="Min salary (annualized)" />
      <input v-model="max_salary" class="feed-filter-input" type="number" min="0" step="1000" placeholder="Max salary (annualized)" />
      <input v-model="min_years_experience" class="feed-filter-input" type="number" min="0" max="50" step="1" placeholder="Min years experience" />
      <input v-model="max_years_experience" class="feed-filter-input" type="number" min="0" max="50" step="1" placeholder="Max years experience" />
      <select v-model="sort" class="feed-filter-input">
        <option value="newest">Sort: Newest</option>
        <option value="oldest">Sort: Oldest</option>
        <option value="salary_desc">Sort: Salary high → low</option>
        <option value="salary_asc">Sort: Salary low → high</option>
      </select>
      <button class="feed-filter-reset" type="button" @click="resetFilters">Reset filters</button>
    </div>
    <SalaryFeed
      :search="search"
      :country="country || undefined"
      :currency_code="currency_code || undefined"
      :pay_type="(pay_type || undefined) as any"
      :work_mode="(work_mode || undefined) as any"
      :min_salary="parsedMinSalary"
      :max_salary="parsedMaxSalary"
      :min_years_experience="parsedMinYearsExperience"
      :max_years_experience="parsedMaxYearsExperience"
      :sort="sort as any"
    />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Browse Salaries | WhatDoTheyMake.com',
  meta: [
    { name: 'description', content: 'Browse thousands of real salaries. Search by job title, company, or city. No accounts required.' }
  ]
})

const search = ref('')
const country = ref('')
const currency_code = ref('')
const pay_type = ref('')
const work_mode = ref('')
const min_salary = ref('')
const max_salary = ref('')
const min_years_experience = ref('')
const max_years_experience = ref('')
const sort = ref<'newest' | 'oldest' | 'salary_desc' | 'salary_asc'>('newest')

const parsedMinSalary = computed(() => {
  if (!String(min_salary.value).trim()) return undefined
  const n = Number(min_salary.value)
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined
})
const parsedMaxSalary = computed(() => {
  if (!String(max_salary.value).trim()) return undefined
  const n = Number(max_salary.value)
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined
})
const parsedMinYearsExperience = computed(() => {
  if (!String(min_years_experience.value).trim()) return undefined
  const n = Number(min_years_experience.value)
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined
})
const parsedMaxYearsExperience = computed(() => {
  if (!String(max_years_experience.value).trim()) return undefined
  const n = Number(max_years_experience.value)
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined
})

function resetFilters() {
  country.value = ''
  currency_code.value = ''
  pay_type.value = ''
  work_mode.value = ''
  min_salary.value = ''
  max_salary.value = ''
  min_years_experience.value = ''
  max_years_experience.value = ''
  sort.value = 'newest'
}
</script>

<style scoped>
.feed-page {
  padding-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feed-header {
  text-align: center;
  padding: 0 1.5rem 1rem;
}

.feed-title {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.feed-sub {
  color: var(--gray-500);
  font-size: 1.1rem;
}

.feed-filters {
  max-width: 980px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}
.feed-search {
  margin-top: 0;
}

.feed-filter-input {
  width: 100%;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-md);
  padding: 0.65rem 0.8rem;
  background: var(--white);
  color: var(--gray-800);
}

.feed-filter-reset {
  width: 100%;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-md);
  padding: 0.65rem 0.8rem;
  background: var(--gray-50);
  color: var(--gray-700);
  font-weight: 600;
  cursor: pointer;
}

.feed-filter-reset:hover {
  border-color: var(--green-300);
  color: var(--green-700);
  background: var(--green-50);
}

@media (max-width: 640px) {
  .feed-filters {
    grid-template-columns: 1fr 1fr;
    padding: 0 1rem;
  }
}
</style>
