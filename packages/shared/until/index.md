---
category: Watch
---

# until

Promised one-time watch for changes — React port of VueUse's [`until`](https://vueuse.org/shared/until/).

**Mapping:** upstream resolves a promise with Vue's reactive `watch` (immediate, `flush: 'sync'`) once the condition holds. React has no reactive watch, so this port **polls** the source — a `{ current }` ref-like object, a getter, or a plain value — at a small fixed interval (the same ref-like polling `useFetch` uses for its `refetch` watch) and resolves the promise the first time the condition holds. `until` is a **pure function, not a hook**: no React hooks are involved, so call it anywhere (handlers, effects, tests) and `await` any of the returned methods. When the expected value is itself a `{ current }` ref-like or a getter, it is re-read on every tick, mirroring upstream's multi-source watch.

## Usage

### Wait for some async data to be ready

```tsx
import { until } from '@reaxuse/shared'

const isReady = { current: false }
// ... somewhere later: isReady.current = true
const ready = await until(isReady).toBe(true)
```

### Wait for custom conditions

```tsx
import { until } from '@reaxuse/shared'

const count = { current: 0 }

void until(count).toMatch(v => v > 7).then(() => {
  alert('Count is now larger than 7!')
})
```

### Timeout

```tsx
import { until } from '@reaxuse/shared'
// ---cut---
// will be resolved until `ref.current === true` or 1000ms passed
await until(ref).toBe(true, { timeout: 1000 })

// will throw if timeout
try {
  await until(ref).toBe(true, { timeout: 1000, throwOnTimeout: true })
  // ref.current === true
}
catch (e) {
  // timeout
}
```

### More Examples

```tsx
import { until } from '@reaxuse/shared'
// ---cut---
await until(ref).toBe(true)
await until(ref).toBe(true, { timeout: 1000 })
await until(ref).toMatch(v => v > 10 && v < 100)
await until(ref).changed()
await until(ref).changedTimes(10)
await until(ref).toBeTruthy()
await until(ref).toBeNull()

await until(ref).not.toBeNull()
await until(ref).not.toBeTruthy()
```

<DemoContainer name="Until" />

## Type Declarations

```ts
export interface UntilToMatchOptions {
  timeout?: number
  throwOnTimeout?: boolean
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

export interface UntilValueInstance<T, Not extends boolean = false> extends UntilBaseInstance<T, Not> {
  readonly not: UntilValueInstance<T, Not extends true ? false : true>

  toBe: <P = T>(value: MaybeRefOrGetter<P>, options?: UntilToMatchOptions) => Not extends true ? Promise<T> : Promise<P>
  toBeTruthy: (options?: UntilToMatchOptions) => Not extends true ? Promise<T & Falsy> : Promise<Exclude<T, Falsy>>
  toBeNull: (options?: UntilToMatchOptions) => Not extends true ? Promise<Exclude<T, null>> : Promise<null>
  toBeUndefined: (options?: UntilToMatchOptions) => Not extends true ? Promise<Exclude<T, undefined>> : Promise<undefined>
  toBeNaN: (options?: UntilToMatchOptions) => Promise<T>
}

export interface UntilArrayInstance<T> extends UntilBaseInstance<T> {
  readonly not: UntilArrayInstance<T>
  toContains: (value: MaybeRefOrGetter<ElementOf<T>>, options?: UntilToMatchOptions) => Promise<T>
}

export function until<T extends unknown[]>(r: MaybeRefOrGetter<T>): UntilArrayInstance<T>
export function until<T>(r: MaybeRefOrGetter<T>): UntilValueInstance<T>
```

## Source

- VueUse: [`packages/shared/until`](https://github.com/vueuse/vueuse/tree/main/packages/shared/until) — source [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/until/index.ts), tests [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/until/index.test.ts), demo [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/shared/until/demo.vue)
- reaxuse: [`packages/shared/src/until.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/until.ts) + [`until.test.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/until.test.tsx)

<Contributors name="until" />
