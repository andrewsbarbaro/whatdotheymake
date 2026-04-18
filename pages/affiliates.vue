<template>
  <main class="affiliates-page">
    <section class="affiliates-hero">
      <p class="affiliates-kicker">Partners &amp; Affliates</p>
      <h1>Current affiliate offer</h1>
      <p>Privacy-first tools we recommend to the WDTAM community.</p>
      <div class="affiliates-rules">
        <p>
          We only partner with products that match our privacy and user-first standards. Every partner is manually
          reviewed and must deliver clear value to the community.
        </p>
        <p>
          Our strict rules: no dark patterns, no surveillance-based ad-tech business model, no sketchy data handling,
          and no partner that conflicts with our transparency values.
        </p>
      </div>
    </section>

    <section class="affiliates-grid" aria-label="Current affiliate offers">
      <article class="affiliate-card">
        <img src="/logos/affalites.svg" alt="Proton logo" class="affiliate-logo" />
        <h2>Proton Unlimited</h2>
        <p>Get 30% off Proton Unlimited through our affiliate offer link.</p>
        <a
          href="https://go.getproton.me/SH2Yn"
          target="_blank"
          rel="noopener noreferrer"
          class="affiliate-card-cta"
        >
          Claim 30% off Proton Unlimited
        </a>
      </article>
    </section>
  </main>
</template>

<style scoped>
.affiliates-page {
  max-width: 980px;
  margin: 0 auto;
  padding: 2.15rem 1rem 1.25rem;
}

.affiliates-hero {
  text-align: center;
  margin-bottom: 1.15rem;
}

.affiliates-kicker {
  margin: 0 0 0.25rem;
  color: var(--green-700);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.affiliates-hero h1 {
  margin: 0 0 0.4rem;
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 5vw, 2.3rem);
  color: var(--gray-900);
}

.affiliates-hero p {
  margin: 0;
  color: var(--gray-600);
}

.affiliates-rules {
  margin: 0.95rem auto 0;
  max-width: 720px;
  border: 1px solid color-mix(in srgb, var(--green-600) 20%, transparent);
  border-radius: var(--radius-lg);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--white) 98%, var(--green-50) 2%),
    color-mix(in srgb, var(--white) 94%, var(--green-50) 6%)
  );
  padding: 0.85rem 1rem;
  text-align: left;
  box-shadow: var(--shadow-sm);
}

.affiliates-rules p {
  margin: 0;
  color: var(--gray-700);
  line-height: 1.6;
  font-size: 0.92rem;
}

.affiliates-rules p + p {
  margin-top: 0.45rem;
}

.affiliates-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.9rem;
  max-width: 760px;
  margin: 0 auto;
}

.affiliate-card {
  border: 1px solid color-mix(in srgb, var(--green-600) 30%, transparent);
  border-radius: var(--radius-xl);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--white) 98%, var(--green-50) 2%),
    color-mix(in srgb, var(--white) 93%, var(--green-50) 7%)
  );
  box-shadow: var(--shadow-md);
  padding: 1.35rem;
  text-align: center;
}

.affiliate-logo {
  width: 210px;
  height: 52px;
  object-fit: contain;
}

.affiliate-card h2 {
  margin: 0.8rem 0 0.35rem;
  font-family: var(--font-display);
  font-size: 1.5rem;
}

.affiliate-card p {
  margin: 0 0 0.65rem;
  color: var(--gray-700);
}

.affiliate-card-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.62rem 1rem;
  border-radius: var(--radius-full);
  background: var(--green-600);
  color: #fff !important;
  text-decoration: none;
  font-weight: 700;
}

.affiliate-card-cta:hover {
  background: var(--green-700);
}
</style>
