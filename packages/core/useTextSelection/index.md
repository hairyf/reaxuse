---
category: Sensors
---

# useTextSelection

Reactively track user text selection based on [`Window.getSelection`](https://developer.mozilla.org/en-US/docs/Web/API/Window/getSelection)

## Usage

```tsx
import { useTextSelection } from '@reause/core'

const { text, rects, ranges, selection } = useTextSelection()
```
