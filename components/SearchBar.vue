<template>
  <div class="search-bar">
    <div class="search-inner">
      <span class="search-icon">🔍</span>
      <input
        type="text"
        class="search-input"
        placeholder="Search by job title, company, city, or country..."
        :value="modelValue"
        @input="handleInput"
      />
      <button
        v-if="modelValue"
        class="search-clear"
        @click="$emit('update:modelValue', '')"
        aria-label="Clear search"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function handleInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('update:modelValue', value)
  }, 300)
}
</script>

<style scoped>
.search-bar {
  margin: 0 auto;
  max-width: 600px;
  padding: 0 1.5rem;
}

.search-inner {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--white);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: 0 1.25rem;
  transition: border-color 0.2s;
}

.search-inner:focus-within {
  border-color: var(--green-400);
  box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.1);
}

.search-icon {
  font-size: 1.1rem;
  color: var(--gray-400);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-family: var(--font-body);
  font-size: 1rem;
  padding: 1rem 0;
  color: var(--gray-900);
  background: transparent;
}

.search-input::placeholder {
  color: var(--gray-400);
}

.search-clear {
  background: var(--gray-100);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--gray-500);
  font-size: 0.9rem;
  transition: all 0.2s;
}

.search-clear:hover {
  background: var(--green-100);
  color: var(--green-600);
}
</style>
