---
category: Elements
---

# useParentElement

Get parent element of the given element

## Usage

```tsx
import { useParentElement } from '@reaxuse/core'
import { useRef } from 'react'

const childRef = useRef<HTMLDivElement>(null)
const parent = useParentElement(childRef) // HTMLElement | SVGElement | null | undefined

// with a plain element
const parentOfChild = useParentElement(document.querySelector<HTMLElement>('#child'))
```
