---
category: '@Math'
---

# useClamp

Reactively clamp a value between two other values

## Usage

```tsx
import { useClamp } from '@reaxuse/math'
import { useState } from 'react'

const [min, setMin] = useState(0)
const [max, setMax] = useState(10)
const [value, setValue] = useClamp(0, min, max)

setValue(15) // value is 10
setValue(-5) // value is 0
```

### Writable Value

When you pass a plain number or a React ref, the returned
setter clamps on write and keeps the source in sync:

```tsx
import { useClamp } from '@reaxuse/math'

const number = { current: 0 }
const [clamped, setClamped] = useClamp(number, 0, 10)

setClamped(15) // clamped is 10, number.current is 10
setClamped(-5) // clamped is 0, number.current is 0
```

### Reactive Bounds

All arguments (value, min, max) can be plain numbers or React refs. Bounds are
re-resolved on every render, so shrinking `max` re-clamps the current value:

```tsx
import { useClamp } from '@reaxuse/math'

const value = { current: 5 }
const min = { current: 0 }
const max = { current: 10 }

const [clamped] = useClamp(value, min, max)

max.current = 3 // clamped is 3 on the next render
```

## Value Forms

`value`, `min` and `max` all accept a React `State<number>` and every form is resolved through
`toValue`:

```tsx
import { useClamp } from '@reaxuse/math'

useClamp(0, 0, 10) // plain numbers
useClamp({ current: 0 }, () => 0, { value: 10, onChange: setMax }) // ref, getter, value/onChange
useClamp([value, setValue], [min, setMin], [max, setMax]) // state tuples
```

The `[value, setter]` tuple and `{ value, onChange }` pair are the React state protocol and have no
upstream equivalent (upstream takes `MaybeRefOrGetter`).
