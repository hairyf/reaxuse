---
category: Browser
---

# useNavigatorLanguage

Reactive [navigator.language](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/language)

## Usage

```tsx
import { useNavigatorLanguage } from '@reaxuse/core'

const { language, isSupported } = useNavigatorLanguage()
// `language` is a `string | undefined` state — the component re-renders on
// the window `languagechange` event
```
