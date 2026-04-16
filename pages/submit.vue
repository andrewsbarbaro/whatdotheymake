<template>
  <div>
    <!-- Edit success -->
    <div v-if="editSuccess" class="edit-success-page">
      <div class="edit-success-inner">
        <div class="edit-success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h2 class="edit-success-title">Updated!</h2>
        <p class="edit-success-text">Your submission has been updated. The changes are live now and recorded in your change history.</p>
        <div class="edit-success-actions">
          <NuxtLink to="/feed" class="btn-primary">See the feed →</NuxtLink>
          <NuxtLink to="/" class="btn-secondary">Back to home</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Normal submit flow -->
    <SubmitFlow
      v-else-if="!submitResult"
      :edit-data="editData"
      :edit-token="editToken"
      @submitted="onSubmitted"
    />
    <UnderpaidScore
      v-else
      :result="submitResult"
      :was-anonymized="wasAnonymized"
    />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const editState = useState<any>('editData', () => null)

const isEditMode = computed(() => route.query.edit === '1' && editState.value)
const editData = computed(() => isEditMode.value ? editState.value : undefined)
const editToken = computed(() => isEditMode.value ? editState.value?.token : undefined)

useHead({
  title: isEditMode.value ? 'Edit Your Salary | WhatDoTheyMake.com' : 'Drop Your Salary | WhatDoTheyMake.com',
  meta: [
    { name: 'description', content: 'Share your salary anonymously in 30 seconds. No accounts. No paywalls.' }
  ]
})

const submitResult = ref<any>(null)
const wasAnonymized = ref(false)
const editSuccess = ref(false)

function onSubmitted(result: any) {
  if (result.isEdit) {
    editSuccess.value = true
    editState.value = null
  } else {
    submitResult.value = result
    wasAnonymized.value = result.wasAnonymized
  }
}
</script>

<style scoped>
.edit-success-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
}
.edit-success-inner {
  max-width: 450px;
  text-align: center;
}
.edit-success-icon { margin-bottom: 1.5rem; }
.edit-success-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.75rem;
}
.edit-success-text {
  color: var(--gray-500);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}
.edit-success-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}
</style>
