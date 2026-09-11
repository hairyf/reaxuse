---
category: Browser
---

# useTitle

Reactive document title.

::: warning
This hook isn't compatible with SSR.
:::

## Usage

```tsx
import { useTitle } from '@reause/core'

const [title, setTitle] = useTitle()
console.log(title) // print current title
setTitle('Hello') // change current title
```

Set initial title immediately:

```tsx
import { useTitle } from '@reause/core'
// ---cut---
const [title] = useTitle('New Title')
```

Pass a value derived from state and the title will be updated when the source state changes:

```tsx
import { useTitle } from '@reause/core'
import { useState } from 'react'

const [messages, setMessages] = useState(0)

const title = !messages ? 'No message' : `${messages} new messages`

useTitle(title) // document title will match the state "title"
```

Pass an optional template tag [Vue Meta Title Template](https://vue-meta.nuxtjs.org/guide/metainfo.html) to update the title to be injected into this template:

```tsx
import { useTitle } from '@reause/core'
// ---cut---
const [title] = useTitle('New Title', {
  titleTemplate: '%s | My Awesome Website'
})
```

::: warning
`observe` is incompatible with `titleTemplate`.
:::
