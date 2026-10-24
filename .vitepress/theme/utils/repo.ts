import type { ImageRef } from '../types'

export function normalizeRepo(repo: string): string {
  return repo.trim().replace(/\.git$/, '').replace(/\/+$/, '')
}

function isGithub(base: string): boolean {
  return /^https?:\/\/github\.com\//i.test(base)
}

function customRawUrl(template: string, branch: string, file: string): string {
  const url = template.trim()
  if (url.includes('{file}') || url.includes('{branch}')) {
    return url.replace(/\{branch\}/g, branch).replace(/\{file\}/g, file)
  }

  return `${url.replace(/\/+$/, '')}/${branch}/${file}`
}

export function rawFileUrls(
  repo: string,
  branch: string,
  file: string,
  customRaw = ''
): string[] {
  const urls: string[] = []
  if (customRaw.trim()) urls.push(customRawUrl(customRaw, branch, file))

  const base = normalizeRepo(repo)
  if (!base) return urls

  if (isGithub(base)) {
    const [, owner, name] = base.match(/github\.com\/([^/]+)\/([^/]+)/i) ?? []
    if (owner && name) {
      urls.push(
        `${base.replace('github.com', 'raw.githubusercontent.com')}/${branch}/${file}`,
        `https://cdn.jsdelivr.net/gh/${owner}/${name}@${branch}/${file}`,
        `${base}/raw/${branch}/${file}`
      )
      return urls
    }
  }

  urls.push(`${base}/raw/branch/${branch}/${file}`)
  return urls
}

export function repoBlobUrl(repo: string, branch: string, path: string): string {
  const base = normalizeRepo(repo)
  if (!base) return path
  if (isGithub(base)) return `${base}/blob/${branch}/${path}`
  return `${base}/src/branch/${branch}/${path}`
}

export function imageRef(image: string, tag: string): string {
  return `${image}:${tag}`
}

export function resolveRepoPath(base: string, target: string): string {
  const segments = target.startsWith('/') ? [] : base.split('/').slice(0, -1)

  for (const part of target.replace(/^\/+/, '').split('/')) {
    if (!part || part === '.') continue
    if (part === '..') segments.pop()
    else segments.push(part)
  }

  return segments.join('/')
}

function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean)
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return []
}

export function expandRefs(image: unknown, tag: unknown): ImageRef[] {
  const images = toList(image)
  const tags = toList(tag)

  if (!images.length) return []
  if (!tags.length) return images.map((item) => ({ image: item, tag: 'latest' }))
  if (images.length === 1) return tags.map((item) => ({ image: images[0], tag: item }))

  return images.map((item, index) => ({
    image: item,
    tag: tags[index] ?? tags[tags.length - 1]
  }))
}
