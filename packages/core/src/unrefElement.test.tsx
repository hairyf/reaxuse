import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { unrefElement } from './unrefElement'

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

  it('return the resolved value of a getter', () => {
    const el = document.createElement('div')
    expect(unrefElement(() => el)).toBe(el)
    expect(unrefElement(() => null)).toBeNull()
  })

  it('return null if the ref-like current is null', () => {
    const targetNodeRef = createRef<HTMLDivElement>()
    expect(unrefElement(targetNodeRef)).toBeNull()
  })
})
