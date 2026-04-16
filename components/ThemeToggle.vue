<template>
  <button
    class="theme-toggle"
    type="button"
    :aria-label="label"
    :title="label"
    @click="toggle"
  >
    <span class="icon" aria-hidden="true">{{ isDark ? '☀' : '🌙' }}</span>
  </button>
</template>

<script setup lang="ts">
const STORAGE_KEY = 'wdtm_theme'

const isDark = ref(false)

const label = computed(() => isDark.value ? 'Switch to light mode' : 'Switch to dark mode')

function applyTheme(dark: boolean, persist = true) {
  isDark.value = dark

  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', dark)
  }

  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
    } catch {
      // ignore
    }
  }
}

function toggle() {
  applyTheme(!isDark.value)
}

onMounted(() => {
  let theme: 'dark' | 'light' | null = null

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') theme = saved
  } catch {
    // ignore
  }

  if (!theme) {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
    theme = prefersDark ? 'dark' : 'light'
  }

  applyTheme(theme === 'dark', false)
})
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 9999;

  width: 48px;
  height: 48px;
  border-radius: 999px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: var(--white);
  border: 2px solid var(--gray-200);
  box-shadow: var(--shadow-md);

  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

.theme-toggle:hover {
  transform: translateY(-2px);
  border-color: var(--green-300);
}

.theme-toggle:active {
  transform: translateY(0);
}

.icon {
  font-size: 1.1rem;
  line-height: 1;
}
</style>
