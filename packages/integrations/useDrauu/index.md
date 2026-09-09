---
category: '@Integrations'
---

# useDrauu

Reactive instance for [drauu](https://github.com/antfu/drauu) — React port of
VueUse's [`useDrauu`](https://vueuse.org/integrations/useDrauu/). Creates a
drauu instance for a target `<svg>` element and exposes the drawing API, the
undo/redo status and drauu's events.

**Mapping:** upstream returns `Ref<Drauu | undefined>` / `ShallowRef<boolean>` /
`Ref<Brush>` plus five `EventHookOn` members; the React port returns an **object**
(method bag, not a state-like writable pair — issue §2B) with plain values and
explicit setters:

- `drauuInstance`, `canUndo`, `canRedo`, `brush` are plain values instead of refs;
- the writable `brush` ref becomes `brush` + `setBrush(brush)`. `setBrush` writes
  the returned value **and** the mounted instance's `brush` / `mode`, mirroring
  upstream's deep watcher on the brush ref;
- `load` / `dump` / `clear` / `cancel` / `undo` / `redo` are stable callbacks that
  no-op safely while no instance exists (upstream `drauuInstance.value?.xxx()`);
- the five `on*` members are §2D **registrars** — `(fn) => ({ off })`, typed
  `ListenerOn<T>` from `@reaxuse/shared` — consumable as
  `useListener(onChanged, cb)`, where `off()` removes exactly that listener and is
  idempotent (upstream `EventHookOn`, which relies on the Vue effect scope for
  cleanup);
- the instance is created in an effect keyed on the resolved element's identity
  (upstream: `watch(() => unrefElement(target), ..., { flush: 'post' })`) and
  unmounted on cleanup (upstream `tryOnScopeDispose`); when the resolved element
  identity changes the instance is destroyed and recreated, and only an
  `SVGSVGElement` target mounts (upstream's guard);
- the element target is resolved locally from `@reaxuse/shared`'s `toValue` /
  `isRefLike` (`packages/integrations/src/useDrauu.ts`, precedent
  `packages/integrations/src/useFocusTrap.ts`) — `packages/integrations` must not
  import `@reaxuse/core` (eslint `no-restricted-imports`);
- upstream's `onCommitted` passes the committed `SVGElement` to its listeners;
  the mandated return type types it `ListenerOn<() => void>`, so the node payload
  is not forwarded.

Upstream has **no test file** (`source/vueuse/packages/integrations/useDrauu/`
contains only `index.ts`, `index.md` and `demo.client.vue`), so the co-located
`useDrauu.test.tsx` is authored for this port: it drives drauu's real pointer
pipeline (`pointerdown` on the `<svg>`, `pointermove` / `pointerup` on the
window) and covers instance lifecycle, option merging, `load`/`dump` round-trip,
`clear`, undo/redo + `canUndo`/`canRedo` transitions, `setBrush`, every `on*`
registrar with `off()`, `useListener` consumability, and element-identity
recreation.

## Install

```bash
npm i drauu@^1
```

## Usage

```tsx
import { useDrauu } from '@reaxuse/integrations'
import { useRef } from 'react'

const target = useRef<SVGSVGElement>(null)
const { undo, redo, canUndo, canRedo, clear, brush, setBrush } = useDrauu(target, {
  brush: { color: 'black', size: 3 },
})

// `brush` is the current brush value; `setBrush` updates it and the instance
setBrush({ ...brush, color: '#ef4444' })

return <svg ref={target} />
```

Subscribe to drauu's events with the §2D listener protocol:

```tsx
import { useDrauu } from '@reaxuse/integrations'
import { useListener } from '@reaxuse/shared'
import { useRef } from 'react'

const target = useRef<SVGSVGElement>(null)
const { onChanged, onCommitted, onStart, onEnd, onCanceled } = useDrauu(target)

useListener(onChanged, () => console.log('changed'))
useListener(onCommitted, () => console.log('committed'))
useListener(onStart, () => console.log('start'))
useListener(onEnd, () => console.log('end'))
useListener(onCanceled, () => console.log('canceled'))
```

`off()` unsubscribes a single listener without touching the others:

```tsx
const handle = onChanged(() => console.log('changed'))
handle?.off()
```

<DemoContainer name="useDrauu" />

## Type Declarations

```ts
export type UseDrauuOptions = Omit<Options, 'el'> // drauu's own options, minus `el`

export interface UseDrauuReturn {
  drauuInstance: Drauu | undefined
  load: (svg: string) => void
  dump: () => string | undefined
  clear: () => void
  cancel: () => void
  undo: () => boolean | undefined
  redo: () => boolean | undefined
  canUndo: boolean
  canRedo: boolean
  brush: Brush
  setBrush: (brush: Brush) => void
  onChanged: ListenerOn<() => void>
  onCommitted: ListenerOn<() => void>
  onStart: ListenerOn<() => void>
  onEnd: ListenerOn<() => void>
  onCanceled: ListenerOn<() => void>
}

export function useDrauu(
  target: DrauuTarget, // HTMLElement | SVGElement | null | undefined | { readonly current: ... }
  options?: UseDrauuOptions,
): UseDrauuReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/integrations/useDrauu/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useDrauu/index.ts) (implementation, 145 LOC),
  [`index.md`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useDrauu/index.md) (docs),
  [`demo.client.vue`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useDrauu/demo.client.vue) (ported to `demo.tsx` below).
  Upstream ships **no test file** — `useDrauu.test.tsx` is authored for this port.
- reaxuse: [`packages/integrations/src/useDrauu.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/integrations/src/useDrauu.ts), docs + demo co-located in `packages/integrations/useDrauu/`

<Contributors name="useDrauu" />
