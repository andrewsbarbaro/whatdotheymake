<template>
  <div class="feed" id="feed">
    <div v-if="error" class="feed-error">
      {{ error }}
    </div>

    <!-- Empty state -->
    <div v-if="!loading && salaries.length === 0" class="feed-empty">
      <div class="empty-emoji">👻</div>
      <h3 class="empty-title">It's a ghost town in here</h3>
      <p class="empty-text">
        No salaries yet{{ search ? ' matching your search' : '' }}.
        Be the brave soul who goes first.
      </p>
      <NuxtLink to="/submit" class="btn-primary">
        Be First. Spill the Tea. ☕
      </NuxtLink>
    </div>

    <!-- Cards -->
    <div v-else class="feed-cards">
      <SalaryCard
        v-for="item in salaries"
        :key="item.id"
        :salary="item"
        @hidden="handleCardHidden"
      />
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="feed-loading">
      <div class="loading-dot" />
      <div class="loading-dot" />
      <div class="loading-dot" />
    </div>

    <!-- Load more sentinel -->
    <div ref="sentinel" class="feed-sentinel" />

    <!-- End of feed -->
    <div v-if="!hasMore && salaries.length > 0" class="feed-end">
      <p>You've seen them all. Now it's your turn.</p>
      <NuxtLink to="/submit" class="btn-primary">
        Drop Your Salary →
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  search: string
  country?: string
  currency_code?: string
  min_salary?: number
  max_salary?: number
  min_years_experience?: number
  max_years_experience?: number
  pay_type?: 'salary' | 'hourly'
  work_mode?: 'remote' | 'hybrid' | 'onsite'
  sort?: 'newest' | 'oldest' | 'salary_desc' | 'salary_asc'
}>()

const salaries = ref<any[]>([])
const page = ref(1)
const loading = ref(true)
const hasMore = ref(true)
const error = ref<string | null>(null)
const sentinel = ref<HTMLElement | null>(null)

function handleCardHidden(id: string) {
  salaries.value = salaries.value.filter(item => item.id !== id)
}

async function loadSalaries(resetPage = false) {
  if (resetPage) {
    page.value = 1
    salaries.value = []
    hasMore.value = true
  }

  if (!hasMore.value) return

  loading.value = true
  error.value = null

  try {
    const params: Record<string, string> = {
      page: String(page.value),
      limit: '20'
    }
    if (props.search) params.search = props.search
    if (props.country) params.country = props.country
    if (props.currency_code) params.currency_code = props.currency_code
    if (typeof props.min_salary === 'number') params.min_salary = String(props.min_salary)
    if (typeof props.max_salary === 'number') params.max_salary = String(props.max_salary)
    if (typeof props.min_years_experience === 'number') params.min_years_experience = String(props.min_years_experience)
    if (typeof props.max_years_experience === 'number') params.max_years_experience = String(props.max_years_experience)
    if (props.pay_type) params.pay_type = props.pay_type
    if (props.work_mode) params.work_mode = props.work_mode
    if (props.sort) params.sort = props.sort

    const data = await $fetch('/api/salaries', { params })
    const newSalaries = (data as any).salaries || []

    if (resetPage) {
      salaries.value = newSalaries
    } else {
      salaries.value.push(...newSalaries)
    }

    hasMore.value = (data as any).pagination?.hasMore ?? false
    page.value++
  } catch {
    error.value = 'Failed to load salaries. Please try again.'
  } finally {
    loading.value = false
  }
}

// Initial load
await loadSalaries()

// Watch search changes
watch(() => props.search, () => {
  loadSalaries(true)
})

watch(() => props.country, () => {
  loadSalaries(true)
})

watch(() => props.currency_code, () => {
  loadSalaries(true)
})
watch(() => props.min_salary, () => {
  loadSalaries(true)
})
watch(() => props.max_salary, () => {
  loadSalaries(true)
})
watch(() => props.min_years_experience, () => {
  loadSalaries(true)
})
watch(() => props.max_years_experience, () => {
  loadSalaries(true)
})
watch(() => props.pay_type, () => {
  loadSalaries(true)
})
watch(() => props.work_mode, () => {
  loadSalaries(true)
})
watch(() => props.sort, () => {
  loadSalaries(true)
})

// Infinite scroll via IntersectionObserver
onMounted(() => {
  if (!sentinel.value) return

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !loading.value && hasMore.value) {
        loadSalaries()
      }
    },
    { rootMargin: '200px' }
  )

  observer.observe(sentinel.value)

  onUnmounted(() => observer.disconnect())
})
</script>

<style scoped>
.feed {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 1.5rem 3rem;
}

.feed-cards {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.feed-error {
  margin: 0 0 1.5rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  background: var(--white);
  color: var(--gray-600);
  text-align: center;
}

/* Empty state */
.feed-empty {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-emoji {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.75rem;
}

.empty-text {
  color: var(--gray-500);
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* Loading dots */
.feed-loading {
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

.loading-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.feed-sentinel {
  height: 1px;
}

/* End of feed */
.feed-end {
  text-align: center;
  padding: 3rem 1rem;
}

.feed-end p {
  font-size: 1.1rem;
  color: var(--gray-500);
  margin-bottom: 1.5rem;
  font-style: italic;
}

@media (max-width: 640px) {
  .feed {
    padding: 0 1rem 2rem;
  }
}
</style>
