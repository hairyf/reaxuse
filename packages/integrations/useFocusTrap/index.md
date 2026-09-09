---
category: '@Integrations'
---

# useFocusTrap

Reactive wrapper for [`focus-trap`](https://github.com/focus-trap/focus-trap)

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
