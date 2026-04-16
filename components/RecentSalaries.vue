<template>
  <section class="recent" id="feed">
    <div class="recent-header">
      <h2 class="recent-title">Recent Drops</h2>
      <NuxtLink to="/feed" class="recent-link">See all salaries →</NuxtLink>
    </div>

    <div v-if="loading" class="recent-loading">
      <div class="loading-dot" /><div class="loading-dot" /><div class="loading-dot" />
    </div>

    <div v-else-if="salaries.length === 0" class="recent-empty">
      <p>No salaries yet. Be the first to spill! ☕</p>
      <NuxtLink to="/submit" class="btn-primary">Drop Your Salary</NuxtLink>
    </div>

    <div v-else-if="error" class="recent-empty">
      <p>{{ error }}</p>
      <NuxtLink to="/feed" class="btn-secondary">Try again →</NuxtLink>
    </div>

    <div v-else class="recent-cards">
      <SalaryCard v-for="s in salaries" :key="s.id" :salary="s" />
    </div>

    <div v-if="salaries.length > 0" class="recent-cta">
      <NuxtLink to="/feed" class="btn-secondary">Browse all salaries →</NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const salaries = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  error.value = null

  try {
    const data = await $fetch('/api/salaries', { params: { limit: '5' } })
    salaries.value = (data as any).salaries || []
  } catch {
    error.value = 'Failed to load recent salaries.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.recent {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.recent-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
}

.recent-link {
  color: var(--green-600);
  font-weight: 500;
  font-size: 0.95rem;
}

.recent-loading {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem;
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

.recent-empty {
  text-align: center;
  padding: 3rem;
  color: var(--gray-500);
}

.recent-empty p { margin-bottom: 1.5rem; }

.recent-cards {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.recent-cta {
  text-align: center;
  margin-top: 2rem;
}

@media (max-width: 640px) {
  .recent { padding: 1.5rem 1rem 3rem; }
  .recent-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
}
</style>
