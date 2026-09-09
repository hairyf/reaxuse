---
category: Sensors
---

# useMagicKeys

Reactive keys pressed state, with magical keys combination support

## Usage

```tsx
import { useMagicKeys } from '@reaxuse/core'
import { useEffect } from 'react'

const { shift, space, a /* keys you want to monitor */ } = useMagicKeys()

useEffect(() => {
  if (space)
    console.log('space has been pressed')
}, [space])

useEffect(() => {
  if (shift && a)
    console.log('Shift + A have been pressed')
}, [shift, a])
```

::: tip NOTE
If you're using TypeScript with `noUncheckedIndexedAccess` enabled in your `tsconfig.json`, the destructured keys will have the type `boolean | undefined`.

The `noUncheckedIndexedAccess` TypeScript option adds `undefined` to any un-declared field accessed via index signatures. Since `useMagicKeys()` uses an index signature to allow accessing any key dynamically, TypeScript will treat destructured properties as potentially undefined for type safety.

A truthiness check narrows the value back to `boolean`:

```tsx
const { shift, space, a } = useMagicKeys()

if (space)
  console.log('space has been pressed')

if (shift && a)
  console.log('Shift + A have been pressed')
```

Check the [TypeScript documentation](https://www.typescriptlang.org/tsconfig/#noUncheckedIndexedAccess) for more details about `noUncheckedIndexedAccess`.
:::

Check out [all the possible keycodes](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values).

### Combinations

You can magically use combinations (shortcuts/hotkeys) by connecting keys with `+` or `_`.

```tsx
import { useMagicKeys } from '@reaxuse/core'

const keys = useMagicKeys()
const shiftCtrlA = keys['Shift+Ctrl+A']

useEffect(() => {
  if (shiftCtrlA)
    console.log('Shift + Ctrl + A have been pressed')
}, [shiftCtrlA])
```

```tsx
import { useMagicKeys } from '@reaxuse/core'

const { Ctrl_A_B, space, alt_s /* ... */ } = useMagicKeys()

useEffect(() => {
  if (Ctrl_A_B)
    console.log('Control+A+B have been pressed')
}, [Ctrl_A_B])
```

### Current Pressed keys

A special property `current` is provided to representing all the keys been pressed currently.

```tsx
import { useMagicKeys } from '@reaxuse/core'

const { current } = useMagicKeys()

console.log(current) // Set { 'control', 'a' }
```

### Key Aliasing

```tsx
import { useMagicKeys } from '@reaxuse/core'

const { shift_cool } = useMagicKeys({
  aliasMap: {
    cool: 'space',
  },
})

useEffect(() => {
  if (shift_cool)
    console.log('Shift + Space have been pressed')
}, [shift_cool])
```

By default, we have some preconfigured aliases for common practices (`ctrl` → `control`, `cmd` / `command` → `meta`, `option` → `alt`, `up` → `arrowup`, ...).

### Conditionally Disable

You might have some `<input />` elements in your apps, and you don't want to trigger the magic keys handling when users focused on those inputs. There is an example of using `useActiveElement` to do that.

```tsx
import { useActiveElement, useMagicKeys } from '@reaxuse/core'
import { useEffect } from 'react'

const activeElement = useActiveElement()
const notUsingInput = activeElement?.tagName !== 'INPUT'
  && activeElement?.tagName !== 'TEXTAREA'

const { tab } = useMagicKeys()

useEffect(() => {
  if (tab && notUsingInput)
    console.log('Tab has been pressed outside of inputs!')
}, [tab, notUsingInput])
```

### Custom Event Handler

```tsx
import { useMagicKeys } from '@reaxuse/core'

const { ctrl_s } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.ctrlKey && e.key === 's' && e.type === 'keydown')
      e.preventDefault()
  },
})
```

> ⚠️ This usage is NOT recommended, please use with caution.

### Reactive Mode

Upstream can return a reactive object of plain booleans with `reactive: true`. React state is always "reactive", so the option is accepted for API compatibility but has no effect — values are plain booleans either way.

```tsx
import { useMagicKeys } from '@reaxuse/core'

const keys = useMagicKeys({ reactive: true })
```
