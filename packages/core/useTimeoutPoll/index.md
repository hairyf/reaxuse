---
category: Utilities
---

# useTimeoutPoll

Use timeout to poll something — it triggers the callback after the last task is done.

## Usage

```tsx
import { useTimeoutPoll } from '@reause/core'
import { useState } from 'react'

const [count, setCount] = useState(0)

async function fetchData() {
  await new Promise(resolve => setTimeout(resolve, 1000))
  setCount(count => count + 1)
}

// Only trigger after last fetch is done
const { isActive, pause, resume } = useTimeoutPoll(fetchData, 1000)
```
