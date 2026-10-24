<script setup lang="ts">
import { useData, withBase } from 'vitepress'
import ThemeToggle from './ThemeToggle.vue'

const { site } = useData()
</script>

<template>
  <header class="im-header">
    <a class="im-header-brand" :href="withBase('/')">
      <span class="im-header-mark">
        <img :src="withBase('/vanillaos-logo-icon.svg')" alt="Vanilla OS" />
      </span>
      <span class="im-header-title">{{ site.title }}</span>
    </a>
    <nav class="im-header-nav">
      <a href="https://vanillaos.org/" target="_blank" rel="noreferrer">
        <i class="fa-solid fa-compass" aria-hidden="true" /> Vanilla OS
      </a>
      <ThemeToggle />
    </nav>
  </header>
</template>

<style scoped>
.im-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 62px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg) 86%, transparent);
  backdrop-filter: blur(12px);
}

.im-header-brand {
  display: flex;
  gap: 10px;
  align-items: center;
  font-weight: 700;
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.im-header-brand:hover {
  color: var(--vp-c-brand-1);
}

.im-header-mark {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--vos-mine-shaft);
}

.im-header-mark img {
  width: 19px;
  height: auto;
}

.im-header-title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.im-header-nav {
  display: flex;
  gap: 18px;
  align-items: center;
  font-size: 13px;
}

.im-header-nav a {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: var(--vp-c-text-2);
  text-decoration: none;
}

.im-header-nav a:hover {
  color: var(--vp-c-brand-1);
}

@media (max-width: 640px) {
  .im-header {
    padding: 0 16px;
  }

  .im-header-title {
    display: none;
  }

  .im-header-nav a {
    display: none;
  }
}
</style>
