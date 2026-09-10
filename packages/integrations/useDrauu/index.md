---
category: '@Integrations'
---

# useDrauu

Reactive instance for [drauu](https://github.com/antfu/drauu).

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
