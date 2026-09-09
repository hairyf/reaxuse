import Cookie from 'universal-cookie'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { createCookies, useCookies } from '../useCookies'

/**
 * Records the argument `createCookies` hands to the `universal-cookie`
 * constructor — the contract the factory owns.
 *
 * The SSR jar itself cannot be observed from the hook in browser mode:
 * `universal-cookie`'s `get`/`getAll` call `update()` by default, which
 * re-reads `document.cookie` and discards an instance created from a request
 * header, and `useCookies` snapshots with `getAll()` during render.
 */
const cookieConstructorSpy = vi.hoisted(() => vi.fn())

vi.mock('universal-cookie', async (importOriginal) => {
  const mod = await importOriginal<{ default: typeof Cookie }>()
  const RealCookie = mod.default

  class MockedCookie extends RealCookie {
    constructor(...args: ConstructorParameters<typeof RealCookie>) {
      cookieConstructorSpy(...args)
      super(...args)
    }
  }

  return { ...mod, default: MockedCookie }
})

const cookieNames = [
  'testCookie',
  'testSetRemove',
  'testDependency',
  'testEmptyDependencies',
  'testDoNotParse',
  'testAutoUpdate',
  'testCreateCookies',
]

function clearTestCookies() {
  const cookies = new Cookie()
  for (const name of cookieNames)
    cookies.remove(name)
}

describe('useCookies', () => {
  afterEach(() => {
    clearTestCookies()
  })

  it('should get a cookie value that is already set', async () => {
    // Arrange
    const cookies = new Cookie()
    const { result } = await renderHook(() => useCookies(['testCookie']))

    // Act
    cookies.set('testCookie', 'testValue')

    // Assert
    expect(result.current.get('testCookie')).toBe('testValue')
  })

  it('should set and remove a cookie', async () => {
    // Arrange
    const { result, act } = await renderHook(() => useCookies([]))

    // Act
    await act(() => {
      result.current.set('testSetRemove', 'newValue')
    })

    // Assert
    expect(result.current.get('testSetRemove')).toBe('newValue')

    await act(() => {
      result.current.remove('testSetRemove')
    })

    // Assert
    expect(result.current.get('testSetRemove')).toBeUndefined()
  })

  it('should rerender when cookies change', async () => {
    // Arrange
    let renders = 0
    const { result, act } = await renderHook(() => {
      renders++
      return useCookies(['testDependency'])
    })
    const rendersBefore = renders

    // Act — 1. Set initial value
    await act(() => {
      result.current.set('testDependency', 'testValue')
    })

    // Assert
    expect(renders).toBeGreaterThan(rendersBefore)
    expect(result.current.get('testDependency')).toBe('testValue')

    // Act — 2. Change to a new value
    await act(() => {
      result.current.set('testDependency', 'newValue')
    })

    // Assert
    expect(result.current.get('testDependency')).toBe('newValue')
  })

  it('should not rerender when we pass an empty dependencies array', async () => {
    // Arrange
    let renders = 0
    const { result, act } = await renderHook(() => {
      renders++
      return useCookies([])
    })
    const rendersBefore = renders

    // Act
    await act(() => {
      result.current.set('testEmptyDependencies', 'testValue')
    })

    // Assert — the write is visible, but no watched cookie changed
    expect(renders).toBe(rendersBefore)
    expect(result.current.get('testEmptyDependencies')).toBe('testValue')
  })

  it('should pass doNotParse through to get/getAll', async () => {
    // Arrange
    const { result, act } = await renderHook(() => useCookies(['testDoNotParse'], { doNotParse: true }))

    // Act
    await act(() => {
      result.current.set('testDoNotParse', '123')
    })

    // Assert
    expect(result.current.get('testDoNotParse')).toBe('123')
    expect(result.current.getAll().testDoNotParse).toBe('123')
  })

  it('should start watching a newly get-ed cookie when autoUpdateDependencies is enabled', async () => {
    // Arrange
    let renders = 0
    const { result, act } = await renderHook(() => {
      renders++
      return useCookies([], { autoUpdateDependencies: true })
    })

    // Act — requesting the name adds it to the watch list
    expect(result.current.get('testAutoUpdate')).toBeUndefined()
    const rendersBefore = renders

    await act(() => {
      result.current.set('testAutoUpdate', 'testValue')
    })

    // Assert
    expect(renders).toBeGreaterThan(rendersBefore)
    expect(result.current.get('testAutoUpdate')).toBe('testValue')
  })

  it('should create a cookies instance from a request', async () => {
    // Arrange
    cookieConstructorSpy.mockClear()
    const useSsrCookies = createCookies({ headers: { cookie: 'testCreateCookies=ssrValue' } })

    // Act
    await renderHook(() => useSsrCookies(['testCreateCookies']))

    // Assert — the instance is bound to the request's cookie header
    expect(cookieConstructorSpy).toHaveBeenCalledWith('testCreateCookies=ssrValue')
  })

  it('should accept a raw cookie string in createCookies', async () => {
    // Arrange
    cookieConstructorSpy.mockClear()
    const useSsrCookies = createCookies('testCreateCookies=rawValue')

    // Act
    await renderHook(() => useSsrCookies(['testCreateCookies']))

    // Assert
    expect(cookieConstructorSpy).toHaveBeenCalledWith('testCreateCookies=rawValue')
  })

  it('should fall back to document.cookie when createCookies gets no request', async () => {
    // Arrange
    cookieConstructorSpy.mockClear()
    const useNoRequestCookies = createCookies()

    // Act
    await renderHook(() => useNoRequestCookies(['testCreateCookies']))

    // Assert
    expect(cookieConstructorSpy).toHaveBeenCalledWith(null)
  })

  it('should expose addChangeListener and removeChangeListener', async () => {
    // Arrange
    const { result } = await renderHook(() => useCookies(['testCreateCookies']))
    const listener = vi.fn()

    // Act
    result.current.addChangeListener(listener)
    await result.current.set('testCreateCookies', 'listenerValue')

    // Assert
    expect(listener).toHaveBeenCalled()

    result.current.removeChangeListener(listener)
    listener.mockClear()
    await result.current.set('testCreateCookies', 'otherValue')

    expect(listener).not.toHaveBeenCalled()
  })
})
