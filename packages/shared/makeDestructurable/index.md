---
category: Utilities
---

# makeDestructurable

Make isomorphic destructurable for object and array at the same time. See [this blog](https://antfu.me/posts/destructuring-with-object-or-array/)

## Usage

```ts
import { makeDestructurable } from '@reause/shared'

const foo = { name: 'foo' }
const bar = 1024

const obj = makeDestructurable(
  { foo, bar } as const,
  [foo, bar] as const,
)

// object destructuring
const { foo: foo1, bar: bar1 } = obj
// array destructuring
const [foo2, bar2] = obj
```
