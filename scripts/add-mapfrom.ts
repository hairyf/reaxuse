/**
 * add-mapfrom.ts — insert a "Map from <source> `UpstreamName`" line as the
 * first line of the second JSDoc paragraph of each early hook that lacks one.
 * Targets the JSDoc block whose closing marker immediately precedes the
 * implementation* (`export function useX ... {`), then inserts after the
 * opening paragraph. Usage: npx tsx scripts/add-mapfrom.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'

// reaxuse hook -> [mapping source, upstream name]
const MAP: Record<string, [string, string]> = {
  'core/useNow': ['@vueuse/core', 'useNow'],
  'core/useSwipe': ['@vueuse/core', 'useSwipe'],
  'shared/useArrayDifference': ['@vueuse/shared', 'useArrayDifference'],
  'shared/useArrayEvery': ['@vueuse/shared', 'useArrayEvery'],
  'shared/useArrayFilter': ['@vueuse/shared', 'useArrayFilter'],
  'shared/useArrayFind': ['@vueuse/shared', 'useArrayFind'],
  'shared/useArrayFindIndex': ['@vueuse/shared', 'useArrayFindIndex'],
  'shared/useArrayFindLast': ['@vueuse/shared', 'useArrayFindLast'],
  'shared/useArrayIncludes': ['@vueuse/shared', 'useArrayIncludes'],
  'shared/useArrayJoin': ['@vueuse/shared', 'useArrayJoin'],
  'shared/useArrayMap': ['@vueuse/shared', 'useArrayMap'],
  'shared/useArrayReduce': ['@vueuse/shared', 'useArrayReduce'],
  'shared/useArraySome': ['@vueuse/shared', 'useArraySome'],
  'shared/useArrayUnique': ['@vueuse/shared', 'useArrayUnique'],
  'shared/useCounter': ['@vueuse/shared', 'useCounter'],
  'shared/useDebounceFn': ['@vueuse/shared', 'useDebounceFn'],
  'shared/useInterval': ['@vueuse/shared', 'useInterval'],
  'shared/useIntervalFn': ['@vueuse/shared', 'useIntervalFn'],
  'shared/useLastChanged': ['@vueuse/shared', 'useLastChanged'],
  'shared/useMount': ['hairylib', 'useMounted'],
  'shared/useThrottleFn': ['@vueuse/shared', 'useThrottleFn'],
  'shared/useTimeout': ['@vueuse/shared', 'useTimeout'],
  'shared/useTimeoutFn': ['@vueuse/shared', 'useTimeoutFn'],
  'shared/useToggle': ['@vueuse/shared', 'useToggle'],
  'shared/useToNumber': ['@vueuse/shared', 'useToNumber'],
  'shared/useToString': ['@vueuse/shared', 'useToString'],
  'shared/useUnmount': ['react-use', 'useUnmount'],
  'shared/useUpdate': ['react-use', 'useUpdate'],
  'shared/useWatch': ['@vueuse/shared', 'watch'],
  'shared/useWatchAtMost': ['@vueuse/shared', 'watchAtMost'],
  'shared/useWatchDebounced': ['@vueuse/shared', 'watchDebounced'],
  'shared/useWatchDeep': ['@vueuse/shared', 'watchDeep'],
  'shared/useWhenever': ['@vueuse/shared', 'whenever'],
}

for (const [key, [source, upstream]] of Object.entries(MAP)) {
  const [pkg, hook] = key.split('/')
  const file = `packages/${pkg}/${hook}/index.tsx`
  const src = readFileSync(file, 'utf8')

  // locate the implementation: last `export function useX` with an opening `{`
  const matches = [...src.matchAll(new RegExp(`export function ${hook}[^{]*\\{`, 'g'))]
  const impl = matches[matches.length - 1]
  if (!impl) {
    console.log(`SKIP ${key}: no implementation`)
    continue
  }
  // the JSDoc whose `*/` is immediately before the implementation (only
  // whitespace in between)
  const jsdocStart = src.lastIndexOf('/**', impl.index!)
  if (jsdocStart === -1) {
    console.log(`SKIP ${key}: no JSDoc before implementation`)
    continue
  }
  const jsdocEnd = src.indexOf('*/', jsdocStart)
  if (jsdocEnd === -1 || jsdocEnd > impl.index!) {
    console.log(`SKIP ${key}: malformed JSDoc`)
    continue
  }
  const tail = src.slice(jsdocEnd + 2, impl.index!)
  if (/\S/.test(tail)) {
    console.log(`SKIP ${key}: JSDoc not adjacent to implementation`)
    continue
  }

  const block = src.slice(jsdocStart, jsdocEnd + 2)
  const mapLine = ` * Map from ${source} \`${upstream}\``
  if (block.includes('Map from')) {
    console.log(`SKIP ${key}: already has Map from`)
    continue
  }

  const lines = block.split('\n')
  // find the first blank ` *` line that ends the opening paragraph
  let blank = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].replace(/^\s*\* ?/, '').trim() === '') {
      blank = i
      break
    }
  }
  if (blank === -1) {
    // single-paragraph JSDoc — start a second paragraph at the end
    lines.splice(lines.length - 1, 0, ' *', mapLine)
  }
  else {
    // insert as the first line of the second paragraph
    lines.splice(blank + 1, 0, mapLine)
  }

  const newBlock = lines.join('\n')
  const newSrc = src.slice(0, jsdocStart) + newBlock + src.slice(jsdocEnd + 2)
  writeFileSync(file, newSrc)
  console.log(`UPDATED ${key} -> ${mapLine.trim()}`)
}
console.log('done')
