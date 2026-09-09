import type { RefOrValue } from '../index'
import { promiseTimeout, toValue } from '../utils'

/**
 * Polling interval (ms) used to resolve `until` promises. React has no
 * reactive watch, so the port re-reads the ref-like source at this
 * fixed interval — the same ref-like polling approach `useFetch` uses for its
 * `refetch` watch.
 */
const UNTIL_POLL_INTERVAL = 50

export interface UntilToMatchOptions {
  /**
   * Milliseconds timeout for promise to resolve/reject if the when condition does not meet.
   * 0 for never timed out
   *
   * @default 0
   */
  timeout?: number

  /**
   * Reject the promise when timeout
   *
   * @default false
   */
  throwOnTimeout?: boolean

  /**
   * `deep` option for the internal watch — kept for API compatibility. The
   * React poller re-reads the source on every tick, so deep observation is
   * implicit and this option is effectively a no-op.
   *
   * @default false
   */
  deep?: boolean
}

export interface UntilBaseInstance<T, Not extends boolean = false> {
  toMatch: (<U extends T = T>(
    condition: (v: T) => v is U,
    options?: UntilToMatchOptions,
  ) => Not extends true ? Promise<Exclude<T, U>> : Promise<U>) & ((
    condition: (v: T) => boolean,
    options?: UntilToMatchOptions,
  ) => Promise<T>)
  changed: (options?: UntilToMatchOptions) => Promise<T>
  changedTimes: (n?: number, options?: UntilToMatchOptions) => Promise<T>
}

type Falsy = false | void | null | undefined | 0 | 0n | ''

export interface UntilValueInstance<T, Not extends boolean = false> extends UntilBaseInstance<T, Not> {
  readonly not: UntilValueInstance<T, Not extends true ? false : true>

  toBe: <P = T>(value: RefOrValue<P>, options?: UntilToMatchOptions) => Not extends true ? Promise<T> : Promise<P>
  toBeTruthy: (options?: UntilToMatchOptions) => Not extends true ? Promise<T & Falsy> : Promise<Exclude<T, Falsy>>
  toBeNull: (options?: UntilToMatchOptions) => Not extends true ? Promise<Exclude<T, null>> : Promise<null>
  toBeUndefined: (options?: UntilToMatchOptions) => Not extends true ? Promise<Exclude<T, undefined>> : Promise<undefined>
  toBeNaN: (options?: UntilToMatchOptions) => Promise<T>
}

type ElementOf<T> = T extends readonly unknown[] ? T[number] : never

export interface UntilArrayInstance<T> extends UntilBaseInstance<T> {
  readonly not: UntilArrayInstance<T>

  toContains: (value: RefOrValue<ElementOf<T>>, options?: UntilToMatchOptions) => Promise<T>
}

function createUntil<T>(r: any, isNot = false): UntilValueInstance<T, boolean> | UntilArrayInstance<T> {
  function toMatch(
    condition: (v: any) => boolean,
    { timeout, throwOnTimeout }: UntilToMatchOptions = {},
  ): Promise<T> {
    let stop: (() => void) | null = null

    const watcher = new Promise<T>((resolve) => {
      let settled = false

      const check = () => {
        if (settled)
          return
        const value = toValue(r)
        if (condition(value) !== isNot) {
          settled = true
          stop?.()
          resolve(value)
        }
      }

      // mirror upstream watch's `immediate: true` + `flush: 'sync'` initial check
      check()
      if (!settled) {
        const timer = setInterval(check, UNTIL_POLL_INTERVAL)
        stop = () => clearInterval(timer)
      }
    })

    const promises: Promise<T>[] = [watcher]
    if (timeout != null) {
      promises.push(
        promiseTimeout(timeout, throwOnTimeout)
          .then(() => toValue(r))
          .finally(() => stop?.()),
      )
    }

    return Promise.race(promises)
  }

  function toBe<P>(value: RefOrValue<P | T>, options?: UntilToMatchOptions) {
    return toMatch(v => v === toValue(value), options)
  }

  function toBeTruthy(options?: UntilToMatchOptions) {
    return toMatch(v => Boolean(v), options)
  }

  function toBeNull(options?: UntilToMatchOptions) {
    return toBe<null>(null, options)
  }

  function toBeUndefined(options?: UntilToMatchOptions) {
    return toBe<undefined>(undefined, options)
  }

  function toBeNaN(options?: UntilToMatchOptions) {
    return toMatch(Number.isNaN, options)
  }

  function toContains(
    value: any,
    options?: UntilToMatchOptions,
  ) {
    return toMatch((v) => {
      const array = Array.from(v as any)
      return array.includes(value) || array.includes(toValue(value))
    }, options)
  }

  function changed(options?: UntilToMatchOptions) {
    return changedTimes(1, options)
  }

  function changedTimes(n = 1, options?: UntilToMatchOptions) {
    // count actual changes, not ticks: the poller may re-read an unchanged
    // source several times before the next mutation
    let count = 0
    let hasBaseline = false
    let lastValue: any

    return toMatch((v) => {
      if (!hasBaseline) {
        hasBaseline = true
        lastValue = v
        return count >= n
      }
      if (v !== lastValue) {
        count += 1
        lastValue = v
      }
      return count >= n
    }, options)
  }

  if (Array.isArray(toValue(r))) {
    const instance: UntilArrayInstance<T> = {
      toMatch: toMatch as any,
      toContains,
      changed,
      changedTimes,
      get not() {
        return createUntil(r, !isNot) as UntilArrayInstance<T>
      },
    }
    return instance
  }
  else {
    const instance: UntilValueInstance<T, boolean> = {
      toMatch: toMatch as any,
      toBe,
      toBeTruthy: toBeTruthy as any,
      toBeNull: toBeNull as any,
      toBeNaN,
      toBeUndefined: toBeUndefined as any,
      changed,
      changedTimes,
      get not() {
        return createUntil(r, !isNot) as UntilValueInstance<T, boolean>
      },
    }

    return instance
  }
}

/**
 * Promised one-time watch for changes
 *
 * Map from @vueuse/shared `until`
 * React adaptation: upstream resolves when Vue's reactive `watch` callback
 * first observes the condition holding; React has no reactive refs or watch,
 * so this port **polls** the ref-like (`{ current }`) / getter source at a
 * small fixed interval (the same ref-like polling `useFetch` uses for its
 * `refetch` watch) and resolves the promise the first time the condition
 * holds. `until` is a **pure function, not a hook** — no React hooks are
 * involved — so it can be used anywhere a plain promise utility can.
 *
 * @example
 * const { count, inc } = useCounter()
 *
 * void until(count).toMatch(v => v > 7).then(() => {
 *   alert('Counter is now larger than 7!')
 * })
 *
 * @see https://vueuse.org/shared/until/
 */
export function until<T extends unknown[]>(r: RefOrValue<T>): UntilArrayInstance<T>
export function until<T>(r: RefOrValue<T>): UntilValueInstance<T>
export function until<T>(r: any): UntilValueInstance<T, boolean> | UntilArrayInstance<T> {
  return createUntil(r)
}
