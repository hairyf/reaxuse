---
category: Browser
---

# usePermission

Reactive [Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API) state

## Usage

```tsx
import { usePermission } from '@reause/core'

const microphoneAccess = usePermission('microphone') // 'granted' | 'denied' | 'prompt'
```
