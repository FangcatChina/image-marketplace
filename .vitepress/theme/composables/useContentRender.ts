import { ref, watch, type Ref } from 'vue'
import { renderMarkdown, renderRecipe, type RecipeContext } from '../utils/markdown'

export function useMarkdownHtml(
  source: Ref<string>,
  getContext: () => { repo: string; branch: string; dark: boolean }
) {
  const html = ref('')
  const rendering = ref(false)
  let ticket = 0

  watch([source, () => getContext().dark], async ([text]) => {
    const current = ++ticket
    if (!text) {
      html.value = ''
      return
    }

    rendering.value = true
    try {
      const output = await renderMarkdown(text, getContext())
      if (current === ticket) html.value = output
    } catch {
      if (current === ticket) html.value = ''
    } finally {
      if (current === ticket) rendering.value = false
    }
  })

  return { html, rendering }
}

export function useRecipeHtml(
  source: Ref<string>,
  getContext: () => RecipeContext
) {
  const html = ref('')
  const rendering = ref(false)
  let ticket = 0

  watch([source, () => getContext().dark, () => getContext().path], async ([text]) => {
    const current = ++ticket
    if (!text) {
      html.value = ''
      return
    }

    rendering.value = true
    try {
      const output = await renderRecipe(text, getContext())
      if (current === ticket) html.value = output
    } catch {
      if (current === ticket) html.value = ''
    } finally {
      if (current === ticket) rendering.value = false
    }
  })

  return { html, rendering }
}
