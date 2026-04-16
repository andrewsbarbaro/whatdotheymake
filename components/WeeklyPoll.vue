<template>
  <section class="poll-section">
    <div class="poll-header">
      <h2 class="poll-title">Weekly Poll</h2>
      <span class="poll-badge">New polls every week</span>
    </div>

    <div class="poll-card">
      <h3 class="poll-question">{{ currentPoll.question }}</h3>

      <div v-if="!hasVoted" class="poll-options">
        <button
          v-for="(opt, i) in currentPoll.options"
          :key="i"
          class="poll-option"
          @click="vote(i)"
        >
          {{ opt.label }}
        </button>
      </div>

      <div v-else class="poll-results">
        <div
          v-for="(opt, i) in currentPoll.options"
          :key="i"
          class="poll-result"
          :class="{ winner: isWinner(i), voted: votedIndex === i }"
        >
          <div class="result-bar" :style="{ width: `${getPercent(i)}%` }" />
          <span class="result-label">{{ opt.label }}</span>
          <span class="result-pct">{{ getPercent(i) }}%</span>
        </div>
        <p class="poll-total">{{ totalVotes }} votes</p>
      </div>

      <p class="poll-flavor">{{ currentPoll.flavor }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
interface PollOption {
  label: string
  baseVotes: number
}

interface Poll {
  id: string
  question: string
  options: PollOption[]
  flavor: string
}

const polls: Poll[] = [
  {
    id: 'dropout-hire',
    question: 'Would you hire a college dropout?',
    options: [
      { label: 'Yes — skills > paper', baseVotes: 0 },
      { label: 'Depends on the role', baseVotes: 0 },
      { label: 'No way', baseVotes: 0 },
    ],
    flavor: 'Fun fact: Apple, Microsoft, and Meta were started by dropouts.',
  },
  {
    id: 'coworker-salary',
    question: 'Do your coworkers know your salary?',
    options: [
      { label: 'Yes, we are open about it', baseVotes: 0 },
      { label: 'Only my work bestie', baseVotes: 0 },
      { label: 'Absolutely not', baseVotes: 0 },
    ],
    flavor: 'Discussing pay is legally protected in most countries. Your boss just doesn\'t want you to.',
  },
  {
    id: 'underpaid-feeling',
    question: 'Do you think you\'re underpaid?',
    options: [
      { label: 'Obviously yes', baseVotes: 0 },
      { label: 'I\'m paid fairly', baseVotes: 0 },
      { label: 'I\'m overpaid (don\'t tell them)', baseVotes: 0 },
    ],
    flavor: 'If you had to think about it, you probably are.',
  },
  {
    id: 'account-trust',
    question: 'Do you trust salary data from sites that require an account?',
    options: [
      { label: 'Not at all', baseVotes: 0 },
      { label: 'Kinda, with a grain of salt', baseVotes: 0 },
      { label: 'Yes I trust corporations', baseVotes: 0 },
    ],
    flavor: 'Plot twist: the "67 people" who said yes all work in HR.',
  },
  {
    id: 'degree-worth',
    question: 'Was your degree worth the money?',
    options: [
      { label: 'Yes, 100%', baseVotes: 0 },
      { label: 'Jury\'s still out', baseVotes: 0 },
      { label: 'Expensive piece of wall art', baseVotes: 0 },
    ],
    flavor: 'Average student debt in the US is over $37k. That\'s a lot of wall art.',
  },
]

// Pick poll based on the current week number so it rotates weekly
const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
const currentPoll = polls[weekNumber % polls.length]

const hasVoted = ref(false)
const votedIndex = ref(-1)
const votes = ref<number[]>(currentPoll.options.map(() => 0))

onMounted(async () => {
  // Fetch shared vote counts from DB
  try {
    const data = await $fetch<{ votes: number[] }>('/api/poll-votes', {
      params: { pollId: currentPoll.id, optionCount: currentPoll.options.length }
    })
    votes.value = data.votes
  } catch (e) {
    // Silently fall back to zeros
  }

  // Check localStorage to see if this browser already voted
  const stored = localStorage.getItem(`poll-${currentPoll.id}`)
  if (stored !== null) {
    votedIndex.value = parseInt(stored)
    hasVoted.value = true
  }
})

const totalVotes = computed(() => votes.value.reduce((a, b) => a + b, 0))

function getPercent(i: number) {
  if (totalVotes.value === 0) return 0
  return Math.round((votes.value[i] / totalVotes.value) * 100)
}

function isWinner(i: number) {
  return votes.value[i] === Math.max(...votes.value)
}

async function vote(i: number) {
  votedIndex.value = i
  hasVoted.value = true
  localStorage.setItem(`poll-${currentPoll.id}`, String(i))

  // Optimistically bump the count
  votes.value[i]++

  // Persist to DB and sync real counts
  try {
    const data = await $fetch<{ votes: number[] }>('/api/poll-votes', {
      method: 'POST',
      body: { pollId: currentPoll.id, optionIndex: i, optionCount: currentPoll.options.length }
    })
    votes.value = data.votes
  } catch (e) {
    // Keep the optimistic count
  }
}
</script>

<style scoped>
.poll-section {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 1.5rem 3rem;
}

.poll-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.poll-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
}

.poll-badge {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--green-600);
  background: var(--green-100);
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-full);
}

.poll-card {
  background: var(--white);
  border: 2px solid var(--green-100);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.poll-question {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 1.5rem;
  line-height: 1.3;
}

.poll-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.poll-option {
  padding: 1rem 1.25rem;
  background: var(--gray-50);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 500;
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.poll-option:hover {
  border-color: var(--green-400);
  background: var(--green-50);
  color: var(--green-700);
}

.poll-results {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.poll-result {
  position: relative;
  padding: 0.85rem 1rem;
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2px solid var(--gray-100);
}

.poll-result.voted {
  border-color: var(--green-400);
}

.result-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: var(--green-100);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.poll-result.winner .result-bar {
  background: var(--green-200);
}

.result-label {
  position: relative;
  z-index: 1;
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--gray-800);
}

.result-pct {
  position: relative;
  z-index: 1;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
  color: var(--green-600);
}

.poll-total {
  text-align: right;
  font-size: 0.8rem;
  color: var(--gray-400);
  margin-top: 0.25rem;
}

.poll-flavor {
  margin-top: 1.25rem;
  font-size: 0.9rem;
  color: var(--gray-500);
  font-style: italic;
  line-height: 1.5;
  padding-top: 1rem;
  border-top: 1px solid var(--green-100);
}

@media (max-width: 640px) {
  .poll-section { padding: 0 1rem 2rem; }
  .poll-card { padding: 1.5rem 1.25rem; }
  .poll-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
}
</style>
