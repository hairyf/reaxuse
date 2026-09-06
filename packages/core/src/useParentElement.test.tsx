import { expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useParentElement } from './useParentElement'

function attach(parent: Element, child: Element): () => void {
  parent.appendChild(child)
  document.body.appendChild(parent)
  return () => {
    parent.remove()
  }
}

it('useParentElement returns the parent of the given element', async () => {
  const parent = document.createElement('ul')
  const child = document.createElement('li')
  const cleanup = attach(parent, child)

  try {
    const { result } = await renderHook(() => useParentElement(child))
    expect(result.current).toBe(parent)
  }
  finally {
    cleanup()
  }
})

it('useParentElement accepts a ref-like { current } source', async () => {
  const parent = document.createElement('ul')
  const child = document.createElement('li')
  const cleanup = attach(parent, child)

  try {
    const source: { current: HTMLElement | null } = { current: child }
    const { result } = await renderHook(() => useParentElement(source))
    expect(result.current).toBe(parent)
  }
  finally {
    cleanup()
  }
})

it('useParentElement accepts a getter source', async () => {
  const parent = document.createElement('div')
  const child = document.createElement('p')
  const cleanup = attach(parent, child)

  try {
    const { result } = await renderHook(() => useParentElement(() => child))
    expect(result.current).toBe(parent)
  }
  finally {
    cleanup()
  }
})

it('useParentElement re-captures when a ref-like source points at another element', async () => {
  const parentA = document.createElement('div')
  const parentB = document.createElement('section')
  const childA = document.createElement('div')
  const childB = document.createElement('div')
  parentA.appendChild(childA)
  parentB.appendChild(childB)
  document.body.append(parentA, parentB)

  try {
    const source: { current: HTMLElement | null } = { current: childA }
    const { result, rerender } = await renderHook(() => useParentElement(source))

    expect(result.current).toBe(parentA)

    source.current = childB
    await rerender()
    expect(result.current).toBe(parentB)
  }
  finally {
    parentA.remove()
    parentB.remove()
  }
})

it('useParentElement updates when the element prop changes', async () => {
  const parentA = document.createElement('div')
  const parentB = document.createElement('section')
  const childA = document.createElement('div')
  const childB = document.createElement('div')
  parentA.appendChild(childA)
  parentB.appendChild(childB)
  document.body.append(parentA, parentB)

  try {
    const { result, rerender } = await renderHook(
      (props?: { element?: HTMLElement | null }) => useParentElement(props?.element),
      { initialProps: { element: childA as HTMLElement | null } },
    )

    expect(result.current).toBe(parentA)

    await rerender({ element: childB })
    expect(result.current).toBe(parentB)

    // upstream's `if (el)` guard: a null element keeps the previous parent
    await rerender({ element: null })
    expect(result.current).toBe(parentB)
  }
  finally {
    parentA.remove()
    parentB.remove()
  }
})

it('useParentElement returns null for a detached element', async () => {
  const orphan = document.createElement('div')
  const { result } = await renderHook(() => useParentElement(orphan))

  expect(result.current).toBe(null)
})

it('useParentElement keeps the value undefined for a null source', async () => {
  const { result } = await renderHook(() => useParentElement(null))

  expect(result.current).toBeUndefined()
})

it('useParentElement without a source stays undefined (no implicit current element in React)', async () => {
  const { result } = await renderHook(() => useParentElement())

  expect(result.current).toBeUndefined()
})

it('useParentElement supports SVG elements', async () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  const cleanup = attach(svg, circle)

  try {
    const { result } = await renderHook(() => useParentElement(circle))
    expect(result.current).toBe(svg)
  }
  finally {
    cleanup()
  }
})
