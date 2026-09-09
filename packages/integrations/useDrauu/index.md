---
category: '@Integrations'
---

# useDrauu

Reactive instance for [drauu](https://github.com/antfu/drauu)

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

// `brush` is the current brush value; `setBrush` is its paired setter and
// updates both the returned value and the mounted instance
setBrush(prev => ({ ...prev, color: '#ef4444' }))

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
