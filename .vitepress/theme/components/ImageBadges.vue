<script setup lang="ts">
import type { Maintainer, Status } from '../types'

defineProps<{
  maintainer: Maintainer
  status: Status
  collection?: boolean
  series?: boolean
  count?: number
}>()

const maintainerMeta = {
  official: { icon: 'fa-solid fa-shield-halved', label: 'official' },
  community: { icon: 'fa-solid fa-user-group', label: 'community' }
} as const

const statusMeta = {
  normal: { icon: 'fa-solid fa-circle-check', label: 'normal' },
  outdated: { icon: 'fa-solid fa-triangle-exclamation', label: 'outdated' },
  wip: { icon: 'fa-solid fa-screwdriver-wrench', label: 'wip' }
} as const
</script>

<template>
  <span class="im-badges">
    <span class="im-badge" :class="`im-badge--${maintainer}`">
      <i :class="maintainerMeta[maintainer].icon" aria-hidden="true" />
      {{ maintainerMeta[maintainer].label }}
    </span>
    <span v-if="status !== 'normal'" class="im-badge" :class="`im-badge--${status}`">
      <i :class="statusMeta[status].icon" aria-hidden="true" />
      {{ statusMeta[status].label }}
    </span>
    <span v-if="series" class="im-badge im-badge--series">
      <i class="fa-solid fa-boxes-stacked" aria-hidden="true" />
      Series
      <span v-if="count" class="im-badge-count">{{ count }}</span>
    </span>
    <span v-if="collection" class="im-badge im-badge--collection">
      <i class="fa-solid fa-layer-group" aria-hidden="true" />
      Collection
      <span v-if="count" class="im-badge-count">{{ count }}</span>
    </span>
  </span>
</template>

<style scoped>
.im-badges {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.im-badge {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  padding: 2px 9px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.6;
  letter-spacing: 0.02em;
  text-transform: capitalize;
  white-space: nowrap;
}

.im-badge i {
  font-size: 10px;
}

.im-badge-count {
  padding: 0 5px;
  border-radius: 999px;
  background: var(--vp-c-bg);
  font-size: 10px;
  line-height: 1.5;
}

.im-badge--collection {
  border-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  text-transform: none;
}

.im-badge--series {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
  text-transform: none;
}

.im-badge--official {
  border-color: color-mix(in srgb, var(--vos-yellow-orange) 45%, transparent);
  color: var(--im-on-brand);
  background: var(--vos-yellow-orange);
}

.im-badge--community {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-2);
  background: var(--vos-westar);
}

.dark .im-badge--community {
  color: var(--vp-c-text-2);
  background: rgba(255, 255, 255, 0.07);
}

.im-badge--outdated {
  border-color: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
  background: var(--vp-c-danger-soft);
}

.im-badge--wip {
  border-color: color-mix(in srgb, var(--vos-laser-lemon) 60%, var(--vp-c-divider));
  color: #5a5600;
  background: var(--vos-laser-lemon);
}

.dark .im-badge--wip {
  color: var(--vos-laser-lemon);
  background: rgba(255, 251, 100, 0.12);
}
</style>
