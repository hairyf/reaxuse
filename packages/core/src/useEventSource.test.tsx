import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useEventSource } from './useEventSource'

// EventSource substitute deterministically constructible in chromium: an
// EventTarget whose `onopen`/`onerror`/`onmessage` handlers and `close()`
// mirror the real API shape (mirrors upstream's MockEventSource).
class MockEventSource extends EventTarget {
  readyState: number = 0
  url: string = ''
  withCredentials: boolean = false
  readonly CONNECTING = 0 as const
  readonly OPEN = 1 as const
  readonly CLOSED = 2 as const

  constructor() {
    super()
    this.addEventListener('error', this.onerror)
    this.addEventListener('message', this.onmessage as EventListener)
    this.addEventListener('open', this.onopen)
  }

  onerror(_ev: Event) {}

  onmessage(_ev: MessageEvent) {}

  onopen(_ev: Event) {}

  close() {
    this.readyState = this.CLOSED
  }
}

describe('useEventSource', () => {
  beforeEach(() => {
    vi.stubGlobal('EventSource', MockEventSource)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('should be defined', () => {
    expect(useEventSource).toBeDefined()
  })

  it('does not connect if no url', async () => {
    const { result } = await renderHook(() => useEventSource(undefined))

    expect(result.current.status).toBe('CONNECTING')
    expect(result.current.eventSource).toBeNull()
  })

  it('sets event source when URL is defined', async () => {
    const { result } = await renderHook(() => useEventSource('https://localhost'))

    expect(result.current.eventSource).toBeDefined()
    expect(result.current.eventSource).toBeInstanceOf(MockEventSource)
  })

  it('sets status to OPEN on open', async () => {
    const { result, act } = await renderHook(() => useEventSource('https://localhost'))

    await act(() => {
      result.current.eventSource?.onopen?.(new Event('open'))
    })

    expect(result.current.status).toBe('OPEN')
  })

  it('sets status to CLOSED on error', async () => {
    const { result, act } = await renderHook(() => useEventSource('https://localhost', [], { autoReconnect: false }))

    const source = result.current.eventSource!
    const err = new Event('error')

    await act(() => {
      source.onopen!(new Event('open'))
      source.onerror!(err)
    })

    expect(result.current.status).toBe('CLOSED')
    expect(result.current.error).toBe(err)
  })

  it('sets data on message', async () => {
    const { result, act } = await renderHook(() => useEventSource('https://localhost'))

    const source = result.current.eventSource!

    // mock SSE API to trigger message event and onmessage callback
    await act(() => {
      source.onmessage!(new MessageEvent('message', {
        data: 'bleep',
        lastEventId: '303',
      }))
      source.dispatchEvent(new MessageEvent('message', {
        data: 'bleep',
        lastEventId: '303',
      }))
    })

    expect(result.current.data).toBe('bleep')
    expect(result.current.lastEventId).toBe('303')
  })

  it('can set non-string data', async () => {
    const { result, act } = await renderHook(() => useEventSource('https://localhost'))

    const source = result.current.eventSource!
    const eventData = { some: { complex: 'data' } }

    // mock SSE API to trigger message event and onmessage callback
    await act(() => {
      source.onmessage!(new MessageEvent('message', { data: eventData }))
      source.dispatchEvent!(new MessageEvent('message', { data: eventData }))
    })

    expect(result.current.data).toBe(eventData)
  })

  it('can set data from custom events', async () => {
    const { result, act } = await renderHook(() => useEventSource('https://localhost', [
      'custom-event',
    ]))

    const source = result.current.eventSource!

    await act(() => {
      source.dispatchEvent(new MessageEvent('custom-event', {
        data: 'bloop',
      }))
    })

    expect(result.current.event).toBe('custom-event')
    expect(result.current.data).toBe('bloop')
  })

  it('can manually open()', async () => {
    const { result, act } = await renderHook(() => useEventSource('https://localhost', [], {
      immediate: false,
    }))

    expect(result.current.eventSource).toBeNull()

    await act(() => {
      result.current.open()
    })

    expect(result.current.eventSource).toBeInstanceOf(MockEventSource)

    await act(() => {
      result.current.eventSource?.onopen?.(new Event('open'))
    })

    expect(result.current.status).toBe('OPEN')
  })

  it('can manually close()', async () => {
    const { result, act } = await renderHook(() => useEventSource('https://localhost'))

    const source = result.current.eventSource!

    await act(() => {
      source.onopen!(new Event('open'))
    })

    await act(() => {
      result.current.close()
    })

    expect(result.current.status).toBe('CLOSED')
    expect(result.current.eventSource).toBeNull()
  })

  it('should apply custom serializer function', async () => {
    const deserialize = vi.fn((data: any) => {
      return { data: data.toUpperCase() }
    })

    const { result, act } = await renderHook(() => useEventSource<any>('https://localhost', [], {
      serializer: {
        read: deserialize,
      },
    }))

    const source = result.current.eventSource!
    const testData = 'hello world'

    // mock SSE API to trigger message event and onmessage callback
    await act(() => {
      source.onmessage!(new MessageEvent('message', { data: testData }))
      source.dispatchEvent(new MessageEvent('message', { data: testData }))
    })

    expect(deserialize).toHaveBeenCalledWith(testData)
    expect(result.current.data).toEqual({ data: 'HELLO WORLD' })
  })

  it('should handle undefined data correctly', async () => {
    const deserialize = vi.fn((data: any) => data)
    const { result, act } = await renderHook(() => useEventSource('https://localhost', [], {
      serializer: {
        read: deserialize,
      },
    }))

    const source = result.current.eventSource!

    await act(() => {
      source.onmessage!(new MessageEvent('message', { data: undefined }))
    })

    expect(result.current.data).toBeNull()
  })

  it('should reconnect when the URL changes', async () => {
    const { result, rerender } = await renderHook(
      (url: string = 'https://localhost') => useEventSource(url),
      { initialProps: 'https://localhost' },
    )

    const first = result.current.eventSource
    expect(first).toBeInstanceOf(MockEventSource)

    await rerender('https://127.0.0.1')

    expect(result.current.eventSource).not.toBe(first)
    expect(result.current.status).toBe('CONNECTING')
  })

  it('should not reconnect on URL change if autoConnect is false', async () => {
    const { result, rerender } = await renderHook(
      (url: string = 'https://localhost') => useEventSource(url, [], { autoConnect: false }),
      { initialProps: 'https://localhost' },
    )

    const first = result.current.eventSource
    expect(first).toBeInstanceOf(MockEventSource)

    await rerender('https://127.0.0.1')

    expect(result.current.eventSource).toBe(first)
  })

  it('should reconnect automatically on error when autoReconnect is enabled', async () => {
    vi.useFakeTimers()

    const { result, act } = await renderHook(() => useEventSource('https://localhost', [], {
      autoReconnect: true,
    }))

    const first = result.current.eventSource!
    ;(first as MockEventSource).readyState = 2 // EventSource.CLOSED — connection lost, not reconnecting by itself

    await act(() => {
      first.onerror!(new Event('error'))
    })

    expect(result.current.status).toBe('CLOSED')
    expect(result.current.error).toBeInstanceOf(Event)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(result.current.eventSource).not.toBe(first)
    expect(result.current.status).toBe('CONNECTING')
  })
})
