import type { RefCallback, RefObject } from 'react'
import type { ElementTarget } from '../useResizeObserver'
import { createRef } from 'react'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { unrefElement } from '../unrefElement'

// Upstream's browser test also unwraps Vue component instances via `$el`;
// React has no component-instance analog (refs hold DOM nodes directly via
// `{ current }`), so those cases are intentionally not ported.

describe('unrefElement', () => {
  it('should be defined', () => {
    expect(unrefElement).toBeDefined()
  })

  it('return the input if it is not an element ref nor an element', () => {
    expect(unrefElement(null)).toBeNull()
    expect(unrefElement(undefined)).toBeUndefined()
  })

  it('return the element if it is an element ref', async () => {
    const targetNodeRef = createRef<HTMLDivElement>()
    await render(
      <div>
        <div>Node 1</div>
        <div ref={targetNodeRef}>Node 2</div>
        <div>Node 3</div>
      </div>,
    )

    const unrefElementReturn = unrefElement(targetNodeRef)

    expect(unrefElementReturn).toBeInstanceOf(HTMLDivElement)
    expect(unrefElementReturn!.textContent).toBe('Node 2')
  })

  it('return the element if it is an element', () => {
    const el = document.createElement('div')
    el.textContent = 'Node 2'
    expect(unrefElement(el)).toBe(el)
  })

  it('return null if the ref-like current is null', () => {
    const targetNodeRef = createRef<HTMLDivElement>()
    expect(unrefElement(targetNodeRef)).toBeNull()
  })

  it('rejects React callback refs at the type level', () => {
    // A callback ref is a function, and `toValue` *invokes* functions instead
    // of resolving them — so it must not be assignable to the accepted input.
    expectTypeOf<RefCallback<HTMLElement>>()
      .not
      .toMatchTypeOf<ElementTarget<HTMLElement>>()
    expectTypeOf<Parameters<typeof unrefElement<HTMLElement>>[0]>()
      .not
      .toMatchTypeOf<RefCallback<HTMLElement>>()
    // Positive control: a `{ current }` ref object is still accepted.
    expectTypeOf<RefObject<HTMLElement | null>>()
      .toMatchTypeOf<ElementTarget<HTMLElement>>()
  })
})
