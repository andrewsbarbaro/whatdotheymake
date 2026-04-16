<template>
  <section class="home-count">
    <div class="home-count-inner">
      <div class="count-card">
        <div class="count-kicker">Live transparency count</div>
        <ClientOnly>
          <div class="count-number">{{ formatNum(animatedCount) }}</div>
          <template #fallback>
            <div class="count-number">{{ formatNum(totalSubmissions) }}</div>
          </template>
        </ClientOnly>
        <div class="count-label">salaries exposed</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type SalaryCountResponse = {
  pagination?: {
    total?: number
  }
}

const { data } = await useFetch<SalaryCountResponse>('/api/salaries', {
  params: { page: '1', limit: '1' },
})

const totalSubmissions = computed(() => Number(data.value?.pagination?.total || 0))
const animatedCount = ref(0)

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

onMounted(() => {
  watch(totalSubmissions, (target) => {
    if (!target) return
    if (typeof requestAnimationFrame !== 'function' || typeof performance?.now !== 'function') {
      animatedCount.value = target
      return
    }

    const duration = 1200
    const start = performance.now()
    const from = 0

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      animatedCount.value = Math.round(from + (target - from) * easeOut(progress))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, { immediate: true })
})

function formatNum(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
</script>

<style scoped>
.home-count {
  padding: 0.75rem 1.5rem 1.5rem;
}

.home-count-inner {
  max-width: 1100px;
  margin: 0 auto;
}

.count-card {
  border: 2px solid var(--green-200);
  background: linear-gradient(180deg, var(--green-50), var(--white));
  border-radius: var(--radius-xl);
  padding: 1.1rem 1rem 1.2rem;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.count-kicker {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--green-700);
  margin-bottom: 0.25rem;
}

.count-number {
  font-family: var(--font-display);
  font-size: clamp(2rem, 6vw, 3rem);
  font-weight: 800;
  line-height: 1;
  color: var(--green-700);
}

.count-label {
  margin-top: 0.35rem;
  color: var(--gray-600);
  font-weight: 600;
}
</style>
