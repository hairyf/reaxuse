import type { Mock } from 'vitest'
import { afterEach, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useDisplayMedia } from './useDisplayMedia'

type Restore = () => void

const restores: Restore[] = []

afterEach(() => {
  restores.splice(0).forEach(restore => restore())
})

interface FakeTrack {
  kind: string
  stop: Mock
  addEventListener: Mock
  removeEventListener: Mock
  emitEnded: () => void
}

/**
 * Headless chromium has no screen-sharing prompt, so
 * `navigator.mediaDevices` is stubbed with a configurable own property
 * (`mediaDevices` normally lives on `Navigator.prototype` — dropping the own
 * property restores the native getter).
 */
function stubMediaDevices(mediaDevices: unknown): void {
  const original = navigator.mediaDevices
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: mediaDevices,
  })
  restores.push(() => {
    if (original === undefined)
      Reflect.deleteProperty(navigator, 'mediaDevices')
    else
      Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: original })
  })
}

function createFakeStream(): { stream: MediaStream, tracks: FakeTrack[] } {
  const tracks: FakeTrack[] = ['video', 'audio'].map((kind) => {
    const endedListeners = new Set<() => void>()
    return {
      kind,
      stop: vi.fn(),
      addEventListener: vi.fn((event: string, listener: () => void) => {
        if (event === 'ended')
          endedListeners.add(listener)
      }),
      removeEventListener: vi.fn((event: string, listener: () => void) => {
        if (event === 'ended')
          endedListeners.delete(listener)
      }),
      emitEnded: () => endedListeners.forEach(listener => listener()),
    }
  })
  const stream = {
    getTracks: () => tracks,
    getVideoTracks: () => tracks.filter(track => track.kind === 'video'),
    getAudioTracks: () => tracks.filter(track => track.kind === 'audio'),
  } as unknown as MediaStream
  return { stream, tracks }
}

it('reports isSupported from navigator.mediaDevices.getDisplayMedia', async () => {
  stubMediaDevices({ getDisplayMedia: vi.fn() })
  const { result } = await renderHook(() => useDisplayMedia())

  expect(result.current.isSupported).toBe(true)
})

it('reports isSupported false when mediaDevices is unavailable', async () => {
  stubMediaDevices(undefined)
  const { result } = await renderHook(() => useDisplayMedia())

  expect(result.current.isSupported).toBe(false)
})

it('reports isSupported false when getDisplayMedia is missing', async () => {
  stubMediaDevices({})
  const { result } = await renderHook(() => useDisplayMedia())

  expect(result.current.isSupported).toBe(false)
})

it('start() resolves undefined when unsupported', async () => {
  stubMediaDevices(undefined)
  const { result, act } = await renderHook(() => useDisplayMedia())

  let acquired: MediaStream | undefined
  await act(async () => {
    acquired = await result.current.start()
  })

  expect(acquired).toBeUndefined()
  expect(result.current.stream).toBeUndefined()
  expect(result.current.enabled).toBe(false)
})

it('start() acquires the stream with default constraints when no options are given', async () => {
  const { stream } = createFakeStream()
  const getDisplayMedia = vi.fn(async () => stream)
  stubMediaDevices({ getDisplayMedia })
  const { result, act } = await renderHook(() => useDisplayMedia())

  let acquired: MediaStream | undefined
  await act(async () => {
    acquired = await result.current.start()
  })

  expect(acquired).toBe(stream)
  expect(result.current.stream).toBe(stream)
  expect(getDisplayMedia).toHaveBeenCalledWith({ audio: undefined, video: undefined })
})

it('start() acquires the stream with the video and audio options', async () => {
  const { stream } = createFakeStream()
  const getDisplayMedia = vi.fn(async () => stream)
  stubMediaDevices({ getDisplayMedia })
  const { result, act } = await renderHook(() => useDisplayMedia({
    video: true,
    audio: false,
  }))

  expect(result.current.stream).toBeUndefined()
  expect(result.current.enabled).toBe(false)

  let acquired: MediaStream | undefined
  await act(async () => {
    acquired = await result.current.start()
  })

  expect(acquired).toBe(stream)
  expect(result.current.stream).toBe(stream)
  expect(result.current.enabled).toBe(true)
  expect(getDisplayMedia).toHaveBeenCalledWith({ video: true, audio: false })
})

it('start() passes MediaTrackConstraints through to getDisplayMedia', async () => {
  const { stream } = createFakeStream()
  const getDisplayMedia = vi.fn(async () => stream)
  stubMediaDevices({ getDisplayMedia })
  const { result, act } = await renderHook(() => useDisplayMedia({
    video: { width: 1280 },
    audio: false,
  }))

  await act(async () => {
    await result.current.start()
  })

  expect(getDisplayMedia).toHaveBeenCalledWith({ video: { width: 1280 }, audio: false })
})

it('start() returns the live stream without re-requesting while streaming', async () => {
  const { stream } = createFakeStream()
  const getDisplayMedia = vi.fn(async () => stream)
  stubMediaDevices({ getDisplayMedia })
  const { result, act } = await renderHook(() => useDisplayMedia())

  await act(async () => {
    await result.current.start()
  })

  let again: MediaStream | undefined
  await act(async () => {
    again = await result.current.start()
  })

  expect(again).toBe(stream)
  expect(getDisplayMedia).toHaveBeenCalledTimes(1)
})

it('stop() stops every track and clears the stream', async () => {
  const { stream, tracks } = createFakeStream()
  const getDisplayMedia = vi.fn(async () => stream)
  stubMediaDevices({ getDisplayMedia })
  const { result, act } = await renderHook(() => useDisplayMedia())

  await act(async () => {
    await result.current.start()
  })
  await act(async () => {
    result.current.stop()
  })

  expect(tracks.every(track => track.stop.mock.calls.length === 1)).toBe(true)
  expect(result.current.stream).toBeUndefined()
  expect(result.current.enabled).toBe(false)
})

it('stop() with no stream is a no-op', async () => {
  const { stream, tracks } = createFakeStream()
  const getDisplayMedia = vi.fn(async () => stream)
  stubMediaDevices({ getDisplayMedia })
  const { result, act } = await renderHook(() => useDisplayMedia())

  expect(result.current.stream).toBeUndefined()
  await act(async () => {
    result.current.stop()
  })
  expect(result.current.stream).toBeUndefined()
  expect(result.current.enabled).toBe(false)

  // Stopping twice (stream already cleared) also does nothing.
  await act(async () => {
    await result.current.start()
  })
  await act(async () => {
    result.current.stop()
  })
  expect(tracks.every(track => track.stop.mock.calls.length === 1)).toBe(true)
  await act(async () => {
    result.current.stop()
  })
  expect(result.current.stream).toBeUndefined()
  expect(tracks.every(track => track.stop.mock.calls.length === 1)).toBe(true)
})

it('start() acquires a fresh stream after stop()', async () => {
  const first = createFakeStream()
  const second = createFakeStream()
  const getDisplayMedia = vi.fn<() => Promise<MediaStream>>()
    .mockResolvedValueOnce(first.stream)
    .mockResolvedValueOnce(second.stream)
  stubMediaDevices({ getDisplayMedia })
  const { result, act } = await renderHook(() => useDisplayMedia())

  await act(async () => {
    await result.current.start()
  })
  await act(async () => {
    result.current.stop()
  })
  await act(async () => {
    await result.current.start()
  })

  expect(getDisplayMedia).toHaveBeenCalledTimes(2)
  expect(first.tracks.every(track => track.stop.mock.calls.length === 1)).toBe(true)
  expect(result.current.stream).toBe(second.stream)
  expect(result.current.enabled).toBe(true)
})

it('auto-starts on mount when the enabled option is set', async () => {
  const { stream } = createFakeStream()
  const getDisplayMedia = vi.fn(async () => stream)
  stubMediaDevices({ getDisplayMedia })
  const { result } = await renderHook(() => useDisplayMedia({
    enabled: true,
    video: true,
  }))

  await expect.poll(() => result.current.stream).toBe(stream)
  expect(result.current.enabled).toBe(true)
  expect(getDisplayMedia).toHaveBeenCalledTimes(1)
})

it('stops the stream tracks on unmount', async () => {
  const { stream, tracks } = createFakeStream()
  const getDisplayMedia = vi.fn(async () => stream)
  stubMediaDevices({ getDisplayMedia })
  const { result, act, unmount } = await renderHook(() => useDisplayMedia())

  await act(async () => {
    await result.current.start()
  })
  await unmount()

  expect(tracks.every(track => track.stop.mock.calls.length === 1)).toBe(true)
})

it('stops the stream when a track ends', async () => {
  const { stream, tracks } = createFakeStream()
  const getDisplayMedia = vi.fn(async () => stream)
  stubMediaDevices({ getDisplayMedia })
  const { result, act } = await renderHook(() => useDisplayMedia())

  await act(async () => {
    await result.current.start()
  })
  expect(result.current.stream).toBe(stream)

  await act(async () => {
    tracks[0].emitEnded()
  })

  expect(tracks.every(track => track.stop.mock.calls.length === 1)).toBe(true)
  expect(result.current.stream).toBeUndefined()
  expect(result.current.enabled).toBe(false)
})

it('propagates the getDisplayMedia rejection and keeps the state clear', async () => {
  const getDisplayMedia = vi.fn(async () => {
    throw new DOMException('Permission denied', 'NotAllowedError')
  })
  stubMediaDevices({ getDisplayMedia })
  const { result, act } = await renderHook(() => useDisplayMedia())

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

it('supports a custom navigator option', async () => {
  const { stream } = createFakeStream()
  const getDisplayMedia = vi.fn(async () => stream)
  const fakeNavigator = {
    mediaDevices: { getDisplayMedia },
  } as unknown as Navigator

  const { result, act } = await renderHook(() => useDisplayMedia({ navigator: fakeNavigator }))

  expect(result.current.isSupported).toBe(true)

  await act(async () => {
    await result.current.start()
  })

  expect(result.current.stream).toBe(stream)
  expect(getDisplayMedia).toHaveBeenCalledTimes(1)
})
