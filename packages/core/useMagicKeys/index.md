---
category: Sensors
---

# useMagicKeys

Reactive keys pressed state, with magical keys combination support — React port of VueUse's [`useMagicKeys`](https://vueuse.org/core/useMagicKeys/).

**Mapping:** upstream returns a proxy of individual refs (or a reactive object with `reactive: true`). React has no refs — the whole key state lives in one state object updated on `keydown` / `keyup`, so the returned values are always plain booleans and `reactive` is accepted for API compatibility only. Keys can be combined with `+` / `_` to build shortcut states (`Shift+Ctrl+A`, `alt_tab`, ...), and `current` is the `Set` of all keys currently pressed. The `keydown` / `keyup` listeners attach in a self-contained `useEffect` with cleanup (upstream composes `useEventListener`); the `blur` / `focus` reset listeners stay on `window`. The `target` accepts an element, a ref-like `{ current }` object or a getter — the listeners re-bind when the resolved target changes. Nothing touches the DOM during render (SSR-safe). All key side effects go in a `useEffect`.

## Usage

```tsx
import { useMagicKeys } from '@reaxuse/core'
import { useEffect } from 'react'

const { shift, space, a /* keys you want to monitor */ } = useMagicKeys()

useEffect(() => {
  if (space)
    console.log('space has been pressed')
}, [space])

useEffect(() => {
  if (shift && a)
    console.log('Shift + A have been pressed')
}, [shift, a])
```

Check out [all the possible keycodes](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values).

### Combinations

You can magically use combinations (shortcuts/hotkeys) by connecting keys with `+` or `_`.

```tsx
import { useMagicKeys } from '@reaxuse/core'

const keys = useMagicKeys()
const shiftCtrlA = keys['Shift+Ctrl+A']

useEffect(() => {
  if (shiftCtrlA)
    console.log('Shift + Ctrl + A have been pressed')
}, [shiftCtrlA])
```

```tsx
import { useMagicKeys } from '@reaxuse/core'

const { Ctrl_A_B, space, alt_s /* ... */ } = useMagicKeys()

useEffect(() => {
  if (Ctrl_A_B)
    console.log('Control+A+B have been pressed')
}, [Ctrl_A_B])
```

### Current Pressed keys

A special property `current` is provided to representing all the keys been pressed currently.

```tsx
import { useMagicKeys } from '@reaxuse/core'

const { current } = useMagicKeys()

console.log(current) // Set { 'control', 'a' }
```

### Key Aliasing

```tsx
import { useMagicKeys } from '@reaxuse/core'

const { shift_cool } = useMagicKeys({
  aliasMap: {
    cool: 'space',
  },
})

useEffect(() => {
  if (shift_cool)
    console.log('Shift + Space have been pressed')
}, [shift_cool])
```

By default, we have some preconfigured aliases for common practices (`ctrl` → `control`, `cmd` / `command` → `meta`, `option` → `alt`, `up` → `arrowup`, ...).

### Custom Event Handler

```tsx
import { useMagicKeys } from '@reaxuse/core'

const { ctrl_s } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.ctrlKey && e.key === 's' && e.type === 'keydown')
      e.preventDefault()
  },
})
```

> ⚠️ This usage is NOT recommended, please use with caution.

### Reactive Mode

Upstream can return a reactive object of plain booleans with `reactive: true`. React state is always "reactive", so the option is accepted for API compatibility but has no effect — values are plain booleans either way.

```tsx
import { useMagicKeys } from '@reaxuse/core'

const keys = useMagicKeys({ reactive: true })
```

<DemoContainer name="UseMagicKeys" />

## Type Declarations

```ts
export type MaybeRefOrGetter<T> = T | { current: T } | (() => T)

export interface UseMagicKeysOptions<Reactive extends boolean> {
  reactive?: Reactive
  target?: MaybeRefOrGetter<EventTarget>
  aliasMap?: Record<string, string>
  passive?: boolean
  onEventFired?: (e: KeyboardEvent) => void | boolean
}

export interface MagicKeysInternal {
  current: ReadonlySet<string>
}

export type UseMagicKeysReturn<Reactive extends boolean>
  = Readonly<
    Record<string, boolean> & MagicKeysInternal
  >

export function useMagicKeys<T extends boolean = false>(
  options?: UseMagicKeysOptions<T>,
): UseMagicKeysReturn<T>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useMagicKeys/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMagicKeys/index.ts) (implementation),
  [`aliasMap.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMagicKeys/aliasMap.ts) (inlined as `DefaultMagicKeysAliasMap` in `packages/core/src/useMagicKeys.ts`),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMagicKeys/index.browser.test.ts) (mirrored in `packages/core/src/useMagicKeys.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMagicKeys/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useMagicKeys.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useMagicKeys.ts), docs + demo co-located in `packages/core/useMagicKeys/`

<Contributors name="useMagicKeys" />
