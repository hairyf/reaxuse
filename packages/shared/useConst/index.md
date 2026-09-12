---
category: Utilities
---

# useConst

Return a value that is computed **once**, on the first render, and then returned unchanged — same value, same reference — on every later render.

## Usage

```tsx
import { useConst } from '@reause/shared'

const config = useConst(() => buildExpensiveConfig())
```

- The initial value is resolved only on the **first** render. A function argument is called **exactly once**, during that first render, and its result is kept — pass a function to defer an expensive initial computation until the component actually renders.
- Every subsequent render returns the very same value. For objects, arrays, and functions that means the **same identity**, which is what a naive inline computation does not give you: `const options = { retries: 3 }` (or `createClient()`) runs on every render and produces a new value each time, re-triggering effects and memo comparisons that depend on it.
- The value is **not reactive**. Changing the argument after the first render has no effect, and mutating the returned value does not re-render the component — `useConst` is a constant for the lifetime of the component instance. That is exactly what makes it safe to use as a stable dependency:

```tsx
const options = useConst({ immediate: true })

useEffect(() => connect(options), [options]) // runs once — `options` never changes
```

The value lives in a ref, so the hook is also safe under concurrent rendering and server rendering: the first (or hydrating) render computes it once.
