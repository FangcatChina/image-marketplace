export type Maintainer = 'official' | 'community'
export type Status = 'normal' | 'outdated' | 'wip'
export type ViewMode = 'grid' | 'sheet'
export type PostTab = 'readme' | 'recipe'

export interface ImageRef {
  image: string
  tag: string
}

export interface ImageEntry {
  url: string
  name: string
  refs: ImageRef[]
  repo: string
  branch: string
  maintainer: Maintainer
  status: Status
  tags: string[]
  collection: boolean
}
