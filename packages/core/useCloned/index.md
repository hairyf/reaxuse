---
category: Utilities
---

# useCloned

Reactive clone of a value. By default, it use `JSON.parse(JSON.stringify())` to do the clone

## Usage

```tsx
import { useCloned } from '@reaxuse/core'

const original = { key: 'value' }

const { cloned } = useCloned(original)

cloned.key = 'some new value' // next render flips isModified to true

console.log(cloned.key) // 'some new value'
```

`cloned` is an editable copy — changes to it do not touch the source, and changes to the source (a new
value or a React ref update) re-sync the clone on the next render.

## Manual cloning

```tsx
import { useCloned } from '@reaxuse/core'

const original = { current: { key: 'value' } }

const { cloned, sync } = useCloned(original, { manual: true })

original.current.key = 'manual'

console.log(cloned.key) // 'value'

sync()

console.log(cloned.key) // 'manual'
```

## Custom Clone Function

Using [`klona`](https://www.npmjs.com/package/klona) for example:

```tsx
import { useCloned } from '@reaxuse/core'
import { klona } from 'klona'

const original = { key: 'value' }

const { cloned, isModified, sync } = useCloned(original, { clone: klona })
```
