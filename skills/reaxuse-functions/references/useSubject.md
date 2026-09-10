---
category: '@RxJS'
---

# useSubject

Bind an RxJS [`Subject`](https://rxjs.dev/guide/subject) to a controllable state and propagate value changes both ways.

## Install

```bash
npm i rxjs
```

## Usage

```tsx
import { useSubject } from '@reaxuse/rxjs'
import { Subject } from 'rxjs'

const subject = new Subject<string>()

export function Component() {
  const [value, setValue] = useSubject(subject)

  return (
    <input
      value={value ?? ''}
      onChange={e => setValue(e.target.value)}
    />
  )
}
```

`setValue` calls `subject.next(...)`, so the subject stays the single source of truth: a write is pushed into the subject and the state follows the emission that comes back through the subscription — which also means every other subscriber observes the write. Values emitted by the subject (`subject.next('from subject')`) update the state as well. The subscription is created once on mount and unsubscribed on unmount, so a new `subject` identity on a later render neither re-subscribes nor re-targets `setValue`.

### With BehaviorSubject

When using a `BehaviorSubject`, the state is initialized with the subject's current value and the type does not include `undefined`:

```tsx
import { useSubject } from '@reaxuse/rxjs'
import { BehaviorSubject } from 'rxjs'

const subject = new BehaviorSubject('initial')

const [value, setValue] = useSubject(subject) // string, not string | undefined
console.log(value) // 'initial'
```

### Error Handling

If you want to add custom error handling to a `Subject` that might error, you can supply an optional `onError` configuration. Without this, RxJS will treat any error in the supplied subject as an "unhandled error" and it will be thrown in a new call stack and reported to `window.onerror` (or `process.on('error')` if you happen to be in Node).

```tsx
import { useSubject } from '@reaxuse/rxjs'
import { Subject } from 'rxjs'

const subject = new Subject()

const [value, setValue] = useSubject(subject, {
  onError: (err) => {
    console.log(err.message) // "oops"
  },
})
```

## Type Declarations

```ts
/**
 * Options for `useSubject`.
 *
 * Upstream `UseSubjectOptions` is `useObservable`'s options minus
 * `initialValue`: a `BehaviorSubject` seeds the state with its own current
 * value and a plain `Subject` starts out `undefined`, so there is nothing for
 * the caller to supply.
 */
export type UseSubjectOptions<I = undefined> = Omit<
  UseObservableOptions<I>,
  "initialValue"
>
/**
 * Return of `useSubject`: a writable `[value, setValue]` tuple (upstream
 * returns a single `Ref<H>` / `Ref<H | undefined>`).
 */
export type UseSubjectReturn<H> = [
  value: H,
  setValue: Dispatch<SetStateAction<H>>,
]
/**
 * Bind an RxJS [`Subject`](https://rxjs.dev/guide/subject) to a controllable
 * state and propagate value changes both ways.
 *
 * Map from @vueuse/rxjs `useSubject`
 * (`source/vueuse/packages/rxjs/useSubject/`): the state is initialized from a
 * `BehaviorSubject`'s current value (or `undefined` for a plain `Subject`),
 * every emission is written into the state, and writing through the returned
 * setter is pushed back into the subject.
 *
 * React divergences:
 * - upstream returns a `Ref<H>` / `Ref<H | undefined>` that the caller mutates
 *   directly; the React port returns a `useState`-like writable
 *   `[value, setValue]` tuple (hairyf/reaxuse#218).
 * - `setValue` calls `subject.next(...)` — it does **not** set React state
 *   directly. Upstream keeps two writable places (`value.value` and the
 *   subject, bridged by `watch`); here the subject is the single source of
 *   truth, so a write is observable by every other subscriber of the subject
 *   and the exposed value follows the emission that comes back through the
 *   subscription. Unlike upstream's `watch` — which skips an unchanged
 *   primitive — the write is forwarded unconditionally, so `setValue(current)`
 *   still calls `subject.next(current)` and other subscribers see it
 *   (hairyf/reaxuse#218).
 * - the setter accepts a functional update (`useState` parity, hairyf/reaxuse#174);
 *   it is resolved against the latest value seen by the hook, so two functional
 *   updates in the same tick compose instead of both reading the same stale
 *   value.
 * - upstream's `tryOnScopeDispose` becomes the effect cleanup: the subscription
 *   is created once when the component mounts and unsubscribed on unmount.
 * - the `subject` argument is deliberately **not** an effect dependency — a new
 *   identity on a later render neither re-subscribes (Vue's `tryOnScopeDispose`
 *   also registers exactly once, during `setup`) nor re-targets `setValue`,
 *   which keeps writing into the subject the hook is subscribed to.
 * - `onError` is read when the subscription is created.
 * - SSR-safe: nothing touches `window` / `document`, and the subscription is
 *   only created in the mount effect.
 *
 * @see https://vueuse.org/rxjs/useSubject/
 * @example
 * const subject = new BehaviorSubject('initial')
 * const [value, setValue] = useSubject(subject)
 * // value is 'initial'; setValue('next') pushes 'next' into the subject
 */
export declare function useSubject<H>(
  subject: BehaviorSubject<H>,
  options?: UseSubjectOptions,
): UseSubjectReturn<H>
export declare function useSubject<H>(
  subject: Subject<H>,
  options?: UseSubjectOptions,
): UseSubjectReturn<H | undefined>
```
