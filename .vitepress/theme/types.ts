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

export interface SeriesOption {
  label: string
  target: string
}

export interface SeriesGroup {
  label: string
  options: SeriesOption[]
}

export interface SeriesEntry {
  url: string
  name: string
  maintainer: Maintainer
  status: Status
  tags: string[]
  groups: SeriesGroup[]
  images: ImageEntry[]
}

export interface MarketplaceData {
  series: SeriesEntry[]
  images: ImageEntry[]
}
