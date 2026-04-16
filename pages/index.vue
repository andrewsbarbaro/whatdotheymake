<template>
  <div>
    <FounderLetterBanner />
    <LandingHero />
    <HomeSalaryCountCard />
    <ClientOnly>
      <WorldSalaryMap />
    </ClientOnly>
    <LandingStats />
    <RecentSalaries />
    <ClientOnly>
      <WeeklyPoll />
    </ClientOnly>
    <section class="feedback-cta">
      <h2>Help us improve</h2>
      <p>Share quick product feedback — what’s working, what’s broken, and what you want next.</p>
      <NuxtLink to="/feedback" class="feedback-cta-btn">Leave feedback</NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
// No state needed — components handle their own data
</script>

<style scoped>
.feedback-cta {
  max-width: 980px;
  margin: 1.5rem auto 0;
  padding: 1.1rem 1rem;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  background: var(--panel-bg);
  text-align: center;
}

.feedback-cta h2 {
  margin: 0 0 0.35rem;
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--text-primary);
}

.feedback-cta p {
  margin: 0 0 0.8rem;
  color: var(--text-secondary);
}

.feedback-cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--green-600);
  color: #fff;
  font-weight: 700;
  text-decoration: none;
  padding: 0.55rem 1rem;
}
</style>
