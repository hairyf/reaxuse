---
category: '@Math'
---

# useProjection

Reactive numeric projection from one domain to another

## Usage

```tsx
import { useProjection } from '@reaxuse/math'

const input = { current: 0 }
const projected = useProjection(input, [0, 10], [0, 100])

input.current = 5 // projected === 50 on the next render
input.current = 10 // projected === 100 on the next render
```

## Value Forms

`input` accepts a React `State<number>` (resolved through `toValue`); `fromDomain` and `toDomain` stay
`RefOrValue<readonly [number, number]>` (plain tuple or React ref):

```tsx
import { useProjection } from '@reaxuse/math'

useProjection(5, [0, 10], [0, 100]) // plain input
useProjection([input, setInput], [0, 10], [0, 100]) // state tuple
useProjection({ value: input, onChange: setInput }, [0, 10], [0, 100]) // value/onChange pair
```

> **Why `fromDomain`/`toDomain` are not widened:** their value _is_ a 2-element array, which collides
> with the `State<T>` `[value, setter]` tuple form and would make the domain ambiguous with a
> controlled state pair. They therefore keep `RefOrValue<readonly [number, number]>`.
