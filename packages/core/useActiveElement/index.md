---
category: Elements
---

# useActiveElement

Reactive `document.activeElement`

## Usage

```tsx
import { useActiveElement } from '@reaxuse/core'

const activeElement = useActiveElement()

// React keyed on the element — re-runs when focus moves
useEffect(() => {
  console.log('focus changed to', activeElement)
}, [activeElement])
```

### Shadow DOM Support

By default, `useActiveElement` will traverse into shadow DOM to find the deeply active element. Set `deep: false` to disable this behavior.

```tsx
import { useActiveElement } from '@reaxuse/core'

// Only get the shadow host, not the element inside shadow DOM
const activeElement = useActiveElement({ deep: false })
```

### Track Element Removal

Set `triggerOnRemoval: true` to update the active element when the currently active element is removed from the DOM. This uses a `MutationObserver` under the hood.

```tsx
import { useActiveElement } from '@reaxuse/core'

const activeElement = useActiveElement({ triggerOnRemoval: true })
```
