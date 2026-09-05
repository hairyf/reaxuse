<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createElement, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { demos } from '../../../demos/index'

const props = defineProps<{ name: string }>()

const el = ref<HTMLElement | null>(null)
let root: Root | undefined

onMounted(() => {
  const Comp = demos[props.name as keyof typeof demos]
  if (!Comp || !el.value)
    return
  root = createRoot(el.value)
  root.render(
    createElement(
      Suspense,
      { fallback: createElement('div', null, 'Loading demo…') },
      createElement(Comp),
    ),
  )
})

onBeforeUnmount(() => {
  root?.unmount()
})
</script>

<template>
  <div ref="el" class="react-demo" />
</template>
