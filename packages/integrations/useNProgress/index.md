---
category: '@Integrations'
---

# useNProgress

Reactive wrapper for [`nprogress`](https://github.com/rstacruz/nprogress) — React port of
VueUse's [`useNProgress`](https://vueuse.org/integrations/useNProgress/).

**Mapping:** upstream returns a writable `WritableComputedRef<boolean>` `isLoading` plus a
`Ref<number | null | undefined>` `progress`. The React port returns a plain object with plain state:
`isLoading` is derived (`typeof progress === 'number' && progress < 1`) and written through
`setIsLoading` (`true` → `nprogress.start()`, `false` → `nprogress.done()`), and `progress` is written
through `setProgress`. `currentProgress` accepts a plain number or a ref-like `{ current }` object,
resolved with `toValue` from `@reaxuse/shared`.

**Deviation from upstream:** VueUse monkey-patches the module-singleton `nprogress.set` so its internal
`set` calls (`start` → `set(0)`, `done` → `set(1)`) write back into `progress.value`. This port never
touches the global `nprogress.set` — `setProgress(n)` sets the state and calls `nprogress.set(n)`,
while `start` / `done` / `setIsLoading` mirror the same write-back by hand, so `isLoading` flips exactly
as upstream without global pollution and safely with concurrent hook instances.

> `nprogress` is a module singleton, so unmounting one hook instance calls `nprogress.remove()` and
> removes the shared bar — the same semantics as upstream's `tryOnScopeDispose(nprogress.remove)`.

## Install

```bash
npm i nprogress@^0
```

## Usage

```tsx
import { useNProgress } from '@reaxuse/integrations'

const { isLoading, setIsLoading } = useNProgress()

function toggle() {
  setIsLoading(!isLoading)
}
```

### Passing a progress percentage

You can pass a percentage to indicate where the bar should start from.

```tsx
import { useNProgress } from '@reaxuse/integrations'

const { progress, setProgress } = useNProgress(0.5)

function done() {
  setProgress(1.0)
}
```

> To change the progress percentage, call `setProgress(n)`, where n is a number between 0..1.

### Customization

Just edit [nprogress.css](https://github.com/rstacruz/nprogress/blob/master/nprogress.css) to your liking. Tip: you probably only want to find and replace occurrences of #29d.

You can [configure](https://github.com/rstacruz/nprogress#configuration) it by passing an object as a second parameter. Options are applied once on mount (like upstream's setup-time `nprogress.configure(options)`); later changes are not re-applied.

```tsx
import { useNProgress } from '@reaxuse/integrations'

useNProgress(null, {
  minimum: 0.1,
  // ...
})
```

<DemoContainer name="useNProgress" />

## Type Declarations

```ts
export type UseNProgressOptions = Partial<NProgressOptions>

export interface UseNProgressReturn {
  isLoading: boolean
  progress: number | null | undefined
  setIsLoading: (load: boolean) => void
  setProgress: (n: number) => void
  start: () => NProgress
  done: (force?: boolean) => NProgress
  remove: () => void
}

export function useNProgress(
  currentProgress: RefOrValue<number | null | undefined> = null,
  options?: UseNProgressOptions,
): UseNProgressReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/integrations/useNProgress/index.ts`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useNProgress/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useNProgress/demo.vue) (ported to `demo.tsx` below)
- **upstream has no `index.test.ts`** for `useNProgress`, so `useNProgress.test.tsx` was authored for this port (no upstream test to mirror)
- reaxuse: [`packages/integrations/src/useNProgress.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/integrations/src/useNProgress.ts), docs + demo co-located in `packages/integrations/useNProgress/`

<Contributors name="useNProgress" />
