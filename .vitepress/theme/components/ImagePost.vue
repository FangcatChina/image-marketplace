<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useData, withBase } from 'vitepress'
import { data } from '../../data/images.data'
import ImageBadges from './ImageBadges.vue'
import CommandBar from './CommandBar.vue'
import SiteHeader from './SiteHeader.vue'
import { useMarkdownHtml, useRecipeHtml } from '../composables/useContentRender'
import { useRemoteFile } from '../composables/useRemoteFile'
import type { Maintainer, PostTab, Status } from '../types'
import { expandRefs, imageRef, normalizeRepo, rawFileUrls, repoBlobUrl } from '../utils/repo'

const { frontmatter, isDark, page } = useData()

const series = computed(() => {
  const url = `/${page.value.relativePath.replace(/\.md$/, '')}`
  return data.series.find((entry) => entry.images.some((image) => image.url === url))
})

const name = computed(() => String(frontmatter.value.name ?? 'Untitled image'))
const repo = computed(() => normalizeRepo(String(frontmatter.value.repo ?? '')))
const branch = computed(() => String(frontmatter.value.branch ?? 'main'))
const maintainer = computed<Maintainer>(() => frontmatter.value.maintainer ?? 'community')
const status = computed<Status>(() => frontmatter.value.status ?? 'normal')
const tags = computed<string[]>(() => frontmatter.value.tags ?? [])

const customRaw = computed(() => String(frontmatter.value.custom_raw ?? ''))
const refs = computed(() => expandRefs(frontmatter.value.image, frontmatter.value.tag))
const refList = computed(() => refs.value.map((item) => imageRef(item.image, item.tag)))
const isCollection = computed(
  () => Boolean(frontmatter.value.collection) && refList.value.length > 1
)
const collectionFlag = computed(() => Boolean(frontmatter.value.collection))

const selectedRef = ref('')
watch(
  refList,
  (list) => (selectedRef.value = list[0] ?? ''),
  { immediate: true }
)

const rebasePrefix = 'abroot rebase '
const repoName = computed(() => repo.value.split('/').filter(Boolean).pop() ?? '')

const tabs: { id: PostTab; label: string; icon: string }[] = [
  { id: 'readme', label: 'README', icon: 'fa-regular fa-file-lines' },
  { id: 'recipe', label: 'RECIPE', icon: 'fa-solid fa-flask' }
]

const activeTab = ref<PostTab>('readme')
const recipePath = ref('recipe.yml')

watch([repo, branch], () => (recipePath.value = 'recipe.yml'))

const readmeUrls = computed(() =>
  rawFileUrls(repo.value, branch.value, 'README.md', customRaw.value)
)
const recipeUrls = computed(() =>
  rawFileUrls(repo.value, branch.value, recipePath.value, customRaw.value)
)

const {
  content: readmeSource,
  loading: readmeLoading,
  error: readmeError,
  reload: reloadReadme
} = useRemoteFile(readmeUrls)

const {
  content: recipeSource,
  loading: recipeLoading,
  error: recipeError,
  reload: reloadRecipe
} = useRemoteFile(recipeUrls, () => activeTab.value === 'recipe')

const { html: readmeHtml, rendering: readmeRendering } = useMarkdownHtml(readmeSource, () => ({
  repo: repo.value,
  branch: branch.value,
  dark: isDark.value
}))

const { html: recipeHtml, rendering: recipeRendering } = useRecipeHtml(recipeSource, () => ({
  dark: isDark.value,
  path: recipePath.value
}))

function openRecipeLink(event: Event) {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-path]')
  if (!target) return

  event.preventDefault()
  recipePath.value = target.dataset.path ?? recipePath.value
}
</script>

<template>
  <div class="im-page">
    <SiteHeader />

    <main class="im-post">
      <a v-if="series" class="im-post-series" :href="withBase(series.url)">
        <i class="fa-solid fa-boxes-stacked" aria-hidden="true" />
        {{ series.name }}
      </a>

      <div class="im-post-header">
        <div class="im-post-heading">
          <div class="im-post-title-row">
            <h1 class="im-post-title">{{ name }}</h1>
            <ImageBadges
              :maintainer="maintainer"
              :status="status"
              :collection="collectionFlag"
              :count="refList.length"
            />
          </div>
          <p class="im-post-ref">{{ selectedRef }}</p>
          <div v-if="tags.length" class="im-post-tags">
            <span v-for="item in tags" :key="item" class="im-post-tag">#{{ item }}</span>
          </div>
        </div>

        <CommandBar
          v-model:value="selectedRef"
          :prefix="rebasePrefix"
          :options="isCollection ? refList : undefined"
        />
      </div>

      <div class="im-tabs" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          role="tab"
          class="im-tab"
          :class="{ 'is-active': activeTab === tab.id }"
          :aria-selected="activeTab === tab.id"
          @click="activeTab = tab.id"
        >
          <i :class="tab.icon" aria-hidden="true" />
          {{ tab.label }}
        </button>

        <a v-if="repo" class="im-tabs-repo" :href="repo" target="_blank" rel="noreferrer">
          <i class="fa-brands fa-github" aria-hidden="true" />
          {{ repoName }} · {{ branch }}
        </a>
      </div>

      <section class="im-panel" role="tabpanel">
        <template v-if="activeTab === 'readme'">
          <p v-if="!readmeUrls.length" class="im-state im-state--error">
            <i class="fa-solid fa-circle-exclamation" aria-hidden="true" />
            This image has no repository or custom_raw configured, so README cannot be loaded.
          </p>
          <p v-else-if="readmeLoading || readmeRendering" class="im-state">
            <i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true" />
            Loading README.md from {{ branch }}…
          </p>
          <div v-else-if="readmeError" class="im-state im-state--error">
            <i class="fa-solid fa-triangle-exclamation" aria-hidden="true" />
            <span>{{ readmeError }}</span>
            <button type="button" class="im-retry" @click="reloadReadme">Retry</button>
            <a
              v-if="repo"
              class="im-retry"
              :href="repoBlobUrl(repo, branch, 'README.md')"
              target="_blank"
              rel="noreferrer"
            >
              Open in repository
            </a>
          </div>
          <article v-else class="im-markdown vp-doc" v-html="readmeHtml" />
        </template>

        <template v-else>
          <div v-if="recipePath !== 'recipe.yml'" class="im-recipe-bar">
            <button type="button" class="im-recipe-back" @click="recipePath = 'recipe.yml'">
              <i class="fa-solid fa-arrow-left" aria-hidden="true" />
              recipe.yml
            </button>
            <code class="im-recipe-path">{{ recipePath }}</code>
          </div>

          <p v-if="!recipeUrls.length" class="im-state im-state--error">
            <i class="fa-solid fa-circle-exclamation" aria-hidden="true" />
            This image has no repository or custom_raw configured, so recipe.yml cannot be loaded.
          </p>
          <p v-else-if="recipeLoading || recipeRendering" class="im-state">
            <i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true" />
            Loading {{ recipePath }} from {{ branch }}…
          </p>
          <div v-else-if="recipeError" class="im-state im-state--error">
            <i class="fa-solid fa-triangle-exclamation" aria-hidden="true" />
            <span>{{ recipeError }}</span>
            <button type="button" class="im-retry" @click="reloadRecipe">Retry</button>
            <a
              v-if="repo"
              class="im-retry"
              :href="repoBlobUrl(repo, branch, recipePath)"
              target="_blank"
              rel="noreferrer"
            >
              Open in repository
            </a>
          </div>
          <article
            v-else
            class="im-markdown im-recipe vp-doc"
            v-html="recipeHtml"
            @click="openRecipeLink"
            @keydown.enter="openRecipeLink"
          />
        </template>
      </section>
    </main>
  </div>
</template>

<style scoped>
.im-post {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 24px 96px;
}

.im-post-header {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-start;
  justify-content: space-between;
}

.im-post-series {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  margin-bottom: 14px;
  color: var(--vp-c-text-3);
  font-size: 12px;
  text-decoration: none;
}

.im-post-series:hover {
  color: var(--vp-c-brand-1);
}

.im-post-series i {
  font-size: 11px;
}

.im-post-heading {
  flex: 1 1 300px;
  min-width: 0;
}

.im-post-title-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.im-post-title {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.025em;
}

.im-post-ref {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin: 8px 0 0;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
}

.im-post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.im-post-tag {
  padding: 1px 8px;
  border-radius: 999px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-default-soft);
  font-size: 12px;
}

.im-post-header :deep(.im-cmd) {
  min-width: 0;
  max-width: 100%;
}

.im-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: flex-end;
  margin-top: 32px;
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 0 8px;
}

.im-tab {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  margin-bottom: -1px;
  padding: 9px 18px;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  color: var(--vp-c-text-2);
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}

.im-tab:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-soft);
}

.im-tab.is-active {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-alt);
  box-shadow: inset 0 2px 0 var(--vos-yellow-orange);
}

.im-tabs-repo {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  margin: 0 4px 9px auto;
  color: var(--vp-c-text-3);
  font-size: 12px;
  text-decoration: none;
}

.im-tabs-repo:hover {
  color: var(--vp-c-brand-1);
}

.im-panel {
  min-height: 320px;
  padding: 28px 32px 36px;
  border: 1px solid var(--vp-c-divider);
  border-top: none;
  border-radius: 0 0 12px 12px;
  background: var(--vp-c-bg-alt);
}

.im-state {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin: 0;
  padding: 12px 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.im-state--error {
  color: var(--vp-c-warning-1);
}

.im-retry {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border: 1px solid currentColor;
  border-radius: 6px;
  color: inherit;
  background: transparent;
  font-size: 12px;
  text-decoration: none;
  cursor: pointer;
}

.im-markdown {
  font-size: 15px;
  line-height: 1.75;
}

.im-markdown :deep(pre) {
  overflow-x: auto;
  padding: 14px 16px;
  border-radius: 10px;
  font-size: 13px;
}

.im-recipe :deep(pre) {
  margin: 0;
}

.im-recipe :deep(.im-yaml-link) {
  border-radius: 3px;
  color: var(--vp-c-brand-1);
  text-decoration: underline dashed;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  cursor: pointer;
}

.im-recipe :deep(.im-yaml-link:hover),
.im-recipe :deep(.im-yaml-link:focus-visible) {
  text-decoration-style: solid;
  background: var(--vp-c-brand-soft);
  outline: none;
}

.im-recipe-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--vp-c-divider);
  font-size: 12px;
}

.im-recipe-back {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  padding: 4px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 7px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.im-recipe-back:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.im-recipe-path {
  overflow: hidden;
  padding: 0;
  color: var(--vp-c-text-3);
  background: transparent;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .im-post {
    padding: 24px 16px 72px;
  }

  .im-post-title {
    font-size: 24px;
  }

  .im-panel {
    padding: 20px 16px 28px;
  }

  .im-post-header :deep(.im-cmd) {
    flex: 1 1 100%;
  }
}
</style>
