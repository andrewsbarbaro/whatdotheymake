<template>
  <div class="manage-page">
    <div class="manage-inner">
      <h1 class="manage-title">Manage Your Data</h1>
      <p class="manage-sub">
        Paste the management code you received when you submitted your salary.
        You can edit your info or delete it entirely.
      </p>

      <!-- Step 1: Enter token -->
      <div v-if="!salaryData && !deleted" class="manage-form">
        <input
          v-model="token"
          type="text"
          class="manage-input"
          placeholder="Paste your code here"
          @keyup.enter="handleLookup"
        />
        <button
          class="btn-primary manage-btn"
          :disabled="!token.trim() || loading"
          @click="handleLookup"
        >
          {{ loading ? 'Looking up...' : 'Find My Submission' }}
        </button>
        <p v-if="error" class="manage-error">{{ error }}</p>
      </div>

      <!-- Step 2: Show data + Edit/Delete -->
      <div v-else-if="salaryData && !deleted" class="manage-preview">
        <div class="preview-card">
          <div class="preview-header">
            <h3 class="preview-title">{{ salaryData.job_title }}</h3>
            <span class="preview-salary">${{ formatNum(salaryData.salary) }}{{ salaryData.pay_type === 'hourly' ? '/hr' : '/yr' }}</span>
          </div>
          <div class="preview-meta">
            <span v-if="salaryData.company">{{ salaryData.company }}</span>
            <span v-if="salaryData.city || salaryData.state">{{ [salaryData.city, salaryData.state].filter(Boolean).join(', ') }}</span>
            <span v-if="salaryData.years_experience">{{ salaryData.years_experience }} years exp</span>
            <span v-if="salaryData.education">{{ salaryData.education }}</span>
            <span v-if="salaryData.car">{{ salaryData.car }}</span>
            <span v-if="salaryData.salary_history?.length">{{ salaryData.salary_history.length }} past roles</span>
          </div>

          <div v-if="salaryData.submission_audit?.length" class="audit-trail">
            <h4 class="audit-title">Change history</h4>
            <p class="audit-sub">Edits made with this code are logged here.</p>
            <ul class="audit-list">
              <li v-for="item in salaryData.submission_audit" :key="item.id" class="audit-item">
                <span class="audit-event">{{ formatAuditEvent(item.event_type) }}</span>
                <span class="audit-time">{{ formatAuditTime(item.created_at) }}</span>
                <span v-if="item.summary" class="audit-summary">{{ item.summary }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="manage-actions">
          <button class="btn-primary edit-btn" @click="handleEdit">
            Edit My Info →
          </button>
          <button class="delete-action-btn" :disabled="deleting" @click="handleDelete">
            {{ deleting ? 'Deleting...' : 'Delete Permanently' }}
          </button>
        </div>
        <p v-if="error" class="manage-error">{{ error }}</p>
      </div>

      <!-- Step 3: Deleted success -->
      <div v-else-if="deleted" class="manage-success">
        <div class="success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h2 class="success-title">Gone forever</h2>
        <p class="success-text">Your submission has been permanently deleted. No trace left.</p>
        <NuxtLink to="/" class="btn-secondary">Back to home</NuxtLink>
      </div>

      <div class="manage-note">
        <p>Don’t have your code? We can’t identify your submission without it because there are no accounts.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Manage Your Data | WhatDoTheyMake.com',
  meta: [
    { name: 'description', content: 'Edit or delete your anonymous salary submission.' }
  ]
})

const token = ref('')
const loading = ref(false)
const deleting = ref(false)
const deleted = ref(false)
const error = ref('')
const salaryData = ref<any>(null)

const editState = useState<any>('editData', () => null)

async function handleLookup() {
  if (!token.value.trim()) return
  loading.value = true
  error.value = ''

  try {
    const data = await $fetch('/api/lookup', {
      method: 'POST',
      body: { token: token.value.trim() }
    })
    salaryData.value = data
  } catch (err: any) {
    error.value = err.data?.message || err.data?.statusMessage || 'Something went wrong.'
  } finally {
    loading.value = false
  }
}

function handleEdit() {
  editState.value = { token: token.value.trim(), ...salaryData.value }
  navigateTo('/submit?edit=1')
}

async function handleDelete() {
  deleting.value = true
  error.value = ''

  try {
    await $fetch('/api/delete', {
      method: 'POST',
      body: { token: token.value.trim() }
    })
    deleted.value = true
  } catch (err: any) {
    error.value = err.data?.message || 'Something went wrong. Try again.'
  } finally {
    deleting.value = false
  }
}

function formatNum(n: number) {
  return n.toLocaleString()
}

function formatAuditEvent(type: string) {
  if (type === 'created') return 'Created'
  if (type === 'edited') return 'Edited'
  return 'Updated'
}

function formatAuditTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}
</script>

<style scoped>
.manage-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
}

.manage-inner {
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.manage-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.75rem;
}

.manage-sub {
  font-size: 1rem;
  color: var(--gray-500);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.manage-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.manage-input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  font-family: monospace;
  font-size: 0.95rem;
  color: var(--gray-900);
  text-align: center;
  outline: none;
  transition: border-color 0.2s;
}

.manage-input:focus {
  border-color: var(--green-400);
  box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.1);
}

.manage-input::placeholder {
  font-family: var(--font-body);
  color: var(--gray-400);
}

.manage-btn { width: 100%; }

.manage-error {
  color: #ef4444;
  font-size: 0.9rem;
}

.manage-preview {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.preview-card {
  background: var(--white);
  border: 2px solid var(--green-200);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  text-align: left;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.preview-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
}

.preview-salary {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--green-600);
  white-space: nowrap;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.preview-meta span {
  font-size: 0.8rem;
  color: var(--gray-600);
  background: var(--gray-50);
  padding: 0.3rem 0.6rem;
  border-radius: var(--radius-full);
  font-weight: 500;
}

.audit-trail {
  margin-top: 1rem;
  border-top: 1px solid var(--gray-100);
  padding-top: 0.9rem;
}

.audit-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--gray-700);
  margin-bottom: 0.25rem;
}

.audit-sub {
  font-size: 0.78rem;
  color: var(--gray-500);
  margin-bottom: 0.55rem;
}

.audit-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.audit-item {
  background: var(--gray-50);
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-md);
  padding: 0.45rem 0.6rem;
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 0.6rem;
  row-gap: 0.2rem;
  align-items: center;
}

.audit-event {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--green-700);
}

.audit-time {
  font-size: 0.74rem;
  color: var(--gray-500);
  justify-self: end;
}

.audit-summary {
  grid-column: 1 / -1;
  font-size: 0.74rem;
  color: var(--gray-600);
}

.manage-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.edit-btn { width: 100%; }

.delete-action-btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: #ef4444;
  border: 2px solid #fecaca;
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-action-btn:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #ef4444;
}

.delete-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.manage-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.success-icon { margin-bottom: 0.5rem; }

.success-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-900);
}

.success-text {
  color: var(--gray-500);
  font-size: 1rem;
  margin-bottom: 1rem;
}

.manage-note {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--gray-100);
}

.manage-note p {
  font-size: 0.8rem;
  color: var(--gray-400);
  line-height: 1.5;
}
</style>
