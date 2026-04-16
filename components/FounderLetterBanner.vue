<template>
  <section class="milestone-wrap">
    <button class="milestone-banner" type="button" @click="openLetter = true">
      <span class="banner-line">🎉 THANKS FOR 1000+ SUBMISSIONS</span>
      <span class="banner-line banner-sub">Click to read a letter from the founder</span>
    </button>

    <div v-if="openLetter" class="letter-overlay" @click.self="openLetter = false">
      <article class="letter-card">
        <button class="letter-close" type="button" @click="openLetter = false" aria-label="Close founder letter">✕</button>
        <p class="letter-kicker">From the founder</p>
        <h2 class="letter-title">1,000+ salary stories later</h2>
        <p class="letter-message">When I started this project, the goal was simple: make salary transparency fast, anonymous, and actually useful.

Today we’ve crossed 1,000+ submissions, and that only happened because people like you were willing to share honestly.

Every post helps someone negotiate better, sanity-check an offer, or realize they’re not alone in feeling underpaid.

Thank you for trusting this weird little corner of the internet with your real numbers and real stories.

I’m still shipping improvements constantly, and I read the feedback. Keep it coming.</p>
        <p class="letter-signoff">— Andrew</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
const openLetter = ref(false)
</script>

<style scoped>
.milestone-wrap {
  width: 100%;
  margin: 0;
  padding: 0;
}

.banner-line { display: block; line-height: 1.45; }
.banner-sub { margin-top: 0.25rem; font-size: 0.95rem; font-weight: 600; opacity: 0.95; }

.milestone-banner {
  width: 100%;
  border: none;
  background: linear-gradient(90deg, #14532d 0%, #16a34a 52%, #15803d 100%);
  color: #ffffff;
  border-radius: 0;
  padding: 1rem 1.25rem;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 8px 18px rgba(22, 163, 74, 0.28);
}

.milestone-banner:hover {
  filter: brightness(1.05);
}

.letter-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 120;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 6rem 1rem 2rem;
  overflow: auto;
}

.letter-card {
  width: min(760px, 100%);
  background: var(--white);
  border-radius: var(--radius-lg);
  border: 1px solid var(--gray-200);
  box-shadow: var(--shadow-md);
  padding: 1.5rem 1.5rem 1.25rem;
  position: relative;
  color: var(--gray-700);
  line-height: 1.7;
}

.letter-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  border: 1px solid var(--gray-200);
  background: var(--white);
  border-radius: 999px;
  width: 30px;
  height: 30px;
  cursor: pointer;
}

.letter-kicker {
  color: var(--green-600);
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.25rem;
}

.letter-title {
  font-family: var(--font-display);
  color: var(--gray-900);
  margin-bottom: 0.9rem;
}

.letter-message {
  margin: 0;
  white-space: pre-line;
  line-height: 1.95;
}

.letter-signoff {
  margin-top: 1rem;
  font-weight: 700;
}
</style>
