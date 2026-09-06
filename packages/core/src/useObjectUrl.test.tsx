import { afterEach, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useObjectUrl } from './useObjectUrl'

afterEach(() => {
  vi.restoreAllMocks()
})

it('useObjectUrl creates an object URL for the given object', async () => {
  const object = new Blob(['hello'], { type: 'text/plain' })
  const { result } = await renderHook(() => useObjectUrl(object))

  expect(result.current).toMatch(/^blob:/)
})

it('useObjectUrl is undefined without an object and creates a URL once one is provided', async () => {
  const { result, rerender } = await renderHook((props?: { object?: Blob | null }) => useObjectUrl(props?.object))

  expect(result.current).toBeUndefined()

  const object = new Blob(['hello'], { type: 'text/plain' })
  await rerender({ object })

  expect(result.current).toMatch(/^blob:/)
})

it('useObjectUrl revokes the previous URL and creates a new one when the object changes', async () => {
  const revoke = vi.spyOn(URL, 'revokeObjectURL')
  const first = new Blob(['a'], { type: 'text/plain' })
  const { result, rerender } = await renderHook(
    (props?: { object?: Blob | null }) => useObjectUrl(props?.object),
    { initialProps: { object: first } },
  )

  const firstUrl = result.current
  expect(firstUrl).toMatch(/^blob:/)

  const second = new Blob(['b'], { type: 'text/plain' })
  await rerender({ object: second })

  expect(result.current).toMatch(/^blob:/)
  expect(result.current).not.toBe(firstUrl)
  expect(revoke).toHaveBeenCalledWith(firstUrl)
})

it('useObjectUrl clears the URL when the object becomes null', async () => {
  const revoke = vi.spyOn(URL, 'revokeObjectURL')
  const object = new Blob(['hello'], { type: 'text/plain' })
  const { result, rerender } = await renderHook(
    (props?: { object?: Blob | null }) => useObjectUrl(props?.object),
    { initialProps: { object: object as Blob | null } },
  )

  const url = result.current
  expect(url).toMatch(/^blob:/)

  await rerender({ object: null })

  expect(result.current).toBeUndefined()
  expect(revoke).toHaveBeenCalledWith(url)
})

it('useObjectUrl revokes the URL on unmount', async () => {
  const revoke = vi.spyOn(URL, 'revokeObjectURL')
  const object = new Blob(['hello'], { type: 'text/plain' })
  const { result, unmount } = await renderHook(() => useObjectUrl(object))

  const url = result.current
  expect(url).toMatch(/^blob:/)
  expect(revoke).not.toHaveBeenCalled()

  await unmount()

  expect(revoke).toHaveBeenCalledWith(url)
})

it('useObjectUrl stays SSR-safe during render before the mount effect', async () => {
  const object = new Blob(['hello'], { type: 'text/plain' })
  const snapshots: Array<string | undefined> = []

  function Probe() {
    const url = useObjectUrl(object)

    snapshots.push(url)

    return <div />
  }

  await render(<Probe />)

  // during render (e.g. on the server) no URL is created yet — the value is
  // only produced by the mount effect
  expect(snapshots[0]).toBeUndefined()
})

it('useObjectUrl returns undefined when the object URL API is unavailable', async () => {
  // simulate a server-like environment where `URL.createObjectURL` is missing
  const createObjectURL = URL.createObjectURL
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: undefined })

  try {
    const { result } = await renderHook(() => useObjectUrl(new Blob(['hello'], { type: 'text/plain' })))

    expect(result.current).toBeUndefined()
  }
  finally {
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL })
  }
})

it('useObjectUrl resolves a ref-like ({ current }) source on re-render', async () => {
  const source: { current: Blob | null | undefined } = { current: undefined }
  const { result, rerender } = await renderHook(() => useObjectUrl(source))

  expect(result.current).toBeUndefined()

  source.current = new Blob(['hello'], { type: 'text/plain' })
  await rerender()

  expect(result.current).toMatch(/^blob:/)
})
