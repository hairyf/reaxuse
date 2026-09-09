---
category: Browser
---

# usePreferredDark

Reactive [`prefers-color-scheme: dark`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) media query

## Usage

```tsx
import { usePreferredDark } from '@reaxuse/core'

const isDark = usePreferredDark() // boolean
// `true` while the user prefers a dark theme, flips live with the OS setting
```
