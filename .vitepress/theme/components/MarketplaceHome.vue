<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { data as entries } from '../../data/images.data'
import ImageBadges from './ImageBadges.vue'
import SiteHeader from './SiteHeader.vue'
import type { ViewMode } from '../types'
import { imageRef } from '../utils/repo'

const query = ref('')
const selectedTags = ref<string[]>([])
const view = ref<ViewMode>('grid')

const tagCounts = computed(() => {
  const counts = new Map<string, number>()
  for (const entry of entries) {
    for (const tag of entry.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  )
})

const filtered = computed(() => {
  const keyword = query.value.trim().toLowerCase()

  return entries.filter((entry) => {
    const haystack = [
      entry.name,
      entry.branch,
      ...entry.refs.map((item) => imageRef(item.image, item.tag)),
      ...entry.tags
    ]
      .join(' ')
      .toLowerCase()
    const matchesKeyword = !keyword || haystack.includes(keyword)
    const matchesTags = selectedTags.value.every((tag) => entry.tags.includes(tag))
    return matchesKeyword && matchesTags
  })
})

function toggleTag(tag: string) {
  const index = selectedTags.value.indexOf(tag)
  if (index === -1) selectedTags.value.push(tag)
  else selectedTags.value.splice(index, 1)
}

function resetFilters() {
  query.value = ''
  selectedTags.value = []
}
</script>

<template>
  <div class="im-page">
    <SiteHeader />

    <main class="im-home">
      <header class="im-hero">
        <div class="im-hero-art" aria-hidden="true" />
        <div class="im-hero-content">
          <h1 class="im-hero-title">Vanilla OS Image Marketplace</h1>
          <p class="im-hero-text">
            Browse official and community maintained images.
          </p>
        </div>
      </header>

      <div class="im-toolbar">
        <label class="im-search">
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input v-model="query" type="search" placeholder="Search by name, image or tag…" />
          <button v-if="query" type="button" aria-label="Clear search" @click="query = ''">
            <i class="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </label>

        <div class="im-views" role="group" aria-label="Switch view">
          <button
            type="button"
            :class="{ 'is-active': view === 'grid' }"
            @click="view = 'grid'"
          >
            <i class="fa-solid fa-table-cells-large" aria-hidden="true" />
            Grid
          </button>
          <button
            type="button"
            :class="{ 'is-active': view === 'sheet' }"
            @click="view = 'sheet'"
          >
            <i class="fa-solid fa-list" aria-hidden="true" />
            Sheet
          </button>
        </div>
      </div>

      <div class="im-filters">
        <button
          type="button"
          class="im-filter"
          :class="{ 'is-active': !selectedTags.length }"
          @click="selectedTags = []"
        >
          All
          <span>{{ entries.length }}</span>
        </button>
        <button
          v-for="[tag, count] in tagCounts"
          :key="tag"
          type="button"
          class="im-filter"
          :class="{ 'is-active': selectedTags.includes(tag) }"
          @click="toggleTag(tag)"
        >
          #{{ tag }}
          <span>{{ count }}</span>
        </button>
      </div>

      <div class="im-summary">
        <span>Showing {{ filtered.length }} of {{ entries.length }} images</span>
        <button v-if="query || selectedTags.length" type="button" @click="resetFilters">
          <i class="fa-solid fa-rotate-left" aria-hidden="true" />
          Reset filters
        </button>
      </div>

      <p v-if="!filtered.length" class="im-empty">
        <i class="fa-regular fa-face-frown" aria-hidden="true" />
        No images match your filters. Try another keyword or tag.
      </p>

      <div v-else-if="view === 'grid'" class="im-grid">
        <a
          v-for="entry in filtered"
          :key="entry.url"
          class="im-card"
          :href="withBase(entry.url)"
        >
          <div class="im-card-head">
            <h2 class="im-card-name">{{ entry.name }}</h2>
            <ImageBadges
              :maintainer="entry.maintainer"
              :status="entry.status"
              :collection="entry.collection"
              :count="entry.refs.length"
            />
          </div>
          <code class="im-card-ref">
            {{ imageRef(entry.refs[0].image, entry.refs[0].tag) }}
            <span v-if="entry.refs.length > 1" class="im-card-extra">+{{ entry.refs.length - 1 }}</span>
          </code>
          <div class="im-card-tags">
            <span v-for="tag in entry.tags" :key="tag">#{{ tag }}</span>
          </div>
          <span class="im-card-more">
            View details
            <i class="fa-solid fa-arrow-right" aria-hidden="true" />
          </span>
        </a>
      </div>

      <div v-else class="im-sheet">
        <div class="im-sheet-row im-sheet-head">
          <span>Image</span>
          <span>Reference</span>
          <span>Tags</span>
          <span>Status</span>
          <span />
        </div>
        <a
          v-for="entry in filtered"
          :key="entry.url"
          class="im-sheet-row"
          :href="withBase(entry.url)"
        >
          <span class="im-sheet-name">{{ entry.name }}</span>
          <code class="im-sheet-ref">
            {{ imageRef(entry.refs[0].image, entry.refs[0].tag) }}
            <span v-if="entry.refs.length > 1" class="im-card-extra">+{{ entry.refs.length - 1 }}</span>
          </code>
          <span class="im-sheet-tags">{{ entry.tags.map((tag) => `#${tag}`).join(' ') }}</span>
          <span class="im-sheet-badges">
            <ImageBadges
              :maintainer="entry.maintainer"
              :status="entry.status"
              :collection="entry.collection"
              :count="entry.refs.length"
            />
          </span>
          <i class="fa-solid fa-arrow-right im-sheet-arrow" aria-hidden="true" />
        </a>
      </div>
    </main>
  </div>
</template>

<style scoped>
.im-home {
  max-width: 1120px;
  margin: 0 auto;
  padding: 56px 24px 96px;
}

.im-hero {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 240px;
  padding: 36px 40px;
  isolation: isolate;
}

.im-hero-art {
  position: absolute;
  z-index: -1;
  inset: 0;
  border-radius: 20px;
  background-image: url('https://raw.githubusercontent.com/Vanilla-OS/vanilla-backgrounds/refs/heads/main/backgrounds/fairy-tale-light.webp');
  background-position: left center;
  background-size: cover;
  background-repeat: no-repeat;
  -webkit-mask-image: linear-gradient(
    to right,
    #000 0%,
    #000 34%,
    color-mix(in srgb, #000 40%, transparent) 62%,
    transparent 88%
  );
  mask-image: linear-gradient(
    to right,
    #000 0%,
    #000 34%,
    color-mix(in srgb, #000 40%, transparent) 62%,
    transparent 88%
  );
}

.dark .im-hero-art {
  background-image: url('https://raw.githubusercontent.com/Vanilla-OS/vanilla-backgrounds/refs/heads/main/backgrounds/fairy-tale-dark.webp');
}

.im-hero-content {
  position: relative;
  max-width: 560px;
}

.im-hero-title {
  margin: 0;
  border: 0;
  padding: 0;
  font-size: 42px;
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.03em;
}

.im-hero-title::after {
  display: block;
  width: 56px;
  height: 4px;
  margin-top: 16px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--vos-yellow-orange), var(--vos-laser-lemon));
  content: '';
}

.im-hero-text {
  max-width: 640px;
  margin: 14px 0 0;
  color: var(--vp-c-text-2);
  font-size: 15px;
  line-height: 1.7;
}

.im-hero-text code {
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--vp-c-default-soft);
  font-size: 13px;
}

.im-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-top: 32px;
}

.im-search {
  display: flex;
  flex: 1 1 320px;
  gap: 10px;
  align-items: center;
  padding: 0 14px;
  height: 44px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-3);
  transition: border-color 0.2s;
}

.im-search:focus-within {
  border-color: var(--vp-c-brand-1);
}

.im-search input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  color: var(--vp-c-text-1);
  background: transparent;
  font-size: 14px;
}

.im-search input::-webkit-search-cancel-button {
  display: none;
}

.im-search button {
  border: 0;
  color: var(--vp-c-text-3);
  background: transparent;
  cursor: pointer;
}

.im-views {
  display: flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-alt);
}

.im-views button {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  padding: 7px 14px;
  border: 0;
  border-radius: 8px;
  color: var(--vp-c-text-2);
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}

.im-views button.is-active {
  color: var(--im-on-brand);
  background: var(--vos-yellow-orange);
}

.im-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}

.im-filter {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 4px 11px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  color: var(--vp-c-text-2);
  background: transparent;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}

.im-filter span {
  color: var(--vp-c-text-3);
  font-size: 11px;
}

.im-filter:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.im-filter.is-active {
  border-color: var(--vos-yellow-orange);
  color: var(--vp-c-text-1);
  background: var(--vp-c-brand-soft);
}

.im-filter.is-active span {
  color: var(--im-on-brand);
  background: var(--vos-yellow-orange);
  border-radius: 999px;
  padding: 0 6px;
}

.im-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin: 28px 0 16px;
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.im-summary button {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  border: 0;
  color: var(--vp-c-brand-1);
  background: transparent;
  font-size: 12px;
  cursor: pointer;
}

.im-empty {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 48px 0;
  color: var(--vp-c-text-3);
  font-size: 14px;
}

.im-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.im-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-alt);
  text-decoration: none;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}

.im-card:hover {
  border-color: var(--vos-yellow-orange);
  transform: translateY(-2px);
  box-shadow: 0 10px 26px var(--im-shadow);
}

.im-card-head {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.im-card-name {
  margin: 0;
  border: 0;
  padding: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.01em;
}

.im-card-ref {
  overflow: hidden;
  color: var(--vp-c-text-2);
  background: transparent;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.im-card-extra {
  margin-left: 4px;
  padding: 0 5px;
  border-radius: 999px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-default-soft);
  font-size: 10px;
}

.im-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.im-card-more {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  margin-top: auto;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 600;
}

.im-sheet {
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-alt);
}

.im-sheet-row {
  display: grid;
  gap: 16px;
  align-items: center;
  grid-template-columns: 1.4fr 1.6fr 1fr 1fr 16px;
  padding: 13px 18px;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  font-size: 13px;
  text-decoration: none;
}

.im-sheet-row:first-child {
  border-top: none;
}

.im-sheet-head {
  color: var(--vp-c-text-3);
  background: var(--vp-c-default-soft);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

a.im-sheet-row:hover {
  background: var(--vp-c-default-soft);
}

.im-sheet-name {
  font-weight: 600;
}

.im-sheet-ref {
  overflow: hidden;
  color: var(--vp-c-text-2);
  background: transparent;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.im-sheet-tags {
  overflow: hidden;
  color: var(--vp-c-text-3);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.im-sheet-arrow {
  color: var(--vp-c-text-3);
  font-size: 11px;
}

@media (max-width: 820px) {
  .im-home {
    padding: 32px 16px 72px;
  }

  .im-hero {
    min-height: 200px;
  }

  .im-hero-content {
    padding-left: 0;
  }

  .im-hero-title {
    font-size: 28px;
  }

  .im-sheet-head {
    display: none;
  }

  .im-sheet-row {
    grid-template-columns: 1fr auto;
    gap: 6px 12px;
  }

  .im-sheet-name {
    grid-column: 1;
  }

  .im-sheet-ref {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .im-sheet-tags {
    grid-column: 1;
    grid-row: 3;
  }

  .im-sheet-badges {
    grid-column: 2;
    grid-row: 1;
  }

  .im-sheet-arrow {
    display: none;
  }
}
</style>
