import { createContentLoader, type ContentData } from 'vitepress'
import type { ImageEntry, Maintainer, Status } from '../theme/types'
import { expandRefs } from '../theme/utils/repo'

declare const data: ImageEntry[]
export { data }

export default createContentLoader('**/*.md', {
  transform(raw: ContentData[]): ImageEntry[] {
    return raw
      .map(({ url, frontmatter }) => ({
        url,
        name: (frontmatter.name as string) ?? url,
        refs: expandRefs(frontmatter.image, frontmatter.tag),
        repo: (frontmatter.repo as string) ?? '',
        branch: (frontmatter.branch as string) ?? 'main',
        maintainer: ((frontmatter.maintainer as Maintainer) ?? 'community'),
        status: ((frontmatter.status as Status) ?? 'normal'),
        tags: (frontmatter.tags as string[]) ?? [],
        collection: Boolean(frontmatter.collection)
      }))
      .filter((entry) => entry.refs.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name))
  }
})
