<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  prefix: string
  value: string
  options?: string[]
}>()

const emit = defineEmits<{ 'update:value': [value: string] }>()

const root = ref<HTMLElement>()
const open = ref(false)
const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

const command = computed(() => `${props.prefix}${props.value}`)
const selectable = computed(() => (props.options?.length ?? 0) > 1)
const widest = computed(() =>
  (props.options ?? []).reduce((longest, option) => (option.length > longest.length ? option : longest), '')
)

async function copy() {
  try {
    await navigator.clipboard.writeText(command.value)
  } catch {
    const field = document.createElement('textarea')
    field.value = command.value
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.appendChild(field)
    field.select()
    document.execCommand('copy')
    field.remove()
  }

  copied.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (copied.value = false), 1600)
}

function pick(option: string) {
  emit('update:value', option)
  open.value = false
}

function onPointerDown(event: MouseEvent) {
  if (!root.value?.contains(event.target as Node)) open.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', onPointerDown)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
  clearTimeout(timer)
})
</script>

<template>
  <div ref="root" class="im-cmd">
    <span class="im-cmd-prompt" aria-hidden="true">$</span>
    <code class="im-cmd-prefix">{{ prefix }}</code>

    <div v-if="selectable" class="im-cmd-picker">
      <span class="im-cmd-sizer" aria-hidden="true">{{ widest }}</span>
      <button
        type="button"
        class="im-cmd-trigger"
        :aria-expanded="open"
        aria-haspopup="listbox"
        @click="open = !open"
      >
        <code>{{ value }}</code>
        <i class="fa-solid fa-chevron-down" :class="{ 'is-open': open }" aria-hidden="true" />
      </button>

      <ul v-if="open" class="im-cmd-menu" role="listbox">
        <li v-for="option in options" :key="option" role="presentation">
          <button
            type="button"
            role="option"
            class="im-cmd-option"
            :class="{ 'is-selected': option === value }"
            :aria-selected="option === value"
            @click="pick(option)"
          >
            <code>{{ option }}</code>
            <i v-if="option === value" class="fa-solid fa-check" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </div>

    <code v-else class="im-cmd-value">{{ value }}</code>

    <button
      type="button"
      class="im-cmd-copy"
      :aria-label="copied ? 'Copied' : 'Copy command'"
      @click="copy"
    >
      <i :class="copied ? 'fa-solid fa-check' : 'fa-regular fa-copy'" aria-hidden="true" />
      <span>{{ copied ? 'Copied' : 'Copy' }}</span>
    </button>
  </div>
</template>

<style scoped>
.im-cmd {
  display: flex;
  gap: 8px;
  align-items: center;
  max-width: 100%;
  padding: 6px 6px 6px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-default-soft);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
}

.im-cmd-prompt {
  color: var(--vos-yellow-orange);
  user-select: none;
}

.im-cmd-prefix {
  flex-shrink: 0;
  padding: 0;
  color: var(--vp-c-text-2);
  background: transparent;
  font-size: 13px;
  white-space: nowrap;
}

.im-cmd-value {
  overflow-x: auto;
  flex: 1;
  padding: 0;
  color: var(--vp-c-text-1);
  background: transparent;
  font-size: 13px;
  white-space: nowrap;
}

.im-cmd-picker {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, max-content);
  flex: 0 1 auto;
  min-width: 0;
  max-width: 100%;
}

.im-cmd-sizer,
.im-cmd-trigger {
  grid-area: 1 / 1;
}

.im-cmd-sizer {
  padding: 3px 8px;
  border: 1px solid transparent;
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  white-space: pre;
  visibility: hidden;
}

.im-cmd-trigger {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  padding: 3px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 7px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  cursor: pointer;
  transition: border-color 0.2s;
}

.im-cmd-trigger:hover {
  border-color: var(--vp-c-brand-1);
}

.im-cmd-trigger code {
  overflow: hidden;
  padding: 0;
  background: transparent;
  font-size: 12.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.im-cmd-trigger i {
  flex-shrink: 0;
  color: var(--vp-c-text-3);
  font-size: 9px;
  transition: transform 0.2s;
}

.im-cmd-trigger i.is-open {
  transform: rotate(180deg);
}

.im-cmd-menu {
  position: absolute;
  z-index: 30;
  top: calc(100% + 6px);
  left: 0;
  min-width: 100%;
  width: max-content;
  max-width: min(380px, 80vw);
  max-height: 240px;
  margin: 0;
  padding: 4px;
  overflow-y: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  box-shadow: 0 12px 28px var(--im-shadow);
  list-style: none;
}

.im-cmd-option {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 6px 8px;
  border: 0;
  border-radius: 6px;
  color: var(--vp-c-text-2);
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.im-cmd-option:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-soft);
}

.im-cmd-option.is-selected {
  color: var(--vp-c-brand-1);
}

.im-cmd-option code {
  padding: 0;
  background: transparent;
  font-size: 12px;
  white-space: nowrap;
}

.im-cmd-option i {
  flex-shrink: 0;
  font-size: 10px;
}

.im-cmd-copy {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  font-family: var(--vp-font-family-base);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.im-cmd-copy:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

@media (max-width: 560px) {
  .im-cmd-copy span {
    display: none;
  }
}
</style>
