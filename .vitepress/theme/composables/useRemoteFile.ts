import { onMounted, ref, watch, type Ref } from 'vue'

const cache = new Map<string, string>()

export function useRemoteFile(urls: Ref<string[]>, enabled: () => boolean = () => true) {
  const content = ref('')
  const error = ref('')
  const loading = ref(false)
  let ticket = 0

  async function fetchFirst(sources: string[]) {
    for (const url of sources) {
      try {
        const response = await fetch(url)
        if (response.ok) return { text: await response.text(), url }
      } catch {
        continue
      }
    }
    return null
  }

  async function load() {
    const sources = urls.value
    if (!sources.length || !enabled()) return

    const cached = sources
      .map((url) => cache.get(url))
      .find((value) => value !== undefined)
    if (cached !== undefined) {
      content.value = cached
      error.value = ''
      return
    }

    const current = ++ticket
    loading.value = true
    error.value = ''

    const result = await fetchFirst(sources)

    if (current !== ticket) return

    if (result) {
      cache.set(result.url, result.text)
      content.value = result.text
    } else {
      content.value = ''
      error.value = 'Could not load the file. Check the repository, branch and network connection.'
    }

    loading.value = false
  }

  onMounted(load)
  watch(urls, load)
  watch(enabled, (on) => {
    if (on) load()
  })

  return { content, error, loading, reload: load }
}
