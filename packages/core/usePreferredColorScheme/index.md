---
category: Browser
---

# usePreferredColorScheme

Reactive [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) media query

## Usage

```tsx
import { usePreferredColorScheme } from '@reause/core'

const colorScheme = usePreferredColorScheme() // 'dark' | 'light' | 'no-preference'
```
