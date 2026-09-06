import { expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useNavigatorLanguage } from './useNavigatorLanguage'

it('should be defined', () => {
  expect(useNavigatorLanguage).toBeDefined()
})

it('should display the correct language', async () => {
  const { result } = await renderHook(() => useNavigatorLanguage())

  await expect.poll(() => result.current.isSupported).toBe(true)
  expect(result.current.language).toBe(navigator.language)
})

it('useNavigatorLanguage updates language on window languagechange events', async () => {
  Object.defineProperty(navigator, 'language', {
    value: 'zh-CN',
    configurable: true,
  })

  try {
    const { result, act } = await renderHook(() => useNavigatorLanguage())

    expect(result.current.language).toBe('zh-CN')

    await act(() => {
      Object.defineProperty(navigator, 'language', {
        value: 'ja-JP',
        configurable: true,
      })
      window.dispatchEvent(new Event('languagechange'))
    })

    await expect.poll(() => result.current.language).toBe('ja-JP')
  }
  finally {
    Reflect.deleteProperty(navigator, 'language')
  }
})

it('useNavigatorLanguage removes its listener on unmount', async () => {
  const { result, unmount } = await renderHook(() => useNavigatorLanguage())
  const initial = result.current.language
  unmount()

  Object.defineProperty(navigator, 'language', {
    value: 'xx-YY',
    configurable: true,
  })

  try {
    expect(() => {
      window.dispatchEvent(new Event('languagechange'))
    }).not.toThrow()
  }
  finally {
    Reflect.deleteProperty(navigator, 'language')
  }

  expect(result.current.language).toBe(initial)
})

it('useNavigatorLanguage supports a custom window option', async () => {
  const listeners: Record<string, Array<() => void>> = {}
  let fakeLanguage = 'de-DE'
  const fakeWindow = {
    navigator: {
      get language() {
        return fakeLanguage
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

  const { result, act, unmount } = await renderHook(() => useNavigatorLanguage({ window: fakeWindow }))

  expect(result.current.isSupported).toBe(true)
  expect(result.current.language).toBe('de-DE')

  await act(() => {
    fakeLanguage = 'fr-FR'
    listeners.languagechange.forEach(listener => listener())
  })
  expect(result.current.language).toBe('fr-FR')

  unmount()
  expect(listeners.languagechange).toEqual([])
})
