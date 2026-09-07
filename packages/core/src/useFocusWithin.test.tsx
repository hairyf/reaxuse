import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useFocusWithin } from './useFocusWithin'

describe('useFocusWithin', () => {
  let parent: HTMLFormElement
  let child: HTMLDivElement
  let child2: HTMLDivElement
  let grandchild: HTMLInputElement

  beforeEach(() => {
    parent = document.createElement('form')
    parent.tabIndex = 0
    document.body.appendChild(parent)

    child = document.createElement('div')
    child.tabIndex = 0
    parent.appendChild(child)

    child2 = document.createElement('div')
    child2.tabIndex = 0
    parent.appendChild(child2)

    grandchild = document.createElement('input')
    grandchild.tabIndex = 0
    child.appendChild(grandchild)
  })

  afterEach(() => {
    parent.remove()
  })

  it('should be defined', () => {
    expect(useFocusWithin).toBeDefined()
  })

  it('should initialize properly', async () => {
    const { result } = await renderHook(() => useFocusWithin(parent))

    expect(result.current.focused).toBeFalsy()
  })

  it('should track the state of the target itself', async () => {
    const { result, act } = await renderHook(() => useFocusWithin(parent))

    expect(result.current.focused).toBeFalsy()

    await act(() => {
      parent.focus()
    })
    expect(result.current.focused).toBeTruthy()

    await act(() => {
      parent.blur()
    })
    expect(result.current.focused).toBeFalsy()
  })

  it('should track the state of the targets descendants', async () => {
    const { result, act } = await renderHook(() => useFocusWithin(parent))

    expect(result.current.focused).toBeFalsy()

    await act(() => {
      child.focus()
    })
    expect(result.current.focused).toBeTruthy()

    await act(() => {
      child.blur()
    })
    expect(result.current.focused).toBeFalsy()

    await act(() => {
      grandchild.focus()
    })
    expect(result.current.focused).toBeTruthy()

    await act(() => {
      grandchild.blur()
    })
    expect(result.current.focused).toBeFalsy()
  })

  it('should track the state while the descendants switch focus state', async () => {
    const { result, act } = await renderHook(() => useFocusWithin(parent))

    expect(result.current.focused).toBeFalsy()

    await act(() => {
      child.focus()
    })
    expect(result.current.focused).toBeTruthy()

    await act(() => {
      child2.focus()
    })
    expect(result.current.focused).toBeTruthy()

    await act(() => {
      child.focus()
    })
    expect(result.current.focused).toBeTruthy()

    await act(() => {
      child.blur()
    })
    expect(result.current.focused).toBeFalsy()
  })

  it('should the state of target always be falsy when document.activeElement invalid', async () => {
    const mockWindow = new Proxy(window, {
      get: (target, prop: any) => {
        if (prop === 'document')
          return { ...document, activeElement: null }

        return window[prop]
      },
    })
    const { result, act } = await renderHook(() => useFocusWithin(parent, { window: mockWindow }))

    expect(result.current.focused).toBeFalsy()

    await act(() => {
      parent.focus()
    })
    expect(result.current.focused).toBeFalsy()

    await act(() => {
      child.focus()
    })
    expect(result.current.focused).toBeFalsy()
  })
})
