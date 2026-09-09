---
category: Reactivity
alias: controlledRef
related: useStateHistory
---

# useStateWithControl

Fine-grained controls over a state and its re-renders

## Usage

```tsx
import { useStateWithControl } from '@reaxuse/shared'

const [num, setNum, control] = useStateWithControl(0)

// just like a normal useState pair
setNum(42)
console.log(num) // 42

// set the value without triggering a re-render (upstream: without triggering
// reactivity)
control.set(30, false)
console.log(control.peek()) // 30 — internal value updated, component not re-rendered
console.log(num) // 42 (no re-render yet — the next triggering change flushes 30)

// get the value without tracking (nothing to track in React — alias for the
// current value)
control.peek() // 30
control.get() // 30
```

### `peek`, `lay`, `untrackedGet`, `silentSet`

The untracked/silent shorthands from upstream are kept 1:1. The following lines are equivalent.

```tsx
// getting
control.get(false)
control.untrackedGet()
control.peek() // an alias for `untrackedGet`
```

```tsx
// setting
control.set('bar', false)
control.silentSet('bar')
control.lay('bar') // an alias for `silentSet`
```

### `reset`

`reset()` restores the value passed to the hook as the initial value.

```tsx
const [num, setNum, control] = useStateWithControl(0)

setNum(10)
control.reset()
console.log(num) // 0
```

## Configurations

### `onBeforeChange()`

`onBeforeChange` option is offered to give control over if a new value should be accepted. For
example:

```tsx
import { useStateWithControl } from '@reaxuse/shared'

const [num, setNum] = useStateWithControl(0, {
  onBeforeChange(value, oldValue) {
    // disallow changes larger then ±5 in one operation
    if (Math.abs(value - oldValue) > 5)
      return false // returning `false` to dismiss the change
  },
})

setNum(current => current + 1)
console.log(num) // 1

setNum(current => current + 6)
console.log(num) // 1 (change been dismissed)
```

### `onChanged()`

`onChanged` option fires synchronously after an accepted change, with less overhead compared to
an effect (upstream: `watch`):

```tsx
import { useStateWithControl } from '@reaxuse/shared'

const [num, setNum] = useStateWithControl(0, {
  onChanged(value, oldValue) {
    console.log(value)
  },
})
```
