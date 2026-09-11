import { afterEach, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useImage } from '../useImage'

// Deterministic srcs — no network involved:
// - a `data:` URL (1x1 transparent gif/png) loads in chromium, firing the
//   `load` event;
// - port 1 is in chromium's restricted-port list, so the fetch fails with
//   ERR_UNSAFE_PORT and fires the `error` event without leaving the machine.
const GOOD_GIF_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
const GOOD_PNG_SRC = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
const BAD_SRC = 'http://127.0.0.1:1/reause-use-image-test.png'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('should load the image and expose the loaded state', async () => {
  const { result, act } = await renderHook(() => useImage({ src: GOOD_GIF_SRC }, { immediate: false }))

  expect(result.current.isLoaded).toBe(false)
  expect(result.current.isLoading).toBe(false)

  // start the load explicitly and read the in-flight state synchronously —
  // WebKit can resolve a `data:` URL before an immediate `renderHook` returns,
  // so the loading window is not reliably observable from a mount-time load
  let loading!: Promise<HTMLImageElement | undefined>
  void act(() => {
    loading = result.current.execute()
  })
  expect(result.current.isLoading).toBe(true)
  expect(result.current.isLoaded).toBe(false)

  await act(async () => {
    await loading
  })

  expect(result.current.isLoaded).toBe(true)
  expect(result.current.isLoading).toBe(false)
  expect(result.current.error).toBeUndefined()
  expect(result.current.url).toContain('data:image/gif')
})

it('should expose the error when the image fails to load', async () => {
  const onError = vi.fn()
  const { result } = await renderHook(() => useImage({ src: BAD_SRC }, { onError }))

  await vi.waitFor(() => {
    expect(result.current.error).toBeTruthy()
  })

  expect(result.current.isLoading).toBe(false)
  expect(result.current.isLoaded).toBe(false)
  expect(result.current.url).toBeNull()
  expect(onError).toHaveBeenCalledTimes(1)
})

it('should support manual execution', async () => {
  const { result, act } = await renderHook(() => useImage({ src: GOOD_GIF_SRC }, { immediate: false }))

  expect(result.current.isLoaded).toBe(false)
  expect(result.current.isLoading).toBe(false)

  let loaded: HTMLImageElement | undefined
  await act(async () => {
    loaded = await result.current.execute()
  })

  expect(loaded).toBeInstanceOf(HTMLImageElement)
  expect(result.current.isLoaded).toBe(true)
  expect(result.current.isLoading).toBe(false)
  expect(result.current.url).toContain('data:image/gif')
})

it('should pass the image attributes to the created element', async () => {
  // `loading` is intentionally omitted — a `lazy` image only loads near the
  // viewport, so an unattached test image would never fire `onload`
  const { result } = await renderHook(() => useImage({
    src: GOOD_PNG_SRC,
    alt: 'alt text',
    width: 300,
    height: 200,
    crossorigin: 'anonymous',
  }))

  await vi.waitFor(() => {
    expect(result.current.isLoaded).toBe(true)
  })

  // `url` is the element's `currentSrc` — the actually loaded resource
  expect(result.current.url).toContain('data:image/png')
})

it('should reload when the image options change', async () => {
  const onSuccess = vi.fn()
  const { result, rerender } = await renderHook(
    (props?: { src: string }) => useImage({ src: props?.src ?? GOOD_GIF_SRC }, { onSuccess }),
    { initialProps: { src: GOOD_GIF_SRC } },
  )

  await vi.waitFor(() => {
    expect(result.current.isLoaded).toBe(true)
  })
  expect(onSuccess).toHaveBeenCalledTimes(1)

  await rerender({ src: GOOD_PNG_SRC })

  await vi.waitFor(() => {
    expect(onSuccess).toHaveBeenCalledTimes(2)
  })
  expect(result.current.url).toContain('data:image/png')
})

it('should not touch Image during render (SSR-safe)', async () => {
  // A server render has no `Image` constructor — the load is deferred to a
  // mount effect, so rendering must succeed without ever touching it.
  vi.stubGlobal('Image', undefined)

  const { result } = await renderHook(() => useImage({ src: GOOD_GIF_SRC }, { immediate: false }))

  expect(result.current.isLoaded).toBe(false)
  expect(result.current.isLoading).toBe(false)
  expect(result.current.error).toBeUndefined()
  expect(result.current.url).toBeNull()
})

it('should wait for the configured delay before starting the load', async () => {
  const { result } = await renderHook(() => useImage({ src: GOOD_GIF_SRC }, { delay: 100 }))

  // still waiting out the delay — nothing loaded yet
  expect(result.current.isLoading).toBe(true)
  expect(result.current.isLoaded).toBe(false)

  await vi.waitFor(() => {
    expect(result.current.isLoaded).toBe(true)
  })
  expect(result.current.isLoading).toBe(false)
})

it('should keep the previous url when resetOnExecute is false', async () => {
  const { result, rerender } = await renderHook(
    (props?: { src: string }) => useImage({ src: props?.src ?? GOOD_GIF_SRC }, { resetOnExecute: false }),
    { initialProps: { src: GOOD_GIF_SRC } },
  )

  await vi.waitFor(() => {
    expect(result.current.isLoaded).toBe(true)
  })
  expect(result.current.url).toContain('data:image/gif')

  // a failed reload must not clear the last good url
  await rerender({ src: BAD_SRC })

  await vi.waitFor(() => {
    expect(result.current.error).toBeTruthy()
  })
  expect(result.current.isLoaded).toBe(false)
  expect(result.current.url).toContain('data:image/gif')
})

it('should rethrow the load error when throwError is set', async () => {
  const { result, act } = await renderHook(() => useImage({ src: BAD_SRC }, { immediate: false, throwError: true }))

  await act(async () => {
    await expect(result.current.execute()).rejects.toThrow()
  })
  expect(result.current.error).toBeTruthy()
  expect(result.current.isLoaded).toBe(false)
  expect(result.current.isLoading).toBe(false)
})

it('should capture the unavailable-Image error on the server', async () => {
  // on the server `execute` cannot construct an `Image`; the failure must be
  // captured in `error` rather than surfacing as an unhandled rejection
  vi.stubGlobal('Image', undefined)

  const { result, act } = await renderHook(() => useImage({ src: GOOD_GIF_SRC }, { immediate: false }))

  await act(async () => {
    await result.current.execute()
  })
  expect(result.current.error).toBeTruthy()
  expect(result.current.isLoaded).toBe(false)
  expect(result.current.isLoading).toBe(false)
})

it('should set the alt attribute on the created image', async () => {
  // capture the element(s) useImage constructs without losing real load
  // behavior (data: urls still fire onload)
  const instances: HTMLImageElement[] = []
  class ImageStub extends window.Image {
    constructor() {
      super()
      instances.push(this)
    }
  }
  vi.stubGlobal('Image', ImageStub)

  const { result } = await renderHook(() => useImage({ src: GOOD_PNG_SRC, alt: 'alt text' }))

  await vi.waitFor(() => {
    expect(result.current.isLoaded).toBe(true)
  })

  expect(instances).toHaveLength(1)
  expect(instances[0]?.alt).toBe('alt text')
})
