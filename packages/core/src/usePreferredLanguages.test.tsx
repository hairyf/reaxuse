import { expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { usePreferredLanguages } from './usePreferredLanguages'

it('usePreferredLanguages reflects the initial navigator.languages', async () => {
  const { result } = await renderHook(() => usePreferredLanguages())

  await expect.poll(() => result.current).toEqual(navigator.languages)
})

it('usePreferredLanguages updates on window languagechange events', async () => {
  Object.defineProperty(navigator, 'languages', {
    value: ['zh-CN', 'en'],
    configurable: true,
  })

  try {
    const { result, act } = await renderHook(() => usePreferredLanguages())

    expect(result.current).toEqual(['zh-CN', 'en'])

    await act(() => {
      Object.defineProperty(navigator, 'languages', {
        value: ['ja', 'en-US'],
        configurable: true,
      })
      window.dispatchEvent(new Event('languagechange'))
    })

    await expect.poll(() => result.current).toEqual(['ja', 'en-US'])
  }
  finally {
    Reflect.deleteProperty(navigator, 'languages')
  }
})

it('usePreferredLanguages removes its listener on unmount', async () => {
  const { result, unmount } = await renderHook(() => usePreferredLanguages())
  const initial = result.current
  unmount()

  Object.defineProperty(navigator, 'languages', {
    value: ['xx-YY'],
    configurable: true,
  })

  try {
    expect(() => {
      window.dispatchEvent(new Event('languagechange'))
    }).not.toThrow()
  }
  finally {
    Reflect.deleteProperty(navigator, 'languages')
  }

  expect(result.current).toEqual(initial)
})

it('usePreferredLanguages supports a custom window option', async () => {
  const listeners: Record<string, Array<() => void>> = {}
  let fakeLanguages: readonly string[] = ['de-DE', 'en']
  const fakeWindow = {
    navigator: {
      get languages() {
        return fakeLanguages
      },
    },
    addEventListener: (type: string, listener: () => void) => {
      if (!listeners[type])
        listeners[type] = []
      listeners[type].push(listener)
    },
    removeEventListener: (type: string, listener: () => void) => {
      const queue = listeners[type]
      if (!queue)
        return
      const index = queue.indexOf(listener)
      if (index !== -1)
        queue.splice(index, 1)
    },
  } as unknown as Window

  const { result, act, unmount } = await renderHook(() => usePreferredLanguages({ window: fakeWindow }))

  expect(result.current).toEqual(['de-DE', 'en'])

  await act(() => {
    fakeLanguages = ['fr']
    listeners.languagechange.forEach(listener => listener())
  })
  expect(result.current).toEqual(['fr'])

  unmount()
  expect(listeners.languagechange).toEqual([])
})
