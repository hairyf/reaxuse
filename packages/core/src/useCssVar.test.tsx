import type { Dispatch, SetStateAction } from 'react'
import type { UseCssVarReturn } from './useCssVar'
import { useEffect, useRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, expectTypeOf, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useCssVar } from './useCssVar'

// Mirrors upstream `source/vueuse/packages/core/useCssVar/index.test.ts`. The
// shared chromium page is reused across tests, so the documentElement inline
// style (written by the default-element / css-variable tests) is saved and
// restored around each test, and elements appended for computed-style reads
// are removed again.
let savedDocumentElementStyle = ''

const appendedNodes: HTMLElement[] = []

function appendElement(): HTMLElement {
  const el = document.createElement('div')
  appendedNodes.push(el)
  document.body.appendChild(el)
  return el
}

beforeEach(() => {
  savedDocumentElementStyle = document.documentElement.getAttribute('style') ?? ''
  appendedNodes.length = 0
})

afterEach(() => {
  if (savedDocumentElementStyle)
    document.documentElement.setAttribute('style', savedDocumentElementStyle)
  else
    document.documentElement.removeAttribute('style')
  for (const node of appendedNodes)
    node.remove()
})

describe('useCssVar', () => {
  it('should be defined', () => {
    expect(useCssVar).toBeDefined()
  })

  it('should work', async () => {
    const el = document.createElement('div')

    const color = '--color'
    const { result } = await renderHook(() => useCssVar(color, el, { initialValue: 'red' }))

    expect(result.current[0]).toBe('red')
    expect(el.style.getPropertyValue(color)).toBe('red')
  })

  it('should work with css variables', async () => {
    document.documentElement.style.setProperty('--rootColor', 'red')

    const { result } = await renderHook(() => useCssVar('--rootColor'))

    expect(result.current[0]).toBe('red')
  })

  it('should use window.document.documentElement as default element if not set', async () => {
    const { result } = await renderHook(() => useCssVar('--color', undefined, { initialValue: 'red' }))

    expect(result.current[0]).toBe('red')
    expect(window.document.documentElement.style.getPropertyValue('--color')).toBe('red')
  })

  it('should handle null and undefined', async () => {
    const el = document.createElement('div')
    const property = '--color'
    const { result, act } = await renderHook(() => useCssVar(property, el))

    expect(el.getAttribute('style')).toBeNull()
    await act(() => {
      result.current[1]('red')
    })
    expect(el.style.getPropertyValue(property)).toBe('red')
  })

  it('should work observe', async () => {
    const el = appendElement()

    try {
      const color = '--color'
      const { result } = await renderHook(() => useCssVar(color, el, { initialValue: 'red', observe: true }))

      expect(result.current[0]).toBe('red')
      expect(el.style.getPropertyValue(color)).toBe('red')

      el.style.setProperty(color, 'blue')
      await expect.poll(() => result.current[0]).toBe('blue')
      expect(el.style.getPropertyValue(color)).toBe('blue')
    }
    finally {
      el.remove()
    }
  })

  it('should work when changing color in onMounted', async () => {
    function Probe() {
      const elRef = useRef<HTMLDivElement>(null)
      const [el, setEl] = useState<HTMLDivElement | null>(null)
      const [, setColor] = useCssVar('--color', el)

      // onMounted: attach the element and change the color
      useEffect(() => {
        setEl(elRef.current)
        setColor('blue')
      }, [setColor])

      return <div ref={elRef} data-testid="probe-el" />
    }

    const screen = await render(<Probe />)
    const probeEl = screen.getByTestId('probe-el')
    const el = probeEl.query() as HTMLDivElement

    expect(el.style.getPropertyValue('--color')).toBe('blue')
  })

  it('should have existing value', async () => {
    const el = appendElement()
    el.style.setProperty('--color', 'red')

    const { result } = await renderHook(() => useCssVar('--color', el))

    expect(result.current[0]).toBe('red')
    expect(window.getComputedStyle(el).getPropertyValue('--color')).toBe('red')
    expect(el.style.getPropertyValue('--color')).toBe('red')
  })

  it('should work when changing element', async () => {
    const el1 = document.createElement('div')
    const el2 = document.createElement('div')

    const { result, rerender } = await renderHook(
      (props?: { target?: HTMLDivElement }) => useCssVar('--color', props?.target, { initialValue: 'red' }),
      { initialProps: {} },
    )

    expect(result.current[0]).toBe('red')

    await rerender({ target: el1 })
    expect(result.current[0]).toBe('red')
    expect(el1.style.getPropertyValue('--color')).toBe('red')

    await rerender({ target: el2 })
    expect(result.current[0]).toBe('red')
    expect(el2.style.getPropertyValue('--color')).toBe('red')
    // should remove the property from the old element
    expect(el1.style.getPropertyValue('--color')).toBe('')
  })

  it('should work when changing CSS variable name', async () => {
    const el = appendElement()
    el.style.setProperty('--color', 'red')
    el.style.setProperty('--color-one', 'blue')

    const { result, rerender } = await renderHook(
      (props?: { key: string }) => useCssVar(props?.key, el),
      { initialProps: { key: '--color' } },
    )

    expect(result.current[0]).toBe('red')
    expect(el.style.getPropertyValue('--color')).toBe('red')

    await rerender({ key: '--color-one' })
    expect(result.current[0]).toBe('blue')
    expect(el.style.getPropertyValue('--color-one')).toBe('blue')
    // switching the key removes the previous property from the element
    // (upstream: `old[0].style.removeProperty(old[1])`)
    expect(el.style.getPropertyValue('--color')).toBe('')

    await rerender({ key: '--color' })
    // The previous key was removed, so there is no value left to read back:
    // the variable keeps its current value (`value || variable.value ||
    // initialValue`). The jsdom-based upstream test re-reads the original
    // 'red' here (its render re-applies the static style binding), but in a
    // real browser the removed property resolves to ''.
    expect(result.current[0]).toBe('blue')
    expect(el.style.getPropertyValue('--color-one')).toBe('')
  })

  it('supports a ref-like target and re-reads on key change', async () => {
    const el = appendElement()
    el.style.setProperty('--color', 'red')
    const target = { current: el as HTMLDivElement | null }
    const key = { current: '--color' }

    const { result, rerender } = await renderHook(
      (_props?: { force: number }) => useCssVar(key, target),
      { initialProps: { force: 0 } },
    )

    expect(result.current[0]).toBe('red')

    key.current = '--color-one'
    el.style.setProperty('--color-one', 'blue')
    await rerender({ force: 1 })

    expect(result.current[0]).toBe('blue')
    expect(el.style.getPropertyValue('--color-one')).toBe('blue')
  })

  it('types: returns a writable [value, setValue] tuple', async () => {
    const { result } = await renderHook(() => useCssVar('--color'))

    expectTypeOf(result.current).toEqualTypeOf<UseCssVarReturn>()
    expectTypeOf(result.current[0]).toEqualTypeOf<string | null | undefined>()
    expectTypeOf(result.current[1]).toEqualTypeOf<Dispatch<SetStateAction<string | null | undefined>>>()
  })
})
