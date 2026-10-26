<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ImagePost from './components/ImagePost.vue'
import MarketplaceHome from './components/MarketplaceHome.vue'
import SeriesIndex from './components/SeriesIndex.vue'

const { frontmatter, page } = useData()

const DefaultLayout = DefaultTheme.Layout
const isImagePost = computed(() => {
  const image = frontmatter.value.image
  return typeof image === 'string' || (Array.isArray(image) && image.length > 0)
})
const isSeriesIndex = computed(
  () => page.value.relativePath !== 'index.md' && /(^|\/)index\.md$/.test(page.value.relativePath)
)
</script>

<template>
  <MarketplaceHome v-if="frontmatter.layout === 'marketplace'" />
  <SeriesIndex v-else-if="isSeriesIndex" />
  <ImagePost v-else-if="isImagePost" />
  <DefaultLayout v-else />
</template>
