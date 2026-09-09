---
category: State
---

# useMount

A mount state flag — React port of hairylib's [`useMounted`](https://github.com/hairyf/hairylib/blob/main/packages/react/src/hooks/use-mounted.ts). Returns a `boolean` that is `true` once the component has mounted.

## Usage

```tsx
import { useMount } from '@reaxuse/shared'

const mounted = useMount()

// `false` on the first render, `true` after mount
```
