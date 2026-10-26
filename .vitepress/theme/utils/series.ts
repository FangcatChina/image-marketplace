import type { SeriesGroup, SeriesOption } from '../types'

export function parentUrl(url: string): string {
  const trimmed = url.replace(/\/+$/, '')
  const index = trimmed.lastIndexOf('/')
  return index <= 0 ? '/' : trimmed.slice(0, index + 1)
}

export function memberUrl(seriesUrl: string, target: string): string {
  const clean = target.trim().replace(/^\.\//, '').replace(/\.md$/i, '')
  if (!clean) return seriesUrl

  const path = clean.replace(/^\/+/, '')
  if (path === 'index' || path.endsWith('/index')) {
    return `${seriesUrl}${path.slice(0, -'index'.length)}`
  }
  return `${seriesUrl}${path}`
}

function toEntries(value: unknown): [string, unknown][] {
  if (Array.isArray(value)) return value.flatMap(toEntries)
  if (value && typeof value === 'object') return Object.entries(value as Record<string, unknown>)
  return []
}

function collectOptions(value: unknown, path: string[], out: SeriesOption[]): void {
  if (typeof value === 'string') {
    const target = value.trim()
    if (target) out.push({ label: path.join(' · ') || target, target })
    return
  }

  for (const [label, child] of toEntries(value)) {
    collectOptions(child, label ? [...path, label] : path, out)
  }
}

export function parseOptions(raw: unknown): SeriesGroup[] {
  return toEntries(raw)
    .map(([label, value]) => {
      const options: SeriesOption[] = []
      collectOptions(value, [], options)
      return { label, options }
    })
    .filter((group) => group.options.length > 0)
}
