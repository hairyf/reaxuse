---
category: Sensors
---

# usePointerLock

Reactive [pointer lock](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API)

## Usage

```tsx
import { usePointerLock } from '@reaxuse/core'

const targetRef = useRef<HTMLDivElement>(null)
const { isSupported, element, triggerElement, lock, unlock } = usePointerLock()

// <div ref={targetRef} onMouseDown={lock} onMouseUp={unlock} />
// lock(targetRef) — lock a specific element or ref
// lock(event) — lock the event's currentTarget (hook-level target first, if set)
// element mirrors document.pointerLockElement while the lock is held
```
