import type Token from 'markdown-it/lib/token.mjs'
import { highlightCode } from './highlight'
import { rawFileUrls, repoBlobUrl, resolveRepoPath } from './repo'

export interface MarkdownContext {
  repo: string
  branch: string
  dark: boolean
}

interface MarkdownRenderer {
  options: unknown
  use(plugin: unknown, options?: unknown): MarkdownRenderer
  renderer: { render(tokens: Token[], options: unknown, env: unknown): string }
  parse(src: string, env: Record<string, unknown>): Token[]
}

let rendererPromise: Promise<MarkdownRenderer> | null = null

async function getRenderer(): Promise<MarkdownRenderer> {
  rendererPromise ??= (async () => {
    const [{ default: MarkdownIt }, { default: githubAlerts }] = await Promise.all([
      import('markdown-it'),
      import('markdown-it-github-alerts')
    ])

    const md = new MarkdownIt({ html: true, linkify: true }) as unknown as MarkdownRenderer
    md.use(githubAlerts, { matchCaseSensitive: false })
    return md
  })()

  return rendererPromise
}

function isExternal(url: string): boolean {
  return /^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url)
}

function relativePath(url: string): string {
  return url.replace(/^\.?\//, '')
}

function fenceLanguage(token: Token): string {
  return token.info.trim().split(/\s+/)[0] ?? ''
}

async function highlightFences(tokens: Token[], dark: boolean): Promise<void> {
  for (const token of tokens) {
    if (token.type !== 'fence') continue

    const html = await highlightCode(token.content, fenceLanguage(token), dark)
    if (!html) continue

    token.type = 'html_block'
    token.tag = ''
    token.block = true
    token.content = html
    token.children = null
  }
}

function rewriteLinks(tokens: Token[], ctx: MarkdownContext): void {
  for (const token of tokens) {
    if (token.type === 'image') {
      const src = token.attrGet('src') ?? ''
      if (!isExternal(src)) {
        const resolved = rawFileUrls(ctx.repo, ctx.branch, relativePath(src))[0]
        if (resolved) token.attrSet('src', resolved)
      }
    }

    if (token.type === 'link_open') {
      const href = token.attrGet('href') ?? ''
      if (!isExternal(href) && !href.startsWith('mailto:')) {
        token.attrSet('href', repoBlobUrl(ctx.repo, ctx.branch, relativePath(href)))
        token.attrSet('target', '_blank')
        token.attrSet('rel', 'noreferrer')
      }
    }

    if (token.children) rewriteLinks(token.children, ctx)
  }
}

export async function renderMarkdown(source: string, ctx: MarkdownContext): Promise<string> {
  const md = await getRenderer()
  const env: Record<string, unknown> = {}
  const tokens = md.parse(source, env)

  await highlightFences(tokens, ctx.dark)
  rewriteLinks(tokens, ctx)

  return md.renderer.render(tokens, md.options, env)
}

export interface RecipeContext {
  dark: boolean
  path: string
}

const yamlFilePattern = /(?:[\w.@~+-]+\/)*[\w.@~+-]+\.ya?ml/g

function linkifyYamlPaths(html: string, base: string): string {
  return html
    .split(/(<[^>]+>)/)
    .map((part) => {
      if (part.startsWith('<')) return part
      return part.replace(
        yamlFilePattern,
        (path) =>
          `<a class="im-yaml-link" role="link" tabindex="0" data-path="${resolveRepoPath(base, path)}">${path}</a>`
      )
    })
    .join('')
}

export async function renderRecipe(source: string, ctx: RecipeContext): Promise<string> {
  const html =
    (await highlightCode(source, 'yaml', ctx.dark)) ??
    `<pre><code>${escapeHtml(source)}</code></pre>`

  return linkifyYamlPaths(html, ctx.path)
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>]/g, (char) => `&#${char.charCodeAt(0)};`)
}
