import { createContentLoader, type ContentData } from 'vitepress'
import type {
  ImageEntry,
  Maintainer,
  MarketplaceData,
  SeriesEntry,
  Status
} from '../theme/types'
import { expandRefs } from '../theme/utils/repo'
import { parentUrl, parseOptions } from '../theme/utils/series'

declare const data: MarketplaceData
export { data }

function toImage(url: string, frontmatter: ContentData['frontmatter']): ImageEntry | undefined {
  const refs = expandRefs(frontmatter.image, frontmatter.tag)
  if (!refs.length) return undefined

  return {
    url,
    name: (frontmatter.name as string) ?? url,
    refs,
    repo: (frontmatter.repo as string) ?? '',
    branch: (frontmatter.branch as string) ?? 'main',
    maintainer: (frontmatter.maintainer as Maintainer) ?? 'community',
    status: (frontmatter.status as Status) ?? 'normal',
    tags: (frontmatter.tags as string[]) ?? [],
    collection: Boolean(frontmatter.collection)
  }
}

export default createContentLoader('**/*.md', {
  transform(raw: ContentData[]): MarketplaceData {
    const series: SeriesEntry[] = []
    const images: ImageEntry[] = []

    for (const { url, frontmatter } of raw) {
      if (url.endsWith('/')) {
        if (url === '/') continue

        series.push({
          url,
          name: (frontmatter.name as string) ?? 'Untitled series',
          maintainer: (frontmatter.maintainer as Maintainer) ?? 'community',
          status: (frontmatter.status as Status) ?? 'normal',
          tags: (frontmatter.tags as string[]) ?? [],
          groups: parseOptions(frontmatter.options),
          images: []
        })
        continue
      }

      const image = toImage(url, frontmatter)
      if (image) images.push(image)
    }

    const byUrl = new Map(series.map((entry) => [entry.url, entry]))
    const standalone: ImageEntry[] = []

    for (const image of images) {
      const entry = byUrl.get(parentUrl(image.url))
      if (entry) entry.images.push(image)
      else standalone.push(image)
    }

    for (const entry of series) {
      entry.tags = [...new Set([...entry.tags, ...entry.images.flatMap((image) => image.tags)])]
      entry.images.sort((a, b) => a.name.localeCompare(b.name))
    }

    return {
      series: series.sort((a, b) => a.name.localeCompare(b.name)),
      images: standalone.sort((a, b) => a.name.localeCompare(b.name))
    }
  }
})
