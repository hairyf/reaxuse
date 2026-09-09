---
category: Browser
---

# usePreferredContrast

Reactive [`prefers-contrast`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast) media query

## Usage

```tsx
import { usePreferredContrast } from '@reaxuse/core'

const contrast = usePreferredContrast() // 'more' | 'less' | 'custom' | 'no-preference'
```
