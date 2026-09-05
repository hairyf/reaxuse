<script setup lang="ts">
import type { Root } from 'react-dom/client'
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{ name: string }>()

// Co-located demos mirror VueUse's packages/<pkg>/<fn>/demo.vue:
// each function's demo lives next to its docs page (packages/<pkg>/<fn>/demo.tsx).
const demos = import.meta.glob('../../{core,shared,math,integrations}/*/demo.tsx')

const el = ref<HTMLElement | null>(null)
let root: Root | undefined

onMounted(async () => {
  const key = Object.keys(demos).find(k => k.toLowerCase().includes(`/${props.name.toLowerCase()}/demo.tsx`))
  if (!key || !el.value)
    return
  const mod = await demos[key]()
  const Demo = (mod as { default?: React.ComponentType }).default
  if (!Demo)
    return
  root = createRoot(el.value)
  root.render(createElement(Demo))
})

onBeforeUnmount(() => {
  root?.unmount()
})
</script>

<template>
  <div ref="el" class="react-demo" />
</template>
