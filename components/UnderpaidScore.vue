<template>
  <div class="score-reveal">
    <!-- Loading animation -->
    <div v-if="loading" class="score-loading">
      <div class="loading-spinner" />
      <p class="loading-text">{{ loadingMessage }}</p>
    </div>

    <!-- Score revealed -->
    <div v-else class="score-result">
      <div v-if="showTokenModal" class="token-modal-overlay" @click.self="closeTokenModal">
        <div class="token-modal" role="dialog" aria-modal="true" aria-labelledby="token-modal-title">
          <h3 id="token-modal-title" class="token-modal-title">Your management code</h3>
          <p class="token-modal-text">
            Save this securely. You can use it to look up, edit, or delete your submission later.
            This is the only time you'll see it.
          </p>
          <div class="token-modal-box">
            <code class="token-modal-code">{{ managementCode }}</code>
            <button class="token-modal-copy" @click="copyToken">
              {{ tokenCopied ? 'Copied ✓' : 'Copy' }}
            </button>
          </div>
          <button class="btn-primary token-modal-close" @click="closeTokenModal">
            I saved it
          </button>
        </div>
      </div>
      <div class="score-emoji">{{ result.underpaidScore.emoji }}</div>

      <div class="score-meter">
        <div class="meter-track">
          <div class="meter-fill" :style="{ width: `${result.underpaidScore.score}%` }" />
        </div>
        <div class="meter-labels">
          <span>Overpaid Legend</span>
          <span>Highway Robbery</span>
        </div>
      </div>

      <div class="score-number">{{ result.underpaidScore.score }}/100</div>
      <h2 class="score-tier">{{ result.underpaidScore.tier }}</h2>
      <p class="score-message">{{ result.message }}</p>

      <div class="score-salary">
        Your salary: <strong>{{ formatMoney(result.salary) }}</strong>
        <span v-if="wasAnonymized" class="fuzz-note">(fuzzed for your protection 🔒)</span>
      </div>

      <div v-if="result.marketEstimate" class="market-estimate">
        <div class="market-title">Market check</div>
        <div class="market-body">
          Estimated range for <strong>{{ result.marketEstimate.normalized_title || 'this role' }}</strong>:
          <strong>{{ formatMoney(result.marketEstimate.low) }}</strong>–<strong>{{ formatMoney(result.marketEstimate.high) }}</strong>
          <span class="market-median">(median {{ formatMoney(result.marketEstimate.median) }})</span>
        </div>
        <div v-if="result.marketEstimate.notes" class="market-notes">{{ result.marketEstimate.notes }}</div>
      </div>

      <div class="share-section">
        <h3 class="share-title">Now make it everyone's problem</h3>
        <div class="share-buttons">
          <button class="btn-primary share-btn" @click="shareToX">
            Share on X 🐦
          </button>
          <button class="btn-secondary share-btn" @click="copyLink">
            {{ copied ? 'Copied! ✓' : 'Copy Link 📋' }}
          </button>
        </div>
        <p class="share-hint">
          "I just found out I'm rated {{ result.underpaidScore.tier }} on WhatDoTheyMake.com"<br />
          <em>Your coworkers need to see this.</em>
        </p>
      </div>

      <div class="delete-token-section">
        <h3 class="token-title">Your management code</h3>
        <p class="token-hint">Save this securely. You can use it to <NuxtLink to="/delete">look up, edit, or delete</NuxtLink> your submission later. This is the only time you'll see it.</p>
        <div class="token-box">
          <code class="token-code">{{ managementCode }}</code>
          <button class="token-copy" @click="copyToken">
            {{ tokenCopied ? '✓' : 'Copy' }}
          </button>
        </div>
      </div>

      <NuxtLink to="/" class="btn-secondary browse-btn">
        Browse the feed →
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  result: {
    salary: number
    currency_code?: string
    underpaidScore: { score: number; tier: string; emoji: string }
    message: string
    managementToken?: string
    deleteToken: string
    marketEstimate?: {
      low: number
      median: number
      high: number
      confidence: number
      normalized_title?: string
      notes?: string
    }
  }
  wasAnonymized: boolean
}>()

const loading = ref(true)
const copied = ref(false)
const tokenCopied = ref(false)
const loadingMessage = ref('')
const showTokenModal = ref(false)
const managementCode = computed(() => props.result.managementToken || props.result.deleteToken)

const loadingMessages = [
  'Consulting the salary gods...',
  'Starting your billionaire era...',
  'Factoring in your life choices...',
  'Calculating employer guilt...',
  'Cross-referencing with people who peaked in high school...',
  'Measuring your disappointment levels...',
  'Checking if Glass-on-the-floor charges for this...',
  'Running the numbers (for free, unlike them)...',
]

// Cycle through loading messages for dramatic effect
let msgIndex = 0
const updateMessage = () => {
  loadingMessage.value = loadingMessages[msgIndex % loadingMessages.length]
  msgIndex++
}

onMounted(() => {
  updateMessage()
  const interval = setInterval(updateMessage, 1200)

  // Reveal after dramatic pause
  setTimeout(() => {
    clearInterval(interval)
    loading.value = false
    showTokenModal.value = true
  }, 3600)
})

function formatNum(n: number) {
  return n.toLocaleString()
}

const currencySymbol = computed(() => {
  const code = String(props.result.currency_code || 'USD').toUpperCase()
  if (code === 'USD') return '$'
  if (code === 'EUR') return '€'
  if (code === 'GBP') return '£'
  if (code === 'INR') return '₹'
  if (code === 'JPY') return '¥'
  if (code === 'BRL') return 'R$'
  if (code === 'CAD') return 'C$'
  if (code === 'AUD') return 'A$'
  return `${code} `
})

function formatMoney(n: number) {
  return `${currencySymbol.value}${formatNum(n)}`
}

function shareToX() {
  const text = `I just found out I'm rated "${props.result.underpaidScore.tier}" ${props.result.underpaidScore.emoji} on WhatDoTheyMake.com\n\nAnonymous salary sharing. No accounts. No Glass-on-the-floor BS.\n\nDrop yours 👉 whatdotheymake.com`
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    '_blank'
  )
}

async function copyToken() {
  try {
    await navigator.clipboard.writeText(managementCode.value)
    tokenCopied.value = true
    setTimeout(() => (tokenCopied.value = false), 2000)
  } catch {
    // silent fail
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText('https://whatdotheymake.com')
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // fallback
    const input = document.createElement('input')
    input.value = 'https://whatdotheymake.com'
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  }
}

function closeTokenModal() {
  showTokenModal.value = false
}
</script>

<style scoped>
.score-reveal {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
}

/* Loading */
.score-loading {
  text-align: center;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--green-100);
  border-top-color: var(--green-600);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 2rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--gray-600);
  font-style: italic;
  animation: fadeInOut 1.2s ease-in-out;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Result */
.score-result {
  max-width: 550px;
  width: 100%;
  text-align: center;
}

.score-emoji {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

@keyframes bounceIn {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.score-meter {
  margin-bottom: 1.5rem;
}

.meter-track {
  height: 12px;
  background: var(--gray-100);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.meter-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--green-400), var(--green-600), #ef4444);
  border-radius: var(--radius-full);
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.meter-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--gray-400);
}

.score-number {
  font-family: var(--font-display);
  font-size: 4rem;
  font-weight: 700;
  color: var(--green-600);
  margin-bottom: 0.5rem;
}

.score-tier {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.75rem;
}

.score-message {
  font-size: 1.1rem;
  color: var(--gray-600);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.score-salary {
  font-size: 1rem;
  color: var(--gray-700);
  margin-bottom: 1.25rem;
}

.market-estimate {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: 1rem 1rem;
  margin-bottom: 2.5rem;
  text-align: left;
}

.market-title {
  font-family: var(--font-display);
  font-weight: 800;
  color: var(--gray-900);
  margin-bottom: 0.35rem;
}

.market-body {
  color: var(--gray-600);
  line-height: 1.5;
}

.market-median {
  color: var(--gray-500);
  font-size: 0.9rem;
  margin-left: 0.25rem;
}

.market-notes {
  margin-top: 0.5rem;
  color: var(--gray-500);
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.score-salary strong {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--green-600);
}

.fuzz-note {
  font-size: 0.85rem;
  color: var(--gray-400);
}

/* Share */
.share-section {
  background: var(--green-50);
  border: 2px solid var(--green-200);
  border-radius: var(--radius-lg);
  padding: 2rem 1.5rem;
  margin-bottom: 2rem;
}

.share-title {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 1.25rem;
}

.share-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.share-btn {
  font-size: 0.95rem;
}

.share-hint {
  font-size: 0.85rem;
  color: var(--gray-500);
  line-height: 1.6;
}

.share-hint em {
  color: var(--green-600);
  font-weight: 500;
}

/* Delete token */
.delete-token-section {
  background: var(--white);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.token-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.token-hint {
  font-size: 0.8rem;
  color: var(--gray-500);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.token-hint a {
  color: var(--green-600);
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.token-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
}

.token-code {
  flex: 1;
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--gray-700);
  word-break: break-all;
  text-align: left;
}

.token-copy {
  flex-shrink: 0;
  padding: 0.375rem 0.75rem;
  background: var(--green-600);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.token-copy:hover {
  background: var(--green-700);
}

.browse-btn {
  text-decoration: none;
}

.token-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2500;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.token-modal {
  width: 100%;
  max-width: 500px;
  background: var(--white);
  border: 2px solid var(--green-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 1.25rem;
  text-align: left;
}

.token-modal-title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.token-modal-text {
  color: var(--gray-600);
  line-height: 1.5;
  margin-bottom: 0.85rem;
}

.token-modal-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  padding: 0.7rem 0.8rem;
  margin-bottom: 1rem;
}

.token-modal-code {
  flex: 1;
  font-family: monospace;
  font-size: 0.88rem;
  word-break: break-all;
  color: var(--gray-700);
}

.token-modal-copy {
  border: none;
  border-radius: var(--radius-md);
  background: var(--green-600);
  color: #fff;
  font-weight: 700;
  padding: 0.4rem 0.7rem;
  cursor: pointer;
}

.token-modal-close {
  width: 100%;
}

@media (max-width: 640px) {
  .score-number {
    font-size: 3rem;
  }
  .score-tier {
    font-size: 1.5rem;
  }
}
</style>
