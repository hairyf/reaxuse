import { beforeEach, describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { useFocus } from './useFocus'

describe('useFocus', () => {
  let target: HTMLButtonElement

  beforeEach(() => {
    document.body.innerHTML = ''
    target = document.createElement('button')
    target.tabIndex = 0
    document.body.appendChild(target)
  })

  it('should be defined', () => {
    expect(useFocus).toBeDefined()
  })

  it('should initialize properly', async () => {
    const { result } = await renderHook(() => useFocus(target))

    expect(result.current.focused.value).toBeFalsy()
    expect(result.current.isFocused).toBeFalsy()
  })

  it('reflect focus state in reactive ref value', async () => {
    const { result, act } = await renderHook(() => useFocus(target))

    expect(result.current.focused.value).toBeFalsy()

    await act(() => {
      target?.focus()
    })
    expect(result.current.focused.value).toBeTruthy()
    expect(result.current.isFocused).toBeTruthy()

    await act(() => {
      target?.blur()
    })
    expect(result.current.focused.value).toBeFalsy()
    expect(result.current.isFocused).toBeFalsy()
  })

  it('reflect reactive ref `focused` state changes in DOM', async () => {
    const { result, act } = await renderHook(() => useFocus(target))

    expect(result.current.focused.value).toBeFalsy()

    await act(() => {
      result.current.focused.value = true
    })
    expect(document.activeElement).toBe(target)

    await act(() => {
      result.current.focused.value = false
    })
    expect(document.activeElement).not.toBe(target)
  })

  it('should only focus when :focus-visible matches with focusVisible=true', async () => {
    const { result, act } = await renderHook(() => useFocus(target, { focusVisible: true }))

    await act(async () => {
      await userEvent.tab()
    })
    expect(result.current.focused.value).toBeTruthy()

    await act(async () => {
      await userEvent.tab()
    })
    expect(result.current.focused.value).toBeFalsy()

    // upstream reuses the `target` variable here, but the renderHook callback
    // re-reads its closure on every re-render — reassigning `target` would
    // move the hook onto the new element. Keep the new element in its own
    // variable so the hook keeps tracking the original target.
    const extra = document.createElement('button')
    extra.tabIndex = 0
    document.body.appendChild(extra)

    await act(async () => {
      await userEvent.tab()
    })
    await act(async () => {
      await userEvent.tab()
    })

    expect(result.current.focused.value).toBeFalsy()
  })

  describe('when target is missing', () => {
    it('should initialize properly', async () => {
      const { result } = await renderHook(() => useFocus(null))

      expect(result.current.focused.value).toBeFalsy()
      expect(result.current.isFocused).toBeFalsy()
    })
  })

  describe('when initialValue=true passed in', () => {
    it('should initialize focus', async () => {
      const { result } = await renderHook(() => useFocus(target, { initialValue: true }))

      expect(document.activeElement).toBe(target)
      expect(result.current.focused.value).toBeTruthy()
      expect(result.current.isFocused).toBeTruthy()
    })
  })
})
