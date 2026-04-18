<template>
  <div>
    <FounderLetterBanner />
    <LandingHero />
    <section class="partners-section" aria-label="Partners and Affliates">
      <p class="partners-title">Partners &amp; Affliates</p>
      <p class="partners-subtitle">We only feature privacy-first products that pass strict review.</p>
      <div class="partners-static" role="region" aria-label="Partner and affiliate logos">
        <a
          v-for="partner in homepagePartners"
          :key="partner.name"
          :href="partner.url"
          target="_blank"
          rel="noopener noreferrer"
          class="partner-logo-chip"
          :aria-label="partner.name"
        >
          <img :src="partner.logoUrl" :alt="`${partner.name} logo`" class="partner-logo-img" />
        </a>
      </div>
    </section>
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
type HomepagePartner = {
  name: string
  logoUrl: string
  url: string
}

const homepagePartners = [
  {
    name: 'Proton Unlimited',
    logoUrl: '/logos/affalites.svg',
    url: 'https://go.getproton.me/SH2Yn',
  },
] as const satisfies HomepagePartner[]
</script>

<style scoped>
.partners-section {
  max-width: 980px;
  margin: 0 auto 2.3rem;
  padding: 0 1rem;
  text-align: center;
}

.partners-title {
  margin: 0 0 0.3rem;
  color: var(--gray-700);
  font-size: 0.84rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-weight: 700;
}
.partners-subtitle {
  margin: 0 0 0.65rem;
  color: var(--gray-600);
  font-size: 0.96rem;
}


.partners-static {
  display: flex;
  justify-content: center;
  align-items: center;
}

.partner-logo-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.4rem;
  transition: transform 0.2s ease;
  text-decoration: none;
}

.partner-logo-chip:hover {
  transform: translateY(-2px);
}

.partner-logo-img {
  width: 210px;
  height: 52px;
  object-fit: contain;
  opacity: 0.95;
}

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

@media (max-width: 640px) {
  .partners-section {
    padding: 0 0.75rem;
  }

  .partners-title {
    margin-bottom: 0.3rem;
    font-size: 0.72rem;
  }

  .partners-subtitle {
    font-size: 0.88rem;
    margin-bottom: 0.45rem;
  }

  .partners-static {
    display: block;
  }

  .partner-logo-chip {
    justify-content: center;
    padding: 0.25rem;
  }

  .partner-logo-img {
    width: 180px;
    height: 46px;
  }
}
</style>
