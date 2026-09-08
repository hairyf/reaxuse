---
category: '@Integrations'
---

# useFocusTrap

Reactive wrapper for [`focus-trap`](https://github.com/focus-trap/focus-trap) — React port of VueUse's
[`useFocusTrap`](https://vueuse.org/integrations/useFocusTrap/). While the trap is active, focus is kept
inside the target element(s): Tab / Shift+Tab cycle through the focusable descendants and any attempt to
move focus outside pulls it back in.

**Mapping:** upstream watches the resolved targets and creates the `focus-trap` instance on first change,
exposing `hasFocus` / `isPaused` as `ShallowRef`s; the React port creates the `createFocusTrap` instance
in an effect keyed on the resolved targets and keeps it for the lifetime of the component —
`updateContainerElements` handles target changes and `deactivate()` runs on unmount — with `hasFocus` /
`isPaused` as plain booleans driven by focus-trap's `onActivate` / `onDeactivate` events plus the pause /
unpause calls. `activate` / `deactivate` / `pause` / `unpause` are stable callbacks that delegate to the
current trap instance, and the `immediate` option activates the trap as soon as the target elements are
available. The target accepts an element, a React ref object (`{ current }`), a selector string, a getter
returning any of these, or an array of them.

For more information on what options can be passed, see [`createOptions`](https://github.com/focus-trap/focus-trap#createoptions)
in the `focus-trap` documentation.

## Install

```bash
npm i focus-trap@^7
```

## Usage

**Basic Usage**

```tsx
import { useFocusTrap } from '@reaxuse/integrations'
import { useRef } from 'react'

function Component() {
  const target = useRef<HTMLDivElement>(null)
  const { hasFocus, activate, deactivate } = useFocusTrap(target)

  return (
    <div>
      <button onClick={() => activate()}>
        Activate
      </button>
      <div ref={target}>
        <span>
          Has Focus:
          {String(hasFocus)}
        </span>
        <input type="text" />
        <button onClick={() => deactivate()}>
          Deactivate
        </button>
      </div>
    </div>
  )
}
```

**Multiple Targets**

```tsx
const targetOne = useRef<HTMLDivElement>(null)
const targetTwo = useRef<HTMLDivElement>(null)
const { hasFocus, activate, deactivate } = useFocusTrap([targetOne, targetTwo])
```

**Selector String**

```tsx
const { hasFocus, activate, deactivate } = useFocusTrap('#dialog')
```

**Automatically Focus**

```tsx
const target = useRef<HTMLDivElement>(null)
const { hasFocus, activate, deactivate } = useFocusTrap(target, { immediate: true })
// the trap is activated as soon as the target element is available
```

**Conditional Rendering**

The trap can't focus elements that do not exist in the DOM yet, so activate on the next tick when
rendering conditionally:

```tsx
const [show, setShow] = useState(false)
const target = useRef<HTMLDivElement>(null)
const { activate } = useFocusTrap(target, { immediate: true })

function reveal() {
  setShow(true)
  setTimeout(activate, 0)
}
```

<DemoContainer name="UseFocusTrap" />

## Type Declarations

```ts
export interface UseFocusTrapOptions extends Options {
  /**
   * Immediately activate the trap
   */
  immediate?: boolean
}

export interface UseFocusTrapReturn {
  /**
   * Indicates if the focus trap is currently active
   */
  hasFocus: boolean

  /**
   * Indicates if the focus trap is currently paused
   */
  isPaused: boolean

  activate: (opts?: ActivateOptions) => void
  deactivate: (opts?: DeactivateOptions) => void
  pause: () => void
  unpause: () => void
}

export function useFocusTrap(
  target: MaybeRefOrGetter<Arrayable<MaybeRefOrGetter<string> | MaybeComputedElementRef>>,
  options?: UseFocusTrapOptions,
): UseFocusTrapReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/integrations/useFocusTrap/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useFocusTrap/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useFocusTrap/demo.vue) (ported to `demo.tsx` below).
  Upstream ships no tests for this function, so the browser tests are self-authored.
- reaxuse: [`packages/integrations/src/useFocusTrap.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/integrations/src/useFocusTrap.ts), docs + demo co-located in `packages/integrations/useFocusTrap/`

<Contributors name="useFocusTrap" />
