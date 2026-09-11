---
category: Browser
---

# usePreferredLanguages

Reactive Navigator Languages

## Usage

```tsx
import { usePreferredLanguages } from '@reause/core'

const languages = usePreferredLanguages() // readonly string[]
// e.g. ['en-US', 'en'] — re-renders on the window `languagechange` event
```
