<template>
  <div class="privacy-page">
    <div class="privacy-header">
      <h1 class="privacy-title">Privacy Policy</h1>
      <p class="privacy-sub">Effective date: April 12, 2026</p>
    </div>

    <div class="privacy-content">
      <h2>Privacy is the product</h2>
      <p>
        We built What Do They Make to be the opposite of the usual salary sites: no accounts, no growth hacks, no ad
        tech. We want salary transparency — not your identity.
      </p>

      <h2>TL;DR (human version)</h2>
      <ul>
        <li>No accounts, no email capture.</li>
        <li>No ads. No paywalls. Ever.</li>
        <li>No analytics/tracking scripts.</li>
        <li>No "personalization" — we don’t build user profiles.</li>
        <li>
          No cookies for marketing/analytics (we do use <code>localStorage</code> for a couple of on-device
          preferences).
        </li>
        <li>Cloudflare may process technical request data (like IP/user-agent) for security and reliability.</li>
        <li>Some text fields are sent to Anthropic for moderation before submission is accepted.</li>
        <li>Your salary submission is public — don’t include personal info.</li>
        <li>You can edit/delete your submission any time using your submission code at <code>/delete</code>.</li>
      </ul>

      <h2>What we collect and store</h2>
      <h3>Salary submissions (public)</h3>
      <p>
        When you submit a salary, we store the fields you enter in the form (for example: job title, pay amount, pay
        type, and optional company/location/education fields). Submissions may also include an optional “salary
        history” timeline.
      </p>
      <p>
        Submissions are displayed publicly. Please don’t include personal data (like your name, email, phone number,
        address, or anything that could identify you).
      </p>
      <p>
        We try to block submissions containing personal data or harassment via content moderation, but the safest
        approach is simple: don’t put it in.
      </p>

      <h3>Submission management code</h3>
      <p>
        After submitting, you receive a random code (token). That code is the only way to look up, edit, or delete
        your submission via <code>/delete</code>. If you lose it, we can’t recover it (there are no accounts).
      </p>

      <h2>Product commitments</h2>
      <ul>
        <li>We will never run ads on this site.</li>
        <li>We will never put salary browsing or submission behind a paywall.</li>
      </ul>

      <h3>Weekly Poll</h3>
      <p>
        The Weekly Poll stores aggregate vote counts in our database. To prevent repeat voting from the same browser,
        we store a small “already voted” flag in your browser’s <code>localStorage</code>.
      </p>

      <h2>What we do <em>not</em> do</h2>
      <ul>
        <li>We don’t require accounts to browse or submit.</li>
        <li>We don’t ask for your name, email, or phone number to use the site.</li>
        <li>We don’t run ad pixels, analytics trackers, or marketing scripts.</li>
        <li>We don’t sell your data to advertisers.</li>
      </ul>

      <h2>Cookies and local storage</h2>
      <p>We do not set cookies for analytics or advertising.</p>
      <p>We use <code>localStorage</code> on your device for:</p>
      <ul>
        <li>Theme preference (dark/light), stored under <code>wdtm_theme</code>.</li>
        <li>Weekly Poll vote indicator, stored under keys like <code>poll-&lt;pollId&gt;</code>.</li>
      </ul>
      <p>You can remove these at any time by clearing site data in your browser.</p>

      <h2>How we use the information</h2>
      <ul>
        <li>To display submissions in the feed and compute aggregate stats.</li>
        <li>To let you edit/delete your submission using your code.</li>
        <li>To keep the site usable (spam/harassment prevention via content moderation).</li>
      </ul>

      <h2>Salary anonymization (optional)</h2>
      <p>
        If you enable anonymization, we randomly adjust your submitted salary by ±$1,000–$2,000 <em>before</em> storing
        it. The original number is not stored.
      </p>

      <h2>Service providers</h2>
      <h3>Cloudflare (hosting and database)</h3>
      <p>
        We host the site and database on Cloudflare (Workers + D1). Like most infrastructure providers, Cloudflare may
        process technical request data (such as IP address and user agent) for security, abuse prevention, and
        reliability. We don’t use this to build profiles or track you across the web.
      </p>

      <h3>Stripe (optional donations)</h3>
      <p>
        If you choose to donate via the “Buy us a coffee” link, you’ll be taken to Stripe to complete the payment.
        Stripe processes the transaction and will collect payment information according to their policies. We do not
        receive your full card details.
      </p>

      <h3>Anthropic (content moderation)</h3>
      <p>
        To reduce spam and keep submissions from containing harassment or personal data, some text fields are checked
        using the Anthropic API before being accepted (for example job title, company, location fields, car, and
        salary-history text fields). We do not send your numeric pay amount as part of this text-field moderation.
      </p>

      <h2>Retention and deletion</h2>
      <ul>
        <li>Salary submissions are retained until you delete them using your submission code.</li>
        <li>Poll vote totals may be retained indefinitely as aggregate counts.</li>
        <li><code>localStorage</code> values remain on your device until you clear site data in your browser.</li>
      </ul>

      <h2>Security</h2>
      <p>Your submission code is the only way to manage your submission. Treat it like a password.</p>

      <h2>Contact</h2>
      <p>
        Questions? Email
        <a href="mailto:tellus@whatdotheymake.com">tellus@whatdotheymake.com</a>. (If you email us, we’ll receive your
        email address and whatever you include in the message.)
      </p>

      <h2>Changes</h2>
      <p>We may update this policy as the product evolves. If we do, we’ll update the effective date at the top.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Privacy Policy | WhatDoTheyMake.com',
  meta: [
    { name: 'description', content: 'Privacy policy for WhatDoTheyMake.com.' }
  ]
})
</script>

<style scoped>
.privacy-page {
  padding-top: 2rem;
  padding-bottom: 3rem;
}

.privacy-header {
  text-align: center;
  padding: 0 1.5rem 1.25rem;
}

.privacy-title {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.privacy-sub {
  color: var(--gray-500);
  font-size: 1rem;
}

.privacy-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1.5rem;
  color: var(--gray-700);
  line-height: 1.75;
}

.privacy-content h2 {
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--gray-900);
}

.privacy-content h3 {
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  color: var(--gray-900);
}

.privacy-content p {
  margin: 0.75rem 0;
}

.privacy-content ul {
  margin: 0.75rem 0 0.75rem 1.25rem;
}

.privacy-content a {
  color: var(--green-600);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.privacy-content code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.95em;
}
</style>
