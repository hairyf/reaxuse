import { renderToString } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { useStartTyping } from '../useStartTyping'

describe('useStartTyping', () => {
  let element: HTMLInputElement
  let callBackFn: (event: KeyboardEvent) => void

  beforeEach(() => {
    document.body.innerHTML = ''
    element = document.createElement('input')
    element.tabIndex = 1
    callBackFn = vi.fn()
  })

  function range(size: number, startAt = 0) {
    return [...Array.from({ length: size }).keys()].map(i => i + startAt)
  }

  it('triggers callback with any letter', async () => {
    const letters = range(26, 65)

    await renderHook(() => useStartTyping(callBackFn))

    for (let i = 0; i < letters.length; i++) {
      await userEvent.keyboard(String.fromCharCode(letters[i]))
    }

    expect(callBackFn).toBeCalledTimes(letters.length)
  })

  it('triggers callback with any number', async () => {
    const numbers = range(10, 48)
    const numpadNumbers = range(10, 96)

    await renderHook(() => useStartTyping(callBackFn))

    for (let i = 0; i < numbers.length; i++) {
      await userEvent.keyboard(String.fromCharCode(numbers[i]))
    }

    for (let i = 0; i < numpadNumbers.length; i++) {
      await userEvent.keyboard(String.fromCharCode(numpadNumbers[i]))
    }

    // todo: why -1? — `String.fromCharCode(96)` is the backtick, whose key
    // (Backquote / keyCode 192) is not a valid typing char — mirrored from
    // upstream.
    expect(callBackFn).toBeCalledTimes(numbers.length + numpadNumbers.length - 1)
  })

  it('does not trigger callback while an editable element is focused', async () => {
    document.body.appendChild(element)
    element.focus()
    const letters = range(26, 65)

    await renderHook(() => useStartTyping(callBackFn))

    for (let i = 0; i < letters.length; i++) {
      await userEvent.keyboard(String.fromCharCode(letters[i]))
    }

    expect(callBackFn).toBeCalledTimes(0)
  })

  it('does not trigger callback with invalid characters', async () => {
    document.body.appendChild(element)
    const arrows = range(4, 37)
    const functionKeys = range(32, 112)

    await renderHook(() => useStartTyping(callBackFn))

    for (let i = 0; i < arrows.length; i++) {
      await userEvent.fill(element, String.fromCharCode(arrows[i]))
    }

    for (let i = 0; i < functionKeys.length; i++) {
      await userEvent.fill(element, String.fromCharCode(functionKeys[i]))
    }

    expect(callBackFn).toBeCalledTimes(0)
  })

  it('stops listening when the returned function is called', async () => {
    const { result } = await renderHook(() => useStartTyping(callBackFn))

    result.current()

    await userEvent.keyboard('a')

    expect(callBackFn).not.toBeCalled()
  })

  it('stops listening on unmount', async () => {
    const { unmount } = await renderHook(() => useStartTyping(callBackFn))

    unmount()

    await userEvent.keyboard('a')

    expect(callBackFn).not.toBeCalled()
  })

  it('calls the latest callback on re-render', async () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = await renderHook((props?: { callback: (event: KeyboardEvent) => void }) => useStartTyping(props!.callback, { isTypedCharValid: event => event.key === 'a' }), {
      initialProps: { callback: first },
    })

    await userEvent.keyboard('a')
    expect(first).toBeCalledTimes(1)

    await rerender({ callback: second })
    await userEvent.keyboard('a')
    expect(second).toBeCalledTimes(1)
  })

  it('respects a custom isTypedCharValid option', async () => {
    await renderHook(() => useStartTyping(callBackFn, {
      isTypedCharValid: event => event.key === 'a',
    }))

    await userEvent.keyboard('a')
    await userEvent.keyboard('b')

    expect(callBackFn).toBeCalledTimes(1)
  })

  it('respects a custom isFocusedElementEditable option', async () => {
    await renderHook(() => useStartTyping(callBackFn, {
      isFocusedElementEditable: () => false,
    }))

    document.body.appendChild(element)
    element.focus()

    await userEvent.keyboard('a')
    expect(callBackFn).toBeCalledTimes(1)
  })

  it('listens on a custom document option instead of the global one', async () => {
    const customDocument = document.implementation.createHTMLDocument('useStartTyping-test')

    const { result } = await renderHook(() => useStartTyping(callBackFn, { document: customDocument }))

    // the listener is bound to the custom document, not the global one
    await userEvent.keyboard('a')
    expect(callBackFn).not.toBeCalled()

    // a valid typing keydown dispatched on the custom document fires the callback
    // (keyCode is not part of the standard KeyboardEventInit dictionary, so it is
    // forced onto the event — the default `isTypedCharValid` gate relies on it)
    const keydown = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true })
    Object.defineProperty(keydown, 'keyCode', { value: 65 })
    customDocument.dispatchEvent(keydown)

    expect(callBackFn).toBeCalledTimes(1)

    // the returned stop function detaches the custom-document listener too
    result.current()
    customDocument.dispatchEvent(keydown)
    expect(callBackFn).toBeCalledTimes(1)
  })

  it('is SSR safe — the render phase never touches document and attaches no listeners', async () => {
    let stop: (() => void) | undefined

    function SSRProbe() {
      stop = useStartTyping(callBackFn)
      return <div>{typeof stop}</div>
    }

    // server render runs the render phase only (no effects): the `typeof
    // document` guard keeps the target resolution from dereferencing the DOM,
    // and the keydown listener is only registered by the client mount effect
    const html = renderToString(<SSRProbe />)

    expect(html).toContain('function')
    expect(stop).toBeTypeOf('function')
    expect(() => stop?.()).not.toThrow()
    expect(callBackFn).not.toBeCalled()
  })
})
