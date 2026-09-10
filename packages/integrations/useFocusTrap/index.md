---
category: '@Integrations'
---

# useFocusTrap

Reactive wrapper for [`focus-trap`](https://github.com/focus-trap/focus-trap).

For more information on what options can be passed, see [`createOptions`](https://github.com/focus-trap/focus-trap#createoptions) in the `focus-trap` documentation.

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

This function can't properly activate focus on elements with conditional rendering. This is because they do not exist in the DOM at the time of the focus activation. To solve this you need to activate on the next tick.

```tsx
const [show, setShow] = useState(false)
const target = useRef<HTMLDivElement>(null)
const { activate } = useFocusTrap(target, { immediate: true })

function reveal() {
  setShow(true)
  setTimeout(activate, 0)
}
```
