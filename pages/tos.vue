<template>
  <div class="tos-page">
    <div class="tos-header">
      <h1 class="tos-title">Terms of Service</h1>
      <p class="tos-sub">Effective date: April 12, 2026</p>
    </div>

    <div class="tos-content">
      <h2>The short version</h2>
      <ul>
        <li>This site is for salary transparency. Don’t be weird.</li>
        <li>Don’t submit personal data (yours or anyone else’s).</li>
        <li>Everything you submit is public.</li>
        <li>No ads. No paywalls. Ever.</li>
        <li>You can delete your submission any time using your submission code at <code>/delete</code>.</li>
        <li>We can remove content that violates these terms.</li>
      </ul>

      <h2>Agreement</h2>
      <p>
        By accessing or using WhatDoTheyMake.com (the “Service”), you agree to these Terms of Service (the “Terms”).
        If you don’t agree, don’t use the Service.
      </p>

      <h2>What the Service is</h2>
      <p>
        The Service allows people to submit and browse self-reported compensation information. We don’t verify
        submissions. Treat the data as anecdotal and self-reported.
      </p>

      <h2>Eligibility</h2>
      <p>
        You must be allowed to use the Service under applicable law. The Service is not intended for children.
      </p>

      <h2>User content</h2>
      <p>
        “User Content” means anything you submit to the Service (including salary entries and optional salary-history
        timelines).
      </p>
      <p>
        You are responsible for your User Content. Do not submit anything you don’t have the right to share.
      </p>

      <h3>License</h3>
      <p>
        You grant us a non-exclusive, worldwide, royalty-free license to host, store, reproduce, publish, display,
        and distribute your User Content solely as needed to operate, secure, and improve the Service.
      </p>
      <p>
        We do not sell or license raw submission data to third parties. If that policy ever changes, we will update
        these Terms before the change takes effect.
      </p>

      <h2>What you can’t do</h2>
      <ul>
        <li>Don’t submit personal data (names, emails, phone numbers, addresses, SSNs, etc.).</li>
        <li>Don’t harass, threaten, or promote hate or violence.</li>
        <li>Don’t spam, advertise, or solicit.</li>
        <li>Don’t attempt to scrape the site at high volume or disrupt the Service.</li>
        <li>Don’t attempt to deanonymize submitters or connect submissions to real people.</li>
        <li>Don’t abuse or attempt to bypass content moderation or rate limits.</li>
      </ul>

      <h2>Moderation and removal</h2>
      <p>
        We may review, block, remove, or refuse User Content at any time. We may also restrict access to the Service
        to protect the community and the infrastructure.
      </p>

      <h2>Deletion and your submission code</h2>
      <p>
        When you submit, you receive a random code (token). This code is the only way to edit or delete your
        submission. Treat it like a password.
      </p>
      <p>
        If you lose your code, we can’t recover it and we may not be able to locate your submission, because we don’t
        run accounts.
      </p>

      <h2>Ads and paywalls</h2>
      <p>
        We will never run ads on the Service.
      </p>
      <p>
        We will never place salary browsing or salary submission behind a paywall.
      </p>

      <h2>Disclaimers</h2>
      <p>
        THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” WE DO NOT GUARANTEE ACCURACY, COMPLETENESS, OR
        AVAILABILITY. USER CONTENT IS SELF-REPORTED AND MAY BE WRONG.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
        CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF DATA, PROFITS, OR REVENUE, ARISING FROM YOUR USE OF THE
        SERVICE.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these Terms as the Service evolves. If we do, we’ll update the effective date at the top of
        this page.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email <a href="mailto:tellus@whatdotheymake.com">tellus@whatdotheymake.com</a>.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Terms of Service | WhatDoTheyMake.com',
  meta: [
    { name: 'description', content: 'Terms of Service for WhatDoTheyMake.com.' }
  ]
})
</script>

<style scoped>
.tos-page {
  padding-top: 2rem;
  padding-bottom: 3rem;
}

.tos-header {
  text-align: center;
  padding: 0 1.5rem 1.25rem;
}

.tos-title {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.tos-sub {
  color: var(--gray-500);
  font-size: 1rem;
}

.tos-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1.5rem;
  color: var(--gray-700);
  line-height: 1.75;
}

.tos-content h2 {
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--gray-900);
}

.tos-content h3 {
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  color: var(--gray-900);
}

.tos-content p {
  margin: 0.75rem 0;
}

.tos-content ul {
  margin: 0.75rem 0 0.75rem 1.25rem;
}

.tos-content a {
  color: var(--green-600);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.tos-content code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.95em;
}
</style>
