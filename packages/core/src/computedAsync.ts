import type { RefOrValue } from '@reaxuse/shared'
import { noop, toValue } from '@reaxuse/shared'
import { useEffect, useRef, useState } from 'react'

/**
 * Upstream re-exports `Fn` from `@vueuse/shared` types; `@reaxuse/shared`
 * does not export it, so it is declared locally here (same pattern as
 * `packages/shared/src/useIntervalFn.ts`).
 */
type Fn = () => void

/**
 * Handle overlapping async evaluations.
 *
 * @param cancelCallback The provided callback is invoked when a re-evaluation of the computed value is triggered before the previous one finished
 */
export type AsyncComputedOnCancel = (cancelCallback: Fn) => void

export interface AsyncComputedOptions {
  /**
   * React dependency array driving re-evaluation (replaces upstream's
   * automatic reactive-dep tracking). Defaults to `[]` = evaluate once on
   * mount.
   */
  deps?: unknown[]
  /** Called with `true` when an evaluation starts, `false` when it settles. Replaces upstream's `evaluating` ref. */
  onEvaluating?: (value: boolean) => void
  /**
   * When true, skip the initial mount evaluation; evaluate only when `deps`
   * change. With the default `[]` deps the hook then never evaluates.
   */
  lazy?: boolean
  /** Called when the evaluation callback rejects; the current state is kept. */
  onError?: (error: unknown) => void
}

/**
 * Default `onError` — mirrors upstream's `globalThis.reportError` fallback.
 * `reportError` must be invoked with the global object as `this`, otherwise
 * Chromium throws "Illegal invocation" for a detached call.
 */
function defaultOnError(e: unknown) {
  if (typeof globalThis.reportError === 'function')
    globalThis.reportError(e)
}

function isPromiseLike<T>(value: T | Promise<T>): value is Promise<T> {
  return typeof (value as Partial<Promise<T>> | undefined)?.then === 'function'
}

const EMPTY_DEPS: unknown[] = []

/**
 * Create an asynchronous computed dependency — React port of VueUse's
 * `computedAsync`.
 *
 * Map from @vueuse/core `computedAsync`
 * (`source/vueuse/packages/core/computedAsync/`): re-evaluates an async
 * function when its inputs change, exposes the in-flight state, supports
 * cancellation through the `onCancel` callback handed to
 * `evaluationCallback`, and protects against stale out-of-order resolutions
 * — only the latest evaluation may update the state.
 *
 * React adaptation:
 *
 * - returns the plain resolved value `T` (repo convention §2B — pure-derived
 *   value, not a ref/tuple), starting at `toValue(initialState)` and held in
 *   internal `useState`; the hook never mutates anything during render;
 * - upstream tracks reactive dependencies automatically; React has no
 *   reactive graph, so re-evaluation is driven by the explicit
 *   `options.deps` array, compared with `useEffect` semantics (default `[]`
 *   = evaluate once on mount);
 * - upstream's `evaluating` ref becomes the `onEvaluating(value)` callback:
 *   `true` when an evaluation starts, `false` when it settles — resolved,
 *   rejected, or discarded by a newer evaluation or by unmount. An
 *   evaluation reports `false` at most once (a superseded evaluation
 *   settles at invalidation time, not when its abandoned promise later
 *   resolves), and it is never called after unmount;
 * - `onCancel(cb)` registers cleanup callbacks; all registered callbacks
 *   are invoked — and the registry cleared — when the deps change
 *   mid-flight or on unmount (upstream parity). They are not invoked once
 *   the evaluation has finished (upstream's `hasFinished` flag);
 * - stale protection: a monotonically increasing evaluation id discards
 *   results of evaluations superseded by a newer one (or by an unmount),
 *   mirroring upstream's `counter` guard;
 * - on rejection the current state is kept and `options.onError` receives
 *   the error (default: `globalThis.reportError`, upstream parity). Like
 *   upstream, rejections of superseded/cancelled evaluations also reach
 *   `onError` — pass a custom `onError` if cancelled runs must stay silent;
 * - sync (non-Promise) return values from `evaluationCallback` update the
 *   state synchronously within the effect;
 * - `lazy: true` skips the mount evaluation — evaluation then happens only
 *   when `deps` change (upstream starts on the first read of the computed);
 * - upstream's `shallow` option (React state is never deep-wrapped) and the
 *   `Ref<boolean>`-as-`evaluating` overload are not portable and are
 *   collapsed into `options` only.
 *
 * The upstream `asyncComputed` alias is intentionally not ported
 * (upstream-only; deprecated there in favor of `computedAsync`).
 *
 * @__NO_SIDE_EFFECTS__
 * @example
 * const downloads = computedAsync(
 *   async (onCancel) => {
 *     const controller = new AbortController()
 *     onCancel(() => controller.abort())
 *     const response = await fetch(url, { signal: controller.signal })
 *     return response.ok ? (await response.json() as { downloads: number }).downloads : 0
 *   },
 *   0,
 *   { deps: [packageName] },
 * )
 *
 * @see https://vueuse.org/computedAsync/
 */
export function computedAsync<T>(
  evaluationCallback: (onCancel: AsyncComputedOnCancel) => T | Promise<T>,
  initialState: RefOrValue<T>,
  options?: AsyncComputedOptions,
): T {
  const {
    deps = EMPTY_DEPS,
    lazy = false,
    onEvaluating = noop,
    onError = defaultOnError,
  } = options ?? {}

  const [state, setState] = useState<T>(() => toValue(initialState))

  // Latest-input mirrors synced every render (house pattern) so the effect
  // always reads the newest inputs while `deps` stays the only trigger.
  const evaluationCallbackRef = useRef(evaluationCallback)
  evaluationCallbackRef.current = evaluationCallback
  const lazyRef = useRef(lazy)
  lazyRef.current = lazy
  const onEvaluatingRef = useRef(onEvaluating)
  onEvaluatingRef.current = onEvaluating
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  // Monotonically increasing evaluation id — only the latest evaluation may
  // update the state (mirrors upstream's `counter`).
  const evaluationIdRef = useRef(0)
  // Flipped by the dedicated mount effect below so async continuations can
  // never touch state or signals after unmount.
  const isMountedRef = useRef(true)
  // `false` until the first evaluation effect run — drives `lazy`.
  const hasEvaluatedRef = useRef(false)

  useEffect(() => {
    const isFirstRun = !hasEvaluatedRef.current
    hasEvaluatedRef.current = true

    if (isFirstRun && lazyRef.current) {
      // lazy: skip the mount evaluation — evaluate only when deps change
      return
    }

    const id = (evaluationIdRef.current += 1)
    let hasFinished = false
    let settled = false
    const cancelCallbacks: Fn[] = []

    const settle = () => {
      if (settled || !isMountedRef.current)
        return
      settled = true
      onEvaluatingRef.current(false)
    }

    const invalidate = () => {
      settle()
      if (!hasFinished) {
        // invoke and clear the cancellation registry (upstream parity)
        const callbacks = cancelCallbacks.splice(0, cancelCallbacks.length)
        callbacks.forEach(cancelCallback => cancelCallback())
      }
    }

    onEvaluatingRef.current(true)

    try {
      const result = evaluationCallbackRef.current((cancelCallback) => {
        cancelCallbacks.push(cancelCallback)
      })

      if (isPromiseLike(result)) {
        result.then((value) => {
          hasFinished = true
          if (id === evaluationIdRef.current && isMountedRef.current)
            setState(value)
          settle()
        }, (error) => {
          hasFinished = true
          onErrorRef.current(error)
          settle()
        })
      }
      else {
        // sync return value — update the state within the effect
        hasFinished = true
        setState(result)
        settle()
      }
    }
    catch (error) {
      // synchronous throw from evaluationCallback — upstream catches it too
      hasFinished = true
      onErrorRef.current(error)
      settle()
    }

    return invalidate
  }, deps)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return state
}
