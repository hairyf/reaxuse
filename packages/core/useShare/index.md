---
category: Browser
---

# useShare

Reactive [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)

> The `share` method has to be called following a user gesture like a button click. It can't simply be called on page load for example. That's in place to help prevent abuse.

## Usage

```tsx
import { useShare } from '@reaxuse/core'

const { share, isSupported } = useShare()

function startShare() {
  share({
    title: 'Hello',
    text: 'Hello my friend!',
    url: location.href,
  })
}
```
