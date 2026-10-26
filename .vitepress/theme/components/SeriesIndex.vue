<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data } from '../../data/images.data'
import ImageBadges from './ImageBadges.vue'
import SiteHeader from './SiteHeader.vue'
import { imageRef } from '../utils/repo'
import { memberUrl } from '../utils/series'

const { page } = useData()

const series = computed(() => {
  const url = `/${page.value.relativePath.replace(/(^|\/)index\.md$/, '$1')}`
  return data.series.find((entry) => entry.url === url)
})

const guide = computed(() => {
  const entry = series.value
  if (!entry) return []

  return entry.groups.map((group) => ({
    label: group.label,
    options: group.options.map((option) => {
      const url = memberUrl(entry.url, option.target)
      const image = entry.images.find((item) => item.url === url)

      return {
        key: `${option.label}→${option.target}`,
        label: option.label,
        href: withBase(image?.url ?? url),
        ref: image ? imageRef(image.refs[0].image, image.refs[0].tag) : '',
        extra: image && image.refs.length > 1 ? image.refs.length - 1 : 0
      }
    })
  }))
})
</script>

<template>
  <div class="im-page">
    <SiteHeader />

    <main class="im-series">
      <a class="im-series-back" :href="withBase('/')">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" />
        Marketplace
      </a>

      <template v-if="series">
        <header class="im-series-head">
          <div class="im-series-title-row">
            <h1 class="im-series-title">{{ series.name }}</h1>
            <ImageBadges
              :maintainer="series.maintainer"
              :status="series.status"
              series
              :count="series.images.length"
            />
          </div>
          <div v-if="series.tags.length" class="im-series-tags">
            <span v-for="tag in series.tags" :key="tag">#{{ tag }}</span>
          </div>
        </header>

        <section v-if="guide.length" class="im-guide">
          <h2 class="im-section-title">
            <i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
            Choose an image
          </h2>
          <div class="im-guide-groups">
            <div v-for="group in guide" :key="group.label" class="im-guide-group">
              <span class="im-guide-label">{{ group.label }}</span>
              <div class="im-guide-options">
                <a
                  v-for="option in group.options"
                  :key="option.key"
                  class="im-guide-option"
                  :href="option.href"
                >
                  <i class="fa-solid fa-arrow-right-long" aria-hidden="true" />
                  <span class="im-guide-option-name">{{ option.label }}</span>
                  <code v-if="option.ref" class="im-guide-option-ref">
                    {{ option.ref }}
                    <span v-if="option.extra" class="im-guide-extra">+{{ option.extra }}</span>
                  </code>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section class="im-series-images">
          <h2 class="im-section-title">
            <i class="fa-solid fa-layer-group" aria-hidden="true" />
            All images
          </h2>

          <div class="im-series-grid">
            <a
              v-for="image in series.images"
              :key="image.url"
              class="im-series-card"
              :href="withBase(image.url)"
            >
              <div class="im-series-card-head">
                <h3 class="im-series-card-name">{{ image.name }}</h3>
                <ImageBadges
                  :maintainer="image.maintainer"
                  :status="image.status"
                  :collection="image.collection"
                  :count="image.refs.length"
                />
              </div>
              <code class="im-series-card-ref">
                {{ imageRef(image.refs[0].image, image.refs[0].tag) }}
                <span v-if="image.refs.length > 1" class="im-guide-extra">
                  +{{ image.refs.length - 1 }}
                </span>
              </code>
              <div v-if="image.tags.length" class="im-series-card-tags">
                <span v-for="tag in image.tags" :key="tag">#{{ tag }}</span>
              </div>
              <span class="im-series-card-more">
                View details
                <i class="fa-solid fa-arrow-right" aria-hidden="true" />
              </span>
            </a>
          </div>

          <p v-if="!series.images.length" class="im-series-empty">
            <i class="fa-regular fa-face-frown" aria-hidden="true" />
            This series does not contain any image yet.
          </p>
        </section>
      </template>

      <p v-else class="im-series-empty">
        <i class="fa-regular fa-face-frown" aria-hidden="true" />
        This series could not be found.
      </p>
    </main>
  </div>
</template>

<style scoped>
.im-series {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 24px 96px;
}

.im-series-back {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  color: var(--vp-c-text-3);
  font-size: 12px;
  text-decoration: none;
}

.im-series-back:hover {
  color: var(--vp-c-brand-1);
}

.im-series-head {
  margin-top: 18px;
}

.im-series-title-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.im-series-title {
  margin: 0;
  border: 0;
  padding: 0;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.025em;
}

.im-series-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.im-series-tags span {
  padding: 1px 8px;
  border-radius: 999px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-default-soft);
  font-size: 12px;
}

.im-section-title {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 36px 0 14px;
  border: 0;
  padding: 0;
  color: var(--vp-c-text-3);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.im-section-title i {
  font-size: 11px;
}

.im-guide-groups {
  display: grid;
  gap: 14px;
}

.im-guide-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  align-items: baseline;
  padding: 14px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-alt);
}

.im-guide-label {
  flex: 0 0 130px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 600;
}

.im-guide-options {
  display: flex;
  flex: 1 1 320px;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.im-guide-option {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 9px;
  background: var(--vp-c-bg);
  text-decoration: none;
  transition: color 0.2s, border-color 0.2s;
}

.im-guide-option:hover {
  border-color: var(--vos-yellow-orange);
}

.im-guide-option > i {
  color: var(--vos-yellow-orange);
  font-size: 10px;
}

.im-guide-option-name {
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 600;
}

.im-guide-option-ref {
  padding: 0;
  color: var(--vp-c-text-3);
  background: transparent;
  font-size: 11px;
}

.im-guide-extra {
  margin-left: 4px;
  padding: 0 5px;
  border-radius: 999px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-default-soft);
  font-size: 10px;
}

.im-series-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.im-series-card {
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

.im-series-card:hover {
  border-color: var(--vos-yellow-orange);
  transform: translateY(-2px);
  box-shadow: 0 10px 26px var(--im-shadow);
}

.im-series-card-head {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.im-series-card-name {
  margin: 0;
  border: 0;
  padding: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.01em;
}

.im-series-card-ref {
  overflow: hidden;
  color: var(--vp-c-text-2);
  background: transparent;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.im-series-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.im-series-card-more {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  margin-top: auto;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 600;
}

.im-series-empty {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 36px 0;
  color: var(--vp-c-text-3);
  font-size: 14px;
}

@media (max-width: 768px) {
  .im-series {
    padding: 24px 16px 72px;
  }

  .im-series-title {
    font-size: 24px;
  }

  .im-guide-label {
    flex-basis: 100%;
  }
}
</style>
