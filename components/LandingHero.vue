<template>
  <section class="hero">
    <div class="hero-inner">
      <div class="hero-grid">
        <div class="hero-copy">
          <div class="hero-kicker" aria-hidden="true">
            <span class="kicker-pill">No accounts</span>
            <span class="kicker-pill">No ads</span>
            <span class="kicker-pill">No paywalls</span>
          </div>

          <h1 class="hero-title">
            What Do They
            <span class="hero-highlight">Actually</span>
            Make?
          </h1>

          <p class="hero-sub">
            Real salaries from real people. No login walls.
            No ads. No paywalls. No "create an account to unlock 3 results" nonsense.
          </p>


          <div class="hero-actions">
            <NuxtLink to="/submit" class="btn-primary hero-cta">
              Drop Your Salary (30 sec) →
            </NuxtLink>
            <NuxtLink to="/feed" class="hero-scroll">
              or just doom scroll and judge people ↓
            </NuxtLink>
          </div>


          <div class="manifesto">
            <div class="manifesto-title">
              <span class="manifesto-stamp" aria-hidden="true">UNPAYWALLED</span>
              <span class="manifesto-heading">Transparency pledge</span>
            </div>

            <p>
              We built this because salary transparency shouldn't require a blood sample.
              Unlike <em>other sites</em>, we don't need your email, your resume,
              your work history, or a 500-word review just to see a number.
            </p>
            <p class="manifesto-bold">
              Every submission is anonymous. We don't run ad/analytics trackers.
              No ads. No paywalls. Ever.
              We don't even have a users table because there are no accounts.
              Just salaries. Raw, unfiltered, unaveraged.
            </p>
            <p class="manifesto-open-source">
              This project is open source — our privacy/product claims are auditable:
              <a
                href="https://github.com/andrewsbarbaro/whatdotheymake"
                target="_blank"
                rel="noopener noreferrer"
                class="manifesto-link"
              >github.com/andrewsbarbaro/whatdotheymake</a>
            </p>
          </div>
        </div>

        <div class="hero-visual" aria-hidden="true">
          <div class="visual-stack">
            <div class="receipt">
              <div class="receipt-top">
                <div class="receipt-brand">
                  <span class="receipt-logo">WDTAM</span>
                  <span class="receipt-title">Salary receipt</span>
                </div>
                <span class="receipt-stamp">NO SIGNUP</span>
              </div>

              <div class="receipt-lines">
                <div class="receipt-line">
                  <span class="rl-left">Software Engineer</span>
                  <span class="rl-right">$162k</span>
                </div>
                <div class="receipt-line">
                  <span class="rl-left">Product Manager</span>
                  <span class="rl-right">$145k</span>
                </div>
                <div class="receipt-line">
                  <span class="rl-left">Nurse (RN)</span>
                  <span class="rl-right">$98k</span>
                </div>
                <div class="receipt-line muted">
                  <span class="rl-left">…and</span>
                  <span class="rl-right">
                    <span class="big">{{ formatNum(totalSubmissions) }}</span>
                    <span class="small">more</span>
                  </span>
                </div>
              </div>

              <div class="receipt-footer">
                Live feed. Anonymous drops. Zero gatekeeping.
              </div>
            </div>

            <div class="sticky-note">
              <div class="sticky-title">0 cookies</div>
              <div class="sticky-sub">0 pixels</div>
            </div>

            <div class="mini-card">
              <div class="mini-title">Browse first.</div>
              <div class="mini-sub">Submit when you're ready.</div>
            </div>
          </div>
        </div>

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

function formatNum(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
</script>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  padding: 5.25rem 1.5rem 3.25rem;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(900px 500px at 15% 10%, rgba(34, 197, 94, 0.14), transparent 60%),
    radial-gradient(700px 450px at 85% 15%, rgba(22, 163, 74, 0.12), transparent 55%),
    linear-gradient(180deg, var(--green-50) 0%, var(--off-white) 70%);
  z-index: 0;
}

.hero::after {
  content: '';
  position: absolute;
  inset: -1px;
  background-image:
    repeating-linear-gradient(
      90deg,
      rgba(22, 163, 74, 0.06) 0,
      rgba(22, 163, 74, 0.06) 1px,
      transparent 1px,
      transparent 28px
    ),
    repeating-linear-gradient(
      0deg,
      rgba(22, 163, 74, 0.05) 0,
      rgba(22, 163, 74, 0.05) 1px,
      transparent 1px,
      transparent 28px
    );
  opacity: 0.55;
  z-index: 0;
  mask-image: radial-gradient(closest-side at 50% 15%, black 40%, transparent 100%);
  pointer-events: none;
}

.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 3rem;
  align-items: center;
}

.hero-copy {
  text-align: left;
}

.hero-kicker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.kicker-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 12px;
  border-radius: var(--radius-full);
  background: rgba(22, 163, 74, 0.08);
  border: 1px solid rgba(22, 163, 74, 0.22);
  color: var(--green-700);
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.2px;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.6rem, 6vw, 4.6rem);
  font-weight: 750;
  color: var(--gray-900);
  line-height: 1.02;
  margin-bottom: 1.15rem;
}

.hero-highlight {
  position: relative;
  display: inline-block;
  padding: 0 0.15em;
  color: var(--gray-900);
  z-index: 0;
}

.hero-highlight::before {
  content: '';
  position: absolute;
  left: -2%;
  right: -2%;
  bottom: 0.08em;
  height: 0.32em;
  background: linear-gradient(90deg, var(--green-200), rgba(34, 197, 94, 0.05));
  border-radius: var(--radius-full);
  transform: rotate(-1.5deg);
  z-index: -1;
}

.hero-highlight::after {
  content: '';
  position: absolute;
  left: -1%;
  right: -1%;
  top: -0.12em;
  bottom: -0.12em;
  border: 2px solid rgba(22, 163, 74, 0.25);
  border-radius: 18px;
  transform: rotate(0.9deg);
  z-index: -2;
}

.hero-sub {
  font-size: 1.12rem;
  color: var(--gray-600);
  max-width: 42rem;
  line-height: 1.75;
  margin-bottom: 0.6rem;
}

.hero-roast {
  font-size: 1.05rem;
  color: var(--green-700);
  font-style: italic;
  font-weight: 600;
  margin-bottom: 1.65rem;
}

.roast-name {
  font-weight: 800;
}

.roast-cough {
  font-size: 0.85rem;
  color: var(--gray-500);
  font-weight: 500;
  margin-left: 0.25rem;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.9rem;
  margin-bottom: 1.75rem;
}

.hero-cta {
  font-size: 1.12rem;
  padding: 1rem 2.4rem;
}

.hero-scroll {
  color: var(--gray-500);
  font-size: 0.9rem;
  transition: color 0.2s;
}

.hero-scroll:hover {
  color: var(--green-700);
}


.manifesto {
  background: var(--white);
  background: color-mix(in srgb, var(--white) 78%, transparent);
  border: 2px solid var(--green-100);
  border: 2px solid color-mix(in srgb, var(--green-600) 18%, transparent);
  border-radius: var(--radius-xl);
  padding: 1.25rem 1.5rem;
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);
  max-width: 44rem;
}

.manifesto-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.manifesto-stamp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 26px;
  padding: 0 10px;
  border-radius: var(--radius-full);
  border: 2px dashed rgba(22, 163, 74, 0.4);
  color: var(--green-700);
  background: rgba(22, 163, 74, 0.08);
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  transform: rotate(-2deg);
}

.manifesto-heading {
  font-family: var(--font-display);
  font-weight: 800;
  color: var(--gray-900);
}

.manifesto p {
  font-size: 0.95rem;
  color: var(--gray-700);
  line-height: 1.7;
  margin-bottom: 0.75rem;
}

.manifesto p:last-child {
  margin-bottom: 0;
}

.manifesto em {
  color: var(--green-700);
  font-weight: 600;
}

.manifesto-bold {
  font-weight: 750;
  color: var(--gray-900) !important;
}

.manifesto-open-source {
  margin-top: 0.25rem;
  font-size: 0.92rem;
  color: var(--gray-700);
}

.manifesto-link {
  color: var(--green-700);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.manifesto-link:hover {
  color: var(--green-800);
}

.hero-visual {
  display: flex;
  justify-content: center;
}

.visual-stack {
  position: relative;
  width: min(380px, 100%);
  min-height: 360px;
  animation: floaty 9s ease-in-out infinite;
}

@keyframes floaty {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@media (prefers-reduced-motion: reduce) {
  .visual-stack { animation: none; }
}

.receipt {
  position: relative;
  background: var(--white);
  border: 2px solid var(--gray-200);
  border: 2px solid color-mix(in srgb, var(--gray-900) 10%, transparent);
  border-radius: var(--radius-xl);
  padding: 1.25rem 1.25rem 1rem;
  box-shadow: var(--shadow-lg);
  transform: rotate(1.25deg);
}

.receipt::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -8px;
  height: 16px;
  background:
    radial-gradient(circle at 8px 0, transparent 7px, var(--off-white) 7.5px) 0 0/16px 16px repeat-x;
  opacity: 0.9;
}

.receipt-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.receipt-brand {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.receipt-logo {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  color: var(--gray-900);
}

.receipt-title {
  color: var(--gray-600);
  font-weight: 700;
  font-size: 0.85rem;
}

.receipt-stamp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 12px;
  border-radius: var(--radius-full);
  border: 2px solid rgba(22, 163, 74, 0.28);
  color: var(--green-700);
  background: rgba(22, 163, 74, 0.07);
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  transform: rotate(-7deg);
}

.receipt-lines {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.receipt-line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px dashed var(--gray-200);
  border-bottom: 1px dashed color-mix(in srgb, var(--gray-900) 16%, transparent);
}

.receipt-line:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.rl-left {
  color: var(--gray-800);
  font-weight: 750;
}

.rl-right {
  font-family: var(--font-display);
  color: var(--green-700);
  font-weight: 900;
  white-space: nowrap;
}

.receipt-line.muted .rl-left {
  color: var(--gray-500);
  font-weight: 700;
}

.receipt-line.muted .rl-right {
  color: var(--gray-700);
  font-weight: 900;
}

.rl-right .big {
  font-family: var(--font-display);
  font-size: 1.15rem;
}

.rl-right .small {
  margin-left: 0.35rem;
  font-size: 0.85rem;
  color: var(--gray-500);
  font-weight: 700;
}

.receipt-footer {
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--gray-200);
  border-top: 1px solid color-mix(in srgb, var(--gray-900) 12%, transparent);
  color: var(--gray-600);
  font-size: 0.88rem;
  font-weight: 650;
}

.sticky-note {
  position: absolute;
  right: -6px;
  top: 22px;
  width: 140px;
  padding: 0.85rem 0.9rem;
  background: var(--white);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--white) 92%, transparent),
    color-mix(in srgb, var(--green-50) 86%, transparent)
  );
  border: 2px solid var(--green-100);
  border: 2px solid color-mix(in srgb, var(--green-600) 18%, transparent);
  border-radius: 18px;
  box-shadow: var(--shadow-md);
  transform: rotate(6deg);
}

.sticky-title {
  font-family: var(--font-display);
  font-weight: 900;
  color: var(--gray-900);
  font-size: 1rem;
  margin-bottom: 0.15rem;
}

.sticky-sub {
  color: var(--gray-600);
  font-weight: 750;
  font-size: 0.9rem;
}

.mini-card {
  position: absolute;
  left: -10px;
  bottom: -6px;
  width: 190px;
  padding: 0.9rem 1rem;
  background: var(--white);
  background: color-mix(in srgb, var(--white) 82%, transparent);
  border: 2px solid var(--gray-200);
  border: 2px solid color-mix(in srgb, var(--gray-900) 10%, transparent);
  border-radius: 18px;
  box-shadow: var(--shadow-md);
  transform: rotate(-5deg);
}

.mini-title {
  font-family: var(--font-display);
  font-weight: 900;
  color: var(--gray-900);
  margin-bottom: 0.2rem;
}

.mini-sub {
  color: var(--gray-600);
  font-weight: 650;
  font-size: 0.92rem;
}

@media (max-width: 980px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 2.25rem;
  }

  .hero-copy {
    text-align: center;
  }

  .hero-actions {
    align-items: center;
  }


  .manifesto {
    margin: 0 auto;
    text-align: left;
  }

  .hero-visual {
    padding-top: 0.25rem;
  }
}

@media (max-width: 640px) {
  .hero {
    padding: 3.25rem 1rem 2.5rem;
  }


  .visual-stack {
    width: min(360px, 100%);
    min-height: 340px;
  }

  .sticky-note {
    right: -2px;
    top: 14px;
    width: 135px;
  }

  .mini-card {
    left: -2px;
    width: 185px;
  }
}
</style>
