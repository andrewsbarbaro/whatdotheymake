<template>
  <nav class="navbar">
    <div class="navbar-inner container">
      <NuxtLink to="/" class="logo">
        <img src="/logo.png" alt="What Do They Make" class="logo-img" />
      </NuxtLink>
      <div class="nav-links">
        <NuxtLink to="/feed" class="nav-link">Browse</NuxtLink>
        <NuxtLink to="/affiliates" class="nav-link">Partners &amp; Affliates</NuxtLink>
        <NuxtLink to="/delete" class="nav-link">Manage</NuxtLink>
        <NuxtLink to="/feedback" class="nav-link">Feedback</NuxtLink>
        <NuxtLink to="/submit" class="nav-cta btn-primary">Spill Your Salary →</NuxtLink>
      </div>
      <div class="mobile-nav-controls">
        <NuxtLink to="/submit" class="mobile-submit btn-primary">Submit</NuxtLink>
        <button
          type="button"
          class="menu-toggle"
          :aria-expanded="menuOpen ? 'true' : 'false'"
          aria-controls="mobile-nav-panel"
          @click="menuOpen = !menuOpen"
        >
          {{ menuOpen ? 'Close' : 'Menu' }}
        </button>
      </div>
    </div>
    <div v-if="menuOpen" id="mobile-nav-panel" class="mobile-nav-panel container">
      <NuxtLink to="/feed" class="mobile-nav-link" @click="menuOpen = false">Browse</NuxtLink>
      <NuxtLink to="/affiliates" class="mobile-nav-link" @click="menuOpen = false">Partners &amp; Affliates</NuxtLink>
      <NuxtLink to="/delete" class="mobile-nav-link" @click="menuOpen = false">Manage</NuxtLink>
      <NuxtLink to="/feedback" class="mobile-nav-link" @click="menuOpen = false">Feedback</NuxtLink>
      <NuxtLink to="/submit" class="mobile-nav-cta btn-primary" @click="menuOpen = false">Spill Your Salary →</NuxtLink>
    </div>
  </nav>
</template>
<script setup lang="ts">
const route = useRoute()
const menuOpen = ref(false)

watch(() => route.fullPath, () => {
  menuOpen.value = false
})
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 3000;
  background: var(--nav-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--nav-border);
}

.navbar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.875rem;
  padding-bottom: 0.875rem;
  max-width: 1100px;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: opacity 0.2s;
}

.logo:hover {
  opacity: 0.85;
}

.logo-img {
  height: 36px;
  width: auto;
  display: block;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.mobile-nav-controls {
  display: none;
  align-items: center;
  gap: 0.55rem;
}

.nav-link {
  color: var(--nav-link);
  font-weight: 500;
  font-size: 0.95rem;
  text-decoration: none;
  transition: color 0.2s;
}

.nav-link:hover { color: var(--nav-link-hover); }

.nav-cta {
  padding: 0.625rem 1.25rem;
  font-size: 0.9rem;
  text-decoration: none;
}

.mobile-submit {
  padding: 0.45rem 0.8rem;
  font-size: 0.78rem;
  text-decoration: none;
}

.menu-toggle {
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--white) 90%, var(--green-50) 10%);
  color: var(--gray-700);
  font-weight: 700;
  font-size: 0.8rem;
  padding: 0.4rem 0.75rem;
  cursor: pointer;
}

.mobile-nav-panel {
  display: none;
}

@media (max-width: 500px) {
  .logo-img { height: 28px; }
  .nav-links { display: none; }
  .mobile-nav-controls { display: inline-flex; }
  .mobile-nav-panel {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-bottom: 0.85rem;
  }
  .mobile-nav-link {
    color: var(--nav-link);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    padding: 0.15rem 0;
  }
  .mobile-nav-cta {
    margin-top: 0.2rem;
    width: 100%;
    text-decoration: none;
    font-size: 0.88rem;
    padding: 0.62rem 1rem;
  }
}
</style>
