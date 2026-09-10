<script setup lang="ts">
import Fuse from 'fuse.js'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { categoryNames, functions } from '../../../../packages/metadata/src/functions'
import FunctionBadge from './FunctionBadge.vue'

const coreCategories = categoryNames.filter(i => !i.startsWith('@'))
const addonCategories = categoryNames.filter(i => i.startsWith('@'))
const sortMethods = ['category', 'name', 'updated']

// URL hash params (`#category=State&sort=updated`) driving category filter,
// search and sort — mirrors VueUse's FunctionsList, which uses
// `useUrlSearchParams('hash-params')` from @vueuse/core. Implemented natively
// here so the docs theme doesn't depend on @vueuse/core.
const hash = reactive({ search: '', category: '', sort: '' })

function readHash() {
  const params = new URLSearchParams((window.location.hash || '').replace(/^#/, ''))
  hash.search = params.get('search') || ''
  hash.category = params.get('category') || ''
  hash.sort = params.get('sort') || ''
}

function writeHash() {
  const params = new URLSearchParams()
  if (hash.search)
    params.set('search', hash.search)
  if (hash.category)
    params.set('category', hash.category)
  if (hash.sort)
    params.set('sort', hash.sort)
  const query = params.toString()
  const url = window.location.pathname + window.location.search + (query ? `#${query}` : '')
  // replaceState keeps the filters shareable (copy/paste URL) without
  // polluting browser history — same as @vueuse/core's writeMode: 'replace'.
  window.history.replaceState(window.history.state, document.title, url)
}

const mounted = ref(false)
let stopWatch: (() => void) | undefined

onMounted(() => {
  mounted.value = true
  readHash()
  // VitePress's router navigates with pushState, which never fires the native
  // `hashchange` — mirror VueUse's global click listener that re-dispatches it
  // so category/sort/search links update this component in place.
  const onClick = (e: Event) => {
    if ((e.target as HTMLElement | null)?.tagName === 'A')
      window.dispatchEvent(new Event('hashchange'))
  }
  const onPopState = () => readHash()
  window.addEventListener('hashchange', readHash)
  window.addEventListener('popstate', onPopState)
  document.addEventListener('click', onClick, { passive: true })
  stopWatch = watch(hash, writeHash, { deep: true })
  onBeforeUnmount(() => {
    window.removeEventListener('hashchange', readHash)
    window.removeEventListener('popstate', onPopState)
    document.removeEventListener('click', onClick)
    stopWatch?.()
  })
})

const search = computed<string>({
  get: () => mounted.value ? hash.search : '',
  set: val => hash.search = val,
})
const category = computed<string>({
  get: () => mounted.value ? hash.category : '',
  set: val => hash.category = val,
})
const sortMethod = computed<string>({
  get: () => mounted.value ? hash.sort : '',
  set: val => hash.sort = val,
})

const showCategory = computed(() => !search.value && (!sortMethod.value || sortMethod.value === 'category'))

const items = computed(() => {
  let fn = [...functions]
  if (category.value)
    fn = fn.filter(item => item.category === category.value)
  return fn
})

const fuse = computed(() => new Fuse(items.value, { keys: ['name'] }))

const result = computed(() => {
  if (search.value)
    return fuse.value.search(search.value).map(i => i.item)
  const fns = [...items.value]
  if (sortMethod.value === 'updated')
    fns.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0))
  else if (sortMethod.value === 'name')
    fns.sort((a, b) => a.name.localeCompare(b.name))
  else
    fns.sort((a, b) => categoryNames.indexOf(a.category || '') - categoryNames.indexOf(b.category || ''))
  return fns
})

const hasFilters = computed(() => Boolean(search.value || category.value || sortMethod.value))

function resetFilters() {
  sortMethod.value = ''
  category.value = ''
  search.value = ''
}

function toggleCategory(cate: string) {
  category.value = category.value === cate ? '' : cate
}

function toggleSort(method: string) {
  sortMethod.value = method
}
</script>

<template>
  <div class="grid grid-cols-[80px_auto] gap-y-2 mt-10">
    <div opacity="80" text="sm">
      Core
    </div>
    <div flex="~ wrap" gap="2" m="b-2">
      <button
        v-for="cate of coreCategories"
        :key="cate"
        class="select-button"
        :class="{ active: category === cate }"
        @click="toggleCategory(cate)"
      >
        {{ cate }}
      </button>
    </div>
    <div opacity="80" text="sm">
      Add-ons
    </div>
    <div flex="~ wrap" gap="2" m="b-2">
      <button
        v-for="cate of addonCategories"
        :key="cate"
        class="select-button"
        :class="{ active: category === cate }"
        @click="toggleCategory(cate)"
      >
        {{ cate.slice(1) }}
      </button>
    </div>
    <div opacity="80" text="sm">
      Sort by
    </div>
    <div flex="~ wrap" gap="2" m="b-2">
      <button v-if="search" class="select-button active">
        Search
      </button>
      <button
        v-for="method of sortMethods"
        :key="method"
        class="select-button capitalize"
        :class="{
          active: method === (sortMethod || 'category'),
          disabled: search,
        }"
        @click="toggleSort(method)"
      >
        {{ method }}
      </button>
    </div>
  </div>
  <div h="1px" bg="$vp-c-divider" m="t-4" />
  <div flex="~" class="children:my-auto" p="2">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="16"
      height="16"
      class="m-r-2 opacity-50 shrink-0"
    >
      <path fill="currentColor" d="m29 27.586-7.552-7.552a11.018 11.018 0 1 0-1.414 1.414L27.586 29ZM4 13a9 9 0 1 1 9 9 9.01 9.01 0 0 1-9-9Z" />
    </svg>
    <input v-model="search" class="w-full" type="text" role="search" placeholder="Search...">
  </div>
  <div h="1px" bg="$vp-c-divider" m="b-4" />
  <div flex="~ col gap-3" class="relative" p="t-5">
    <div v-if="hasFilters" class="transition mb-2 opacity-60 absolute -top-3 right-0 z-10">
      <button class="select-button flex gap-1 items-center !px-2 !py-1" @click="resetFilters()">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="14"
          height="14"
        >
          <path fill="currentColor" d="M30 19.414 28.586 18 24 22.586 19.414 18 18 19.414 22.586 24 18 28.586 19.414 30 24 25.414 28.586 30 30 28.586 25.414 24 30 19.414Z" />
          <path fill="currentColor" d="M24 4h-2.211l-5.285-8a1 1 0 0 0-1.6 0L9.618 4H2a1 1 0 0 0-.77.36 1 1 0 0 0-.19.83l5.87 17.531A1 1 0 0 0 7.822 24h6.178v-2H8.12L2.862 6h21.276l3.42 5.419 1.586-1.22L24.34 4Z" />
        </svg>
        Clear Filters
      </button>
    </div>
    <template v-for="(fn, idx) of result" :key="`${fn.pkg}/${fn.name}`">
      <h3
        v-if="showCategory && fn.category !== result[idx - 1]?.category"
        opacity="60"
        class="!text-16px !tracking-wide !m-0"
        p="y-2"
      >
        {{ fn.category }}
      </h3>
      <FunctionBadge :fn="fn" />
    </template>
    <div v-if="!result.length" text-center pt-6>
      <div m2 op50>
        No result matched
      </div>
      <button class="select-button flex-inline gap-1 items-center !px-2 !py-1" @click="resetFilters()">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="14"
          height="14"
        >
          <path fill="currentColor" d="M30 19.414 28.586 18 24 22.586 19.414 18 18 19.414 22.586 24 18 28.586 19.414 30 24 25.414 28.586 30 30 28.586 25.414 24 30 19.414Z" />
          <path fill="currentColor" d="M24 4h-2.211l-5.285-8a1 1 0 0 0-1.6 0L9.618 4H2a1 1 0 0 0-.77.36 1 1 0 0 0-.19.83l5.87 17.531A1 1 0 0 0 7.822 24h6.178v-2H8.12L2.862 6h21.276l3.42 5.419 1.586-1.22L24.34 4Z" />
        </svg>
        Clear Filters
      </button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
input {
  --un-ring-offset-width: 1px !important;
  --un-ring-color: #8885 !important;
  --un-ring-offset-color: transparent !important;
}

.select-button {
  @apply rounded text-sm px-2 py-0.5 bg-gray-400/5 hover:bg-gray-400/10;
}
.select-button.active:not(.disabled) {
  @apply text-primary bg-primary/5;
}
.select-button.disabled {
  @apply opacity-50 pointer-events-none;
}
</style>
