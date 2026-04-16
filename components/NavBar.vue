<template>
  <nav class="navbar">
    <div class="navbar-inner container">
      <NuxtLink to="/" class="logo">
        <img src="/logo.png" alt="What Do They Make" class="logo-img" />
      </NuxtLink>
      <div class="nav-links">
        <NuxtLink to="/feed" class="nav-link">Browse</NuxtLink>
        <NuxtLink to="/delete" class="nav-link">Manage</NuxtLink>
        <NuxtLink to="/feedback" class="nav-link">Feedback</NuxtLink>
        <NuxtLink to="/submit" class="nav-cta btn-primary">Spill Your Salary →</NuxtLink>
      </div>
    </div>
  </nav>
</template>

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

@media (max-width: 500px) {
  .logo-img { height: 28px; }
  .nav-link { display: none; }
  .nav-cta { font-size: 0.8rem; padding: 0.5rem 1rem; }
}
</style>
