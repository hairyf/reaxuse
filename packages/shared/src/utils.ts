/* eslint-disable antfu/top-level-function */
// Ported from VueUse @vueuse/shared utils (source/vueuse/packages/shared/utils)

// ---------------------------------------------------------------------------
// general.ts
// ---------------------------------------------------------------------------

export function promiseTimeout(
  ms: number,
  throwOnTimeout = false,
  reason = 'Timeout',
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (throwOnTimeout)
      setTimeout(reject, ms, reason)
    else
      setTimeout(resolve, ms)
  })
}

export interface SingletonPromiseReturn<T> {
  (): Promise<T>
  /**
   * Reset current staled promise.
   * await it to have proper shutdown.
   */
  reset: () => Promise<void>
}
/**
 * Create singleton promise function
 *
 * @example
 * ```
 * const promise = createSingletonPromise(async () => { ... })
 *
 * await promise()
 * await promise() // all of them will be bind to a single promise instance
 * await promise() // and be resolved together
 * ```
 */

export function createSingletonPromise<T>(fn: () => Promise<T>): SingletonPromiseReturn<T> {
  let _promise: Promise<T> | undefined

  function wrapper() {
    if (!_promise)
      _promise = fn()
    return _promise
  }
  wrapper.reset = async () => {
    const _prev = _promise
    _promise = undefined
    if (_prev)
      await _prev
  }

  return wrapper
}

/**
 * Increase string a value with unit
 *
 * @example '2px' + 1 = '3px'
 * @example '15em' + (-2) = '13em'
 */

export function increaseWithUnit(target: number, delta: number): number
export function increaseWithUnit(target: string, delta: number): string
export function increaseWithUnit(target: string | number, delta: number): string | number
export function increaseWithUnit(target: string | number, delta: number): string | number {
  if (typeof target === 'number')
    return target + delta
  const value = target.match(/^-?\d+\.?\d*/)?.[0] || ''
  const unit = target.slice(value.length)
  const result = (Number.parseFloat(value) + delta)
  if (Number.isNaN(result))
    return target
  return result + unit
}

/**
 * Create a new subset object by giving keys
 */

export function objectPick<O extends object, T extends keyof O>(obj: O, keys: T[], omitUndefined = false) {
  return keys.reduce((n, k) => {
    if (k in obj) {
      if (!omitUndefined || obj[k] !== undefined)
        n[k] = obj[k]
    }
    return n
  }, {} as Pick<O, T>)
}

/**
 * Create a new subset object by omit giving keys
 */

export function objectOmit<O extends object, T extends keyof O>(obj: O, keys: T[], omitUndefined = false) {
  return Object.fromEntries(Object.entries(obj).filter(([key, value]) => {
    return (!omitUndefined || value !== undefined) && !keys.includes(key as T)
  })) as Omit<O, T>
}

export function toArray<T>(value: T | readonly T[]): readonly T[]
export function toArray<T>(value: T | T[]): T[]
export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

// ---------------------------------------------------------------------------
// is.ts
// ---------------------------------------------------------------------------

export const isClient = typeof window !== 'undefined' && typeof document !== 'undefined'
export const isDef = <T = any>(val?: T): val is T => typeof val !== 'undefined'
export const assert = (condition: boolean, ...infos: any[]) => {
  if (!condition)
    console.warn(...infos)
}
const toString = Object.prototype.toString
export const isObject = (val: any): val is object =>
  toString.call(val) === '[object Object]'
export const now = () => Date.now()
export const timestamp = () => +Date.now()
export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
export const noop = () => {}
export const rand = (min: number, max: number) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}
export const hasOwn = <T extends object, K extends keyof T>(val: T, key: K): key is K => Object.hasOwn(val, key)

export const isIOS = /* #__PURE__ */ getIsIOS()

function getIsIOS(): boolean {
  return isClient && !!window?.navigator?.userAgent && (
    (/iP(?:ad|hone|od)/.test(window.navigator.userAgent))
    // The new iPad Pro Gen3 does not identify itself as iPad, but as Macintosh.
    // https://github.com/vueuse/vueuse/issues/3577
    || (window?.navigator?.maxTouchPoints > 2 && /iPad|Macintosh/.test(window?.navigator.userAgent))
  )
}

// ---------------------------------------------------------------------------
// port.ts (hyphenate only — the remaining port.ts helpers stay unported)
// ---------------------------------------------------------------------------

// copied from vue: https://github.com/vuejs/core/blob/3be4e3cbe34b394096210897c1be8deeb6d748d8/packages/shared/src/general.ts#L90-L112
function cacheStringFunction<T extends (str: string) => string>(fn: T): T {
  const cache: Record<string, string> = Object.create(null)
  return ((str: string) => {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }) as T
}

const hyphenateRE = /\B([A-Z])/g
export const hyphenate = cacheStringFunction((str: string) => str.replace(hyphenateRE, '-$1').toLowerCase())

// ---------------------------------------------------------------------------
// reaxuse 引用链核心工具 (single source of truth — other packages import
// these from @reaxuse/shared, never re-implement; see MONITORING-HANDOFF §2C)
// ---------------------------------------------------------------------------

/**
 * Value, React ref-like object (`{ current }`) or getter — the React analog of
 * VueUse's `MaybeRefOrGetter`.
 */
export type MaybeRefOrGetter<T> = T | { current: T } | (() => T)

/**
 * Allow a custom `window` instance, e.g. working with iframes or in testing
 * environments. Single source of truth — VueUse defines this in shared too.
 */
export interface ConfigurableWindow {
  window?: Window
}

/**
 * Type guard for React-style ref-like objects (`{ current }`).
 */
export function isRefLike<T>(value: MaybeRefOrGetter<T>): value is { current: T } {
  return value !== null && typeof value === 'object' && 'current' in value
}

/**
 * Resolve a plain value, a React ref-like object (`{ current }`) or a getter
 * function to its current value — the React analog of VueUse's `toValue`.
 */
export function toValue<T>(value: MaybeRefOrGetter<T>): T
export function toValue<T>(value: MaybeRefOrGetter<T> | undefined): T | undefined
export function toValue<T>(value: MaybeRefOrGetter<T> | undefined): T | undefined {
  if (typeof value === 'function')
    return (value as () => T)()
  if (value !== null && typeof value === 'object' && 'current' in value)
    return (value as { current: T }).current
  return value
}
