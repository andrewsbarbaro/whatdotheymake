<template>
  <section class="feedback-page">
    <div class="feedback-card">
      <h1>Share Feedback</h1>
      <p class="feedback-subtitle">
        Tell us what to improve, what feels broken, or what you want next.
      </p>

      <form class="feedback-form" @submit.prevent="submitFeedback">
        <label for="feedback-message">Feedback</label>
        <textarea
          id="feedback-message"
          v-model="message"
          required
          minlength="10"
          maxlength="2000"
          placeholder="What should we improve?"
          :disabled="submitting"
        />


        <button type="submit" class="submit-btn" :disabled="submitting || !canSubmit">
          {{ submitting ? 'Sending...' : 'Send feedback' }}
        </button>
      </form>

      <p v-if="errorMessage" class="status error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="status success">{{ successMessage }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
useHead({
  title: 'Feedback | WhatDoTheyMake.com',
  meta: [
    { name: 'description', content: 'Share product feedback with WhatDoTheyMake.' }
  ]
})

const message = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const canSubmit = computed(() => message.value.trim().length >= 10)

async function submitFeedback() {
  if (!canSubmit.value || submitting.value) return

  errorMessage.value = ''
  successMessage.value = ''
  submitting.value = true
  try {
    await $fetch('/api/feedback', {
      method: 'POST',
      body: {
        message: message.value,
      }
    })

    message.value = ''
    successMessage.value = 'Thanks — feedback received.'
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || err?.statusMessage || err?.message || 'Could not send feedback right now.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.feedback-page {
  max-width: 760px;
  margin: 0 auto;
  padding: 2rem 1rem 1rem;
}

.feedback-card {
  background: var(--panel-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: 1.25rem;
}

h1 {
  margin: 0 0 0.5rem;
  font-family: var(--font-display);
  font-size: 1.8rem;
  color: var(--text-primary);
}

.feedback-subtitle {
  margin: 0 0 1rem;
  color: var(--text-secondary);
}

.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

label {
  font-weight: 600;
  color: var(--text-primary);
}

textarea,
input {
  width: 100%;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-lg);
  padding: 0.7rem 0.8rem;
  background: var(--input-bg);
  color: var(--text-primary);
}

textarea {
  min-height: 140px;
  resize: vertical;
}

.submit-btn {
  margin-top: 0.35rem;
  border: none;
  border-radius: var(--radius-full);
  padding: 0.7rem 1rem;
  background: var(--green-600);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status {
  margin: 0.75rem 0 0;
  font-size: 0.95rem;
}

.status.success {
  color: var(--green-600);
}

.status.error {
  color: var(--red-600);
}
</style>
