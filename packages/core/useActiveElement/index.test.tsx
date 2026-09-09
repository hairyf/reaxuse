import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { useActiveElement } from '../useActiveElement'

describe('useActiveElement', () => {
  let shadowHost: HTMLElement
  let input: HTMLInputElement
  let shadowInput: HTMLInputElement
  let shadowRoot: ShadowRoot

  beforeEach(() => {
    document.body.innerHTML = ''
    shadowHost = document.createElement('div')
    shadowRoot = shadowHost.attachShadow({ mode: 'open' })
    input = document.createElement('input')
    shadowInput = input.cloneNode() as HTMLInputElement
    shadowRoot.appendChild(shadowInput)
    document.body.appendChild(input)
    document.body.appendChild(shadowHost)
  })

  afterEach(() => {
    shadowHost.remove()
    input.remove()
  })

  it('should be defined', () => {
    expect(useActiveElement).toBeDefined()
  })

  it('should initialise correctly', async () => {
    const { result } = await renderHook(() => useActiveElement())

    expect(result.current).toBe(document.body)
  })

  it('should initialise with already-active element', async () => {
    await userEvent.fill(input, 'focus')

    const { result } = await renderHook(() => useActiveElement())

    expect(result.current).toBe(input)
  })

  it('should accept custom document', async () => {
    const { result, act } = await renderHook(() => useActiveElement({ document: shadowRoot }))

    await act(async () => {
      await userEvent.fill(shadowInput, 'focus')
    })

    expect(result.current).toBe(shadowInput)
  })

  it('should observe focus/blur events', async () => {
    const { result, act } = await renderHook(() => useActiveElement())

    await act(async () => {
      await userEvent.fill(input, 'focus')
    })

    expect(result.current).toBe(input)

    await act(async () => {
      await userEvent.click(document.body)
    })

    expect(result.current).toBe(document.body)
  })

  it('should update when activeElement is removed w/document', async () => {
    const { result, act } = await renderHook(() => useActiveElement({ triggerOnRemoval: true }))

    await act(async () => {
      await userEvent.fill(input, 'focus')
    })

    expect(result.current).toBe(input)

    await act(async () => {
      input.remove()
    })

    expect(result.current).toBe(document.body)
  })

  // upstream asserts `null` here (a Vue `ShallowRef`); the React port returns
  // `undefined` whenever `activeElement` is null (see useActiveElement.ts).
  it('should update when activeElement is removed w/shadowRoot', async () => {
    const { result, act } = await renderHook(() => useActiveElement({ triggerOnRemoval: true, document: shadowRoot }))

    await act(async () => {
      await userEvent.fill(shadowInput, 'focus')
    })

    expect(result.current).toBe(shadowInput)

    await act(async () => {
      shadowInput.remove()
    })

    expect(result.current).toBeUndefined()
  })
})
