---
category: Utilities
---

# useToNumber

Convert a string or number value to a number

## Usage

```tsx
import { useToNumber } from '@reause/shared'

const number = useToNumber('123')
const int = useToNumber('123.456', { method: 'parseInt' })

number // 123
int // 123
```
