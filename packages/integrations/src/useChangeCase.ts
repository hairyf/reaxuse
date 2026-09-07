import type { MaybeRefOrGetter } from '@reaxuse/shared'
import type { Options } from 'change-case'
import type { Dispatch, SetStateAction } from 'react'
import { isRefLike, toValue } from '@reaxuse/shared'
import * as changeCase from 'change-case'
import { useEffect, useMemo, useRef, useState } from 'react'

type EndsWithCase<T> = T extends `${infer _}Case` ? T : never
type FilterKeys<T> = { [K in keyof T as K extends string ? K : never]: EndsWithCase<K> }
type ChangeCaseKeys = FilterKeys<typeof changeCase>

/**
 * Union of the transformations `change-case` exports as `*Case` functions —
 * derived from the module the same way VueUse does (`noCase`, `camelCase`,
 * `capitalCase`, `constantCase`, `dotCase`, `kebabCase`, `pascalCase`,
 * `pascalSnakeCase`, `pathCase`, `sentenceCase`, `snakeCase`, `trainCase`).
 */
export type ChangeCaseType = ChangeCaseKeys[keyof ChangeCaseKeys]

/**
 * React return type: `[value, setValue]` tuple — the writable-side analog of
 * the upstream `WritableComputedRef<string>` (issue §2B). `value` is the
 * transformed string; `setValue` updates the internal input state.
 */
export type UseChangeCaseReturn = [string, Dispatch<SetStateAction<string>>]

// upstream builds this map dynamically from the module exports; mirrored 1:1
// (name.endsWith('Case') + typeof === 'function')
const changeCaseTransforms = /* @__PURE__ */ Object.entries(changeCase)
  .filter((entry): entry is [string, (input: string, options?: Options) => string] => {
    const [name, fn] = entry
    return typeof fn === 'function' && name.endsWith('Case')
  })
  .reduce((acc, [name, fn]) => {
    acc[name as ChangeCaseType] = fn
    return acc
  }, {} as Record<ChangeCaseType, (input: string, options?: Options) => string>)

/**
 * React port of VueUse's `useChangeCase`.
 *
 * Map from @vueuse/integrations `useChangeCase`
 * (`source/vueuse/packages/integrations/useChangeCase/`), a reactive wrapper
 * around the `change-case` package. Upstream returns a writable
 * `WritableComputedRef<string>`; here the writable computed ref maps to a
 * `[value, setValue]` tuple: `value` is the transformed string (`change-case`
 * applied to the internal input state with the current `type`), and
 * `setValue` updates that internal input state like a controlled `useState`.
 * `input`, `type` and `options` accept plain values, ref-like `{ current }`
 * objects or getters, resolved with `toValue` from `@reaxuse/shared`.
 *
 * Adjustment for React:
 * - upstream `ref()` returns the same ref when handed a ref, so Vue ref
 *   inputs are live (read AND written by the computed). Here a ref-like
 *   `{ current }` object or a getter input stays live by re-syncing the
 *   internal state whenever the resolved external value changes between
 *   renders; plain-value inputs are copied once on mount (static, like
 *   upstream's computed captures them at setup). User writes via `setValue`
 *   are never clobbered unless the external source genuinely changed;
 * - upstream's getter overload (read-only `ComputedRef<string>`) collapses
 *   into the same writable tuple — getters are re-evaluated on change, and
 *   `setValue` still writes the internal state;
 * - `setValue` writes the RAW string; the transform is re-applied on the next
 *   render (the upstream computed's `get` re-derives from the ref on access).
 *
 * @__NO_SIDE_EFFECTS__
 * @example
 * const [changeCase, setChangeCase] = useChangeCase('hello world', 'camelCase')
 * changeCase // 'helloWorld'
 * setChangeCase('vue use')
 * changeCase // 'vueUse'
 */
export function useChangeCase(
  input: MaybeRefOrGetter<string>,
  type: MaybeRefOrGetter<ChangeCaseType>,
  options?: MaybeRefOrGetter<Options> | undefined,
): UseChangeCaseReturn {
  // internal input state — the writable half of the upstream computed
  const [text, setText] = useState<string>(() => toValue(input))

  // keep ref-like / getter inputs live (upstream index.md: "the returned
  // computed will change along with the source ref's changes"); the baseline
  // records the last value synced FROM the external source, so a `setValue`
  // write is only superseded by a genuine external change
  const lastExternalRef = useRef<string>(toValue(input))
  useEffect(() => {
    if (!isRefLike(input) && typeof input !== 'function')
      return
    const resolved = toValue(input)
    if (!Object.is(resolved, lastExternalRef.current)) {
      lastExternalRef.current = resolved
      setText(resolved)
    }
  })

  const typeName = toValue(type)
  const resolvedOptions = toValue(options)

  const value = useMemo(() => {
    const transform = changeCaseTransforms[typeName]
    if (!transform)
      throw new Error(`Invalid change case type "${typeName}"`)
    return transform(text, resolvedOptions)
  }, [text, typeName, resolvedOptions])

  return [value, setText]
}
