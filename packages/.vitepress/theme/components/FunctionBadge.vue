<script setup lang="ts">
import type { FunctionInfo } from '../../../../packages/metadata/src/functions'
import { computed } from 'vue'

const props = defineProps<{ fn: FunctionInfo }>()

function styledName(name: string) {
  if (name.startsWith('use'))
    return `<span opacity="70">use</span>${name.slice(3)}`
  if (name.startsWith('try'))
    return `<span opacity="70">try</span>${name.slice(3)}`
  if (name.startsWith('on'))
    return `<span opacity="70">on</span>${name.slice(2)}`
  return name
}

// A docs page is the co-located directory `packages/<pkg>/<dir>/index.md`.
// Several hooks export multiple names from one page (e.g. `useBreakpoints`
// also exports `breakpointsTailwind`, ...), so link by directory — never by
// the exported symbol name, which may not have its own page.
const link = computed(() => {
  const dir = props.fn.file.replace(/^packages\/\w+\/([^/]+)\/index\.tsx$/, '$1')
  return `/${props.fn.pkg}/${dir}/`
})
</script>

<template>
  <div text="sm" flex="~ gap1" items-center>
    <a :href="link" my-auto>
      <code v-html="styledName(fn.name)" />
    </a>
    <span op50>-</span>
    <span class="whitespace-wrap" opacity="50">{{ fn.category }}</span>
  </div>
</template>
