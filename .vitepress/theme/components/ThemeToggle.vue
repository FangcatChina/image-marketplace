<script setup lang="ts">
import { useData } from 'vitepress'

const { isDark } = useData()
</script>

<template>
  <button
    type="button"
    class="im-theme-toggle"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="isDark = !isDark"
  >
    <i :class="isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'" aria-hidden="true" />
  </button>
</template>

<style scoped>
.im-theme-toggle {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 9px;
  color: var(--vp-c-text-2);
  background: transparent;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}

.im-theme-toggle:hover {
  border-color: var(--vos-yellow-orange);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
</style>
