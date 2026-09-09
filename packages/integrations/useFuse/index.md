---
category: '@Integrations'
---

# useFuse

Easily implement fuzzy search using a composable with [Fuse.js](https://github.com/krisk/fuse)

## Install Fuse.js as a peer dependency

### NPM

```bash
npm install fuse.js@^7
```

### Yarn

```bash
yarn add fuse.js
```

## Usage

```tsx
import { useFuse } from '@reaxuse/integrations'
import { useState } from 'react'

const data = [
  'John Smith',
  'John Doe',
  'Jane Doe',
  'Phillip Green',
  'Peter Brown',
]

const [input, setInput] = useState('Jhon D')

const { results } = useFuse(input, data)

/*
 * Results:
 *
 * { "item": "John Doe", "refIndex": 1 }
 * { "item": "John Smith", "refIndex": 0 }
 * { "item": "Jane Doe", "refIndex": 2 }
 *
 */
```

The inputs can also be ref-like objects (`{ current }`), which stay live across renders:

```tsx
const input = { current: 'Jhon D' }
const { results } = useFuse(input, data)
input.current = 'Peter'
// results is recomputed on the next render
```

Options are passed through `fuseOptions`, plus `resultLimit` and `matchAllWhenSearchEmpty`:

```tsx
import { useFuse } from '@reaxuse/integrations'
import { useMemo, useState } from 'react'

const [search, setSearch] = useState('')

// memoized so the Fuse index is not rebuilt on every render
const options = useMemo(() => ({
  fuseOptions: { keys: ['firstName', 'lastName'] },
  resultLimit: 10,
  matchAllWhenSearchEmpty: true,
}), [])

const { fuse, results } = useFuse(search, data, options)

fuse.search('john') // search the same index directly
```
