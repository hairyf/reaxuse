---
category: Utilities
---

# useToString

Reactively convert a ref to string

## Usage

```tsx
import { useToString } from '@reaxuse/shared'

useToString(123.345) // '123.345'
useToString('hi') // 'hi'
useToString({ foo: 'hi' }) // '[object Object]'
```
