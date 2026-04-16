<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-manifesto">
        <h3>No accounts. No ads. No paywalls. No BS.</h3>
        <p>
          We don't harvest emails. We don't sell data to advertisers.
          We don't run ad pixels or analytics scripts in the app.
          We will never run ads or paywalls on this site.
          Infrastructure providers still process technical request data for security/reliability.
          We're not trying to build a moat. We just want salary transparency to exist.
        </p>
        <p class="footer-bold">
          Tell your coworkers. Send it to your friends. Let's normalize talking about money.
        </p>
      </div>

      <div class="footer-links">
        <a
          href="https://donate.stripe.com/bJebJ17oof3e1Taeva2oE00"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-btn donate-btn"
        >
          Buy us a coffee ☕
        </a>
        <NuxtLink to="/submit" class="footer-btn">Submit Your Salary</NuxtLink>
        <NuxtLink to="/feed" class="footer-btn">Browse Salaries</NuxtLink>
        <NuxtLink to="/delete" class="footer-btn">Manage My Data</NuxtLink>
        <NuxtLink to="/feedback" class="footer-btn">Leave Feedback</NuxtLink>
        <NuxtLink to="/privacy" class="footer-btn">Privacy Policy</NuxtLink>
        <NuxtLink to="/tos" class="footer-btn">Terms of Service</NuxtLink>
        <a href="/llms.txt" class="footer-btn">AI / LLMs</a>
      </div>

      <div class="footer-credit">
        <p>
          The creators are anonymous too. Reach us at
          <a href="mailto:tellus@whatdotheymake.com" class="footer-email">tellus@whatdotheymake.com</a>
        </p>
        <p class="footer-press">
          Press &amp; News inquiries:
          <a href="mailto:press@whatdotheymake.com" class="footer-email">press@whatdotheymake.com</a>
        </p>
        <p class="footer-tagline">
          Made by people who are tired of gatekept salary data.
        </p>
        <p class="footer-open-source">This project is open source.</p>
      </div>
      <div class="open-source-pointer" aria-hidden="true">
        <svg viewBox="0 0 120 54" width="120" height="54">
          <path d="M60 4 C 44 10, 76 18, 60 24 C 45 30, 75 38, 60 46" />
          <path d="M53 41 L60 50 L67 41" />
        </svg>
      </div>

      <div class="footer-social" aria-label="What Do They Make social links">
        <a href="https://x.com/whatdotheymake" target="_blank" rel="noopener" class="social-link" aria-label="What Do They Make on X">
          <span class="social-text">X</span>
        </a>
        <a href="https://www.linkedin.com/company/whatdotheymake" target="_blank" rel="noopener" class="social-link" aria-label="What Do They Make on LinkedIn">
          <span class="social-text">in</span>
        </a>
        <a href="https://github.com/andrewsbarbaro/whatdotheymake" target="_blank" rel="noopener" class="social-link" aria-label="What Do They Make on GitHub">
          <span class="social-text">GH</span>
        </a>
        <a href="https://www.reddit.com/r/Whatdotheymake/" target="_blank" rel="noopener" class="social-link" aria-label="What Do They Make on Reddit">
          <span class="social-text">r/</span>
        </a>
        <a href="https://www.producthunt.com/products/what-do-they-make" target="_blank" rel="noopener" class="social-link" aria-label="What Do They Make on Product Hunt">
          <span class="social-text">PH</span>
        </a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--footer-bg);
  color: var(--footer-bold);
  padding: 3rem 1.5rem 2rem;
  margin-top: 5rem;
}

.footer-inner {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
}

.footer-manifesto {
  margin-bottom: 2rem;
}

.footer-manifesto h3 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--footer-heading);
}

.footer-manifesto p {
  font-size: 0.95rem;
  color: var(--footer-body);
  line-height: 1.7;
  margin-bottom: 0.75rem;
}

.footer-bold {
  font-weight: 600;
  color: var(--footer-bold) !important;
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.footer-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1.25rem;
  border: 1px solid var(--footer-btn-border);
  border-radius: var(--radius-full);
  color: var(--footer-btn-text) !important;
  font-weight: 500;
  font-size: 0.9rem;
  text-decoration: none !important;
  transition: all 0.2s;
}

.footer-btn:hover {
  background: var(--footer-btn-hover-bg);
  color: var(--footer-btn-hover-text) !important;
  border-color: var(--footer-btn-hover-border);
}

.donate-btn {
  background: linear-gradient(135deg, var(--green-600) 0%, var(--green-700) 100%);
  border-color: transparent;
  color: white !important;
  box-shadow: var(--shadow-green);
}

.donate-btn:hover {
  background: linear-gradient(135deg, var(--green-700) 0%, var(--green-800) 100%);
  color: white !important;
  border-color: transparent;
  transform: translateY(-1px);
}

.footer-social {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 0 0.75rem;
  border: 1px solid var(--footer-social-border);
  border-radius: var(--radius-full);
  color: var(--footer-social-text);
  transition: all 0.2s;
}

.social-link:hover {
  background: var(--footer-social-hover-bg);
  color: var(--footer-social-hover-text);
  border-color: var(--footer-social-hover-border);
}

.social-text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.02em;
  line-height: 1;
}

.footer-credit {
  padding-top: 1.5rem;
  border-top: 1px solid var(--footer-credit-border);
}

.footer-credit p {
  font-size: 0.85rem;
  color: var(--footer-credit-text);
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.footer-credit p:last-child {
  margin-bottom: 0;
}

.footer-email {
  color: var(--footer-email);
  text-decoration: underline;
  text-underline-offset: 3px;
  font-weight: 600;
  transition: color 0.2s;
}

.footer-email:hover {
  color: var(--green-300);
}

.footer-tagline {
  font-weight: 600;
  color: var(--footer-tagline) !important;
}
.footer-open-source {
  font-weight: 700;
  color: var(--footer-bold) !important;
}

.open-source-pointer {
  display: flex;
  justify-content: center;
  margin-top: 0.15rem;
  margin-bottom: 0.15rem;
}

.open-source-pointer svg {
  display: block;
}

.open-source-pointer path {
  fill: none;
  stroke: color-mix(in srgb, var(--green-600) 75%, var(--footer-bold) 25%);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.footer-press {
  font-weight: 700;
  color: var(--footer-bold) !important;
}

@media (max-width: 640px) {
  .footer {
    padding: 2rem 1rem 1.5rem;
  }

  .footer-social {
    gap: 0.65rem;
    margin-top: 0.9rem;
  }
}
</style>
