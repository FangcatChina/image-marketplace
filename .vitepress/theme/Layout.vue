<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ImagePost from './components/ImagePost.vue'
import MarketplaceHome from './components/MarketplaceHome.vue'

const { frontmatter } = useData()

const DefaultLayout = DefaultTheme.Layout
const isImagePost = computed(() => {
  const image = frontmatter.value.image
  return typeof image === 'string' || (Array.isArray(image) && image.length > 0)
})
</script>

<template>
  <MarketplaceHome v-if="frontmatter.layout === 'marketplace'" />
  <ImagePost v-else-if="isImagePost" />
  <DefaultLayout v-else />
</template>
