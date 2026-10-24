import type { HighlighterCore } from 'shiki/core'

let highlighterPromise: Promise<HighlighterCore> | null = null

function getHighlighter(): Promise<HighlighterCore> {
  highlighterPromise ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
      import('shiki/core'),
      import('shiki/engine/javascript')
    ])

    return createHighlighterCore({
      themes: [
        import('@shikijs/themes/vitesse-dark'),
        import('@shikijs/themes/vitesse-light')
      ],
      langs: [
        import('@shikijs/langs/bash'),
        import('@shikijs/langs/yaml')
      ],
      engine: createJavaScriptRegexEngine()
    })
  })()

  return highlighterPromise
}

export async function highlightCode(
  code: string,
  lang: string,
  dark: boolean
): Promise<string | null> {
  const highlighter = await getHighlighter()

  try {
    return highlighter.codeToHtml(code, {
      lang,
      theme: dark ? 'vitesse-dark' : 'vitesse-light'
    })
  } catch {
    return null
  }
}
