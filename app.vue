<template>
  <div class="app">
    <NavBar />
    <main>
      <NuxtPage />
    </main>
    <FooterSection />

    <ClientOnly>
      <ThemeToggle />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
// Apply theme as early as possible on the client to avoid a light->dark flash.
useHead({
  script: [
    {
      innerHTML: `(() => {
  try {
    const k = 'wdtm_theme';
    const saved = localStorage.getItem(k);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === 'dark' : prefersDark;
    if (dark) document.documentElement.classList.add('dark');
  } catch {}
})();`,
    }
  ]
})
</script>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>
