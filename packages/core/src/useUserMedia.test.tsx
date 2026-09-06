import type { Mock } from 'vitest'
import { afterEach, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useUserMedia } from './useUserMedia'

type Restore = () => void

const restores: Restore[] = []

afterEach(() => {
  restores.splice(0).forEach(restore => restore())
})

/**
 * Headless chromium has no fake camera/microphone devices, so
 * `navigator.mediaDevices` is stubbed with a configurable own property
 * (`mediaDevices` normally lives on `Navigator.prototype` — dropping the
 * own property restores the native getter).
 */
function stubMediaDevices(getUserMedia: Mock | undefined): void {
  const original = navigator.mediaDevices
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: getUserMedia === undefined ? undefined : { getUserMedia },
  })
  restores.push(() => {
    if (original === undefined)
      Reflect.deleteProperty(navigator, 'mediaDevices')
    else
      Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: original })
  })
}

function createFakeStream(): { stream: MediaStream, stops: Mock[] } {
  const stops: Mock[] = []
  const tracks = ['video', 'audio'].map((kind) => {
    const stop = vi.fn()
    stops.push(stop)
    return { kind, stop }
  })
  const stream = {
    getTracks: () => tracks,
    getVideoTracks: () => tracks.filter(track => track.kind === 'video'),
    getAudioTracks: () => tracks.filter(track => track.kind === 'audio'),
  } as unknown as MediaStream
  return { stream, stops }
}

it('reports isSupported from navigator.mediaDevices.getUserMedia', async () => {
  stubMediaDevices(vi.fn())
  const { result } = await renderHook(() => useUserMedia())

  expect(result.current.isSupported).toBe(true)
})

it('reports isSupported false when mediaDevices is unavailable', async () => {
  stubMediaDevices(undefined)
  const { result } = await renderHook(() => useUserMedia())

  expect(result.current.isSupported).toBe(false)
})

it('start() resolves undefined when unsupported', async () => {
  stubMediaDevices(undefined)
  const { result, act } = await renderHook(() => useUserMedia())

  let acquired: MediaStream | undefined
  await act(async () => {
    acquired = await result.current.start()
  })

  expect(acquired).toBeUndefined()
  expect(result.current.enabled).toBe(false)
})

it('start() acquires the stream with the given constraints', async () => {
  const { stream } = createFakeStream()
  const getUserMedia = vi.fn(async () => stream)
  stubMediaDevices(getUserMedia)
  const { result, act } = await renderHook(() => useUserMedia({
    constraints: { video: true },
  }))

  expect(result.current.stream).toBeUndefined()

  let acquired: MediaStream | undefined
  await act(async () => {
    acquired = await result.current.start()
  })

  expect(acquired).toBe(stream)
  expect(result.current.stream).toBe(stream)
  expect(result.current.enabled).toBe(true)
  expect(getUserMedia).toHaveBeenCalledWith({ video: true, audio: false })
})

it('start() returns the live stream without re-requesting while streaming', async () => {
  const { stream } = createFakeStream()
  const getUserMedia = vi.fn(async () => stream)
  stubMediaDevices(getUserMedia)
  const { result, act } = await renderHook(() => useUserMedia())

  await act(async () => {
    await result.current.start()
  })

  let again: MediaStream | undefined
  await act(async () => {
    again = await result.current.start()
  })

  expect(again).toBe(stream)
  expect(getUserMedia).toHaveBeenCalledTimes(1)
})

it('stop() stops every track and clears the stream', async () => {
  const { stream, stops } = createFakeStream()
  const getUserMedia = vi.fn(async () => stream)
  stubMediaDevices(getUserMedia)
  const { result, act } = await renderHook(() => useUserMedia())

  await act(async () => {
    await result.current.start()
  })
  await act(async () => {
    result.current.stop()
  })

  expect(stops.every(stop => stop.mock.calls.length === 1)).toBe(true)
  expect(result.current.stream).toBeUndefined()
  expect(result.current.enabled).toBe(false)
})

it('start() acquires a fresh stream after stop()', async () => {
  const first = createFakeStream()
  const second = createFakeStream()
  const getUserMedia = vi.fn<() => Promise<MediaStream>>()
    .mockResolvedValueOnce(first.stream)
    .mockResolvedValueOnce(second.stream)
  stubMediaDevices(getUserMedia)
  const { result, act } = await renderHook(() => useUserMedia())

  await act(async () => {
    await result.current.start()
  })
  await act(async () => {
    result.current.stop()
  })
  await act(async () => {
    await result.current.start()
  })

  expect(getUserMedia).toHaveBeenCalledTimes(2)
  expect(first.stops.every(stop => stop.mock.calls.length === 1)).toBe(true)
  expect(result.current.stream).toBe(second.stream)
  expect(result.current.enabled).toBe(true)
})

it('restart() recreates the stream without disabling it', async () => {
  const first = createFakeStream()
  const second = createFakeStream()
  const getUserMedia = vi.fn<() => Promise<MediaStream>>()
    .mockResolvedValueOnce(first.stream)
    .mockResolvedValueOnce(second.stream)
  stubMediaDevices(getUserMedia)
  const { result, act } = await renderHook(() => useUserMedia())

  await act(async () => {
    await result.current.start()
  })
  await act(async () => {
    await result.current.restart()
  })

  expect(getUserMedia).toHaveBeenCalledTimes(2)
  expect(first.stops.every(stop => stop.mock.calls.length === 1)).toBe(true)
  expect(result.current.stream).toBe(second.stream)
  expect(result.current.enabled).toBe(true)
})

it('auto-starts on mount when the enabled option is set', async () => {
  const { stream } = createFakeStream()
  const getUserMedia = vi.fn(async () => stream)
  stubMediaDevices(getUserMedia)
  const { result } = await renderHook(() => useUserMedia({
    enabled: true,
    constraints: { video: true },
  }))

  await expect.poll(() => result.current.stream).toBe(stream)
  expect(result.current.enabled).toBe(true)
  expect(getUserMedia).toHaveBeenCalledTimes(1)
})

it('stops the stream tracks on unmount', async () => {
  const { stream, stops } = createFakeStream()
  const getUserMedia = vi.fn(async () => stream)
  stubMediaDevices(getUserMedia)
  const { result, act, unmount } = await renderHook(() => useUserMedia())

  await act(async () => {
    await result.current.start()
  })
  await unmount()

  expect(stops.every(stop => stop.mock.calls.length === 1)).toBe(true)
})

it('propagates the getUserMedia rejection and keeps the state clear', async () => {
  const getUserMedia = vi.fn(async () => {
    throw new DOMException('Permission denied', 'NotAllowedError')
  })
  stubMediaDevices(getUserMedia)
  const { result, act } = await renderHook(() => useUserMedia())

  let caught: unknown
  await act(async () => {
    try {
      await result.current.start()
    }
    catch (error) {
      caught = error
    }
  })

  expect((caught as Error).name).toBe('NotAllowedError')
  expect(result.current.stream).toBeUndefined()
  expect(result.current.enabled).toBe(false)
})

it('recreates the stream when constraints change while streaming', async () => {
  const first = createFakeStream()
  const second = createFakeStream()
  const getUserMedia = vi.fn<() => Promise<MediaStream>>()
    .mockResolvedValueOnce(first.stream)
    .mockResolvedValueOnce(second.stream)
  stubMediaDevices(getUserMedia)
  const { result, act, rerender } = await renderHook(
    (props?: { constraints?: MediaStreamConstraints }) => useUserMedia(props ?? {}),
  )

  await act(async () => {
    await result.current.start()
  })
  expect(result.current.stream).toBe(first.stream)

  await rerender({ constraints: { video: { deviceId: 'camera-2' } } })
  await expect.poll(() => result.current.stream).toBe(second.stream)

  expect(first.stops.every(stop => stop.mock.calls.length === 1)).toBe(true)
  expect(getUserMedia).toHaveBeenCalledTimes(2)
  expect(getUserMedia).toHaveBeenLastCalledWith({
    video: { deviceId: 'camera-2' },
    audio: false,
  })
})

it('keeps the stream when constraints change with autoSwitch disabled', async () => {
  const first = createFakeStream()
  const getUserMedia = vi.fn(async () => first.stream)
  stubMediaDevices(getUserMedia)
  const { result, act, rerender } = await renderHook(
    (props?: { constraints?: MediaStreamConstraints, autoSwitch?: boolean }) =>
      useUserMedia({ autoSwitch: false, ...props }),
  )

  await act(async () => {
    await result.current.start()
  })

  await rerender({ constraints: { video: { deviceId: 'camera-2' } } })
  await act(async () => {})

  expect(getUserMedia).toHaveBeenCalledTimes(1)
  expect(result.current.stream).toBe(first.stream)
  expect(first.stops.every(stop => stop.mock.calls.length === 0)).toBe(true)
})

it('supports a custom navigator option', async () => {
  const { stream } = createFakeStream()
  const getUserMedia = vi.fn(async () => stream)
  const fakeNavigator = {
    mediaDevices: { getUserMedia },
  } as unknown as Navigator

  const { result, act } = await renderHook(() => useUserMedia({ navigator: fakeNavigator }))

  expect(result.current.isSupported).toBe(true)

  await act(async () => {
    await result.current.start()
  })

  expect(result.current.stream).toBe(stream)
  expect(getUserMedia).toHaveBeenCalledTimes(1)
})
