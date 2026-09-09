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
value, a React ref update, or a new state tuple / `{ value, onChange }` value) re-sync the clone on
the next render.

## Source Forms

`source` is a React `State<T>` and every form is resolved through `toValue`:

```tsx
import { useCloned } from '@reaxuse/core'

const { cloned } = useCloned(plainValue) // plain value
const { cloned } = useCloned(() => value) // getter
const { cloned } = useCloned(ref) // React ref (`{ current }`)
const { cloned } = useCloned([value, setValue]) // state tuple
const { cloned } = useCloned({ value, onChange: setValue }) // value/onChange pair
```

Every form except a plain value is treated as reactive, so `immediate: false` skips the initial sync
for them too. This is a deliberate difference from upstream `MaybeRefOrGetter<T>`
(`T | Ref<T> | (() => T)`): the `[value, setter]` tuple and `{ value, onChange }` pair are the React
state protocol and have no upstream equivalent.

## Watch Options

`deep` and `immediate` control how the clone follows the source. Both default to `true`:
`immediate: true` syncs the clone on mount, and `deep: true` re-syncs on in-place mutations of the
source (set `deep: false` to only re-sync when the source reference is replaced).

```tsx
import { useCloned } from '@reaxuse/core'

const original = { current: { key: 'value' } }

// no initial sync, and in-place mutations are ignored
const { cloned } = useCloned(original, { immediate: false, deep: false })

console.log(cloned) // {}

original.current.key = 'ignored' // deep: false — no re-sync

original.current = { key: 'replaced' } // new reference — re-syncs on the next render

console.log(cloned) // { key: 'replaced' }
```

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
