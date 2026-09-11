---
category: Sensors
---

# useElementRemoval

Fires when the element or any element containing it is removed from the DOM.

## Usage

```tsx
import { useElementRemoval } from '@reause/core'
import { useRef, useState } from 'react'

const btnRef = useRef<HTMLButtonElement | null>(null)
const [btnState, setBtnState] = useState(true)
const [removedCount, setRemovedCount] = useState(0)

function btnOnClick() {
  setBtnState(state => !state)
}

useElementRemoval(btnRef, () => setRemovedCount(count => count + 1))

// <button onClick={btnOnClick}>recreate me</button>
// {btnState && <button ref={btnRef} onClick={btnOnClick}>remove me</button>}
// <b>removed times: {removedCount}</b>
```

### Callback with Mutation Records

The callback receives an array of `MutationRecord` objects that triggered the removal.

```ts
import { useElementRemoval } from '@reause/core'

useElementRemoval(targetRef, (mutationRecords) => {
  console.log('Element removed', mutationRecords)
})
```

### Return Value

Returns a stop function to stop observing.

```ts
const stop = useElementRemoval(targetRef, callback)

// Later, stop observing
stop()
```
