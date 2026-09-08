---
category: Utilities
---

# makeDestructurable

Make isomorphic destructurable for object and array at the same time — React port of VueUse's [`makeDestructurable`](https://vueuse.org/shared/makeDestructurable/). See [this blog](https://antfu.me/posts/destructuring-with-object-or-array/) for more details.

**Mapping:** this is a pure utility function (given `(obj, arr)` it returns a value that can be destructured both as an object and as an array), so it maps 1:1 from upstream with no React adaptation — same signature, same behavior.

## Usage

```ts
import { makeDestructurable } from '@reaxuse/shared'

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

<DemoContainer name="MakeDestructurable" />

## Types

```ts
export function makeDestructurable<
  T extends Record<string, unknown>,
  A extends readonly any[],
>(obj: T, arr: A): T & A
```

## Source

- VueUse: [`packages/shared/makeDestructurable`](https://github.com/vueuse/vueuse/tree/main/packages/shared/makeDestructurable) — mapped from `source/vueuse/packages/shared/makeDestructurable/index.ts`
- reaxuse: [`packages/shared/src/makeDestructurable.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/makeDestructurable.ts)

<Contributors name="makeDestructurable" />
