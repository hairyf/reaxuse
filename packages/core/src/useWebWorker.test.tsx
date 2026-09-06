import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useWebWorker } from './useWebWorker'

// Upstream ships no tests for useWebWorker. These use real dedicated workers
// created from blob: URLs (chromium supports Workers from object URLs) and
// expect.poll for the async postMessage/onmessage round-trips, so no worker
// stubbing or fake timers are involved.
function createWorkerUrl(source: string) {
  return URL.createObjectURL(new Blob([source], { type: 'text/javascript' }))
}

const echoWorkerSource = 'self.onmessage = e => self.postMessage("echo:" + e.data)'

describe('useWebWorker', () => {
  it('creates a worker from a URL and exposes it after mount', async () => {
    const url = createWorkerUrl(echoWorkerSource)
    const { result } = await renderHook(() => useWebWorker(url))

    await expect.poll(() => result.current.worker).toBeInstanceOf(Worker)
    expect(result.current.data).toBeNull()
  })

  it('posts messages and stores the replied e.data payload', async () => {
    const url = createWorkerUrl(echoWorkerSource)
    const { result, act } = await renderHook(() => useWebWorker<string>(url))

    await expect.poll(() => result.current.worker).toBeInstanceOf(Worker)

    await act(() => {
      result.current.post('hello')
    })
    await expect.poll(() => result.current.data).toBe('echo:hello')

    await act(() => {
      result.current.post('second')
    })
    await expect.poll(() => result.current.data).toBe('echo:second')
  })

  it('stores structured data payloads unchanged', async () => {
    const url = createWorkerUrl('self.onmessage = e => self.postMessage({ value: e.data.value * 2 })')
    const { result, act } = await renderHook(() => useWebWorker<{ value: number }>(url))

    await expect.poll(() => result.current.worker).toBeInstanceOf(Worker)

    await act(() => {
      result.current.post({ value: 21 })
    })
    await expect.poll(() => result.current.data).toEqual({ value: 42 })
  })

  it('passes workerOptions through to the Worker constructor', async () => {
    // self.name inside the worker reflects the `name` worker option
    const url = createWorkerUrl('self.onmessage = () => self.postMessage(self.name)')
    const { result, act } = await renderHook(() => useWebWorker<string>(url, { name: 'reaxuse-echo' }))

    await expect.poll(() => result.current.worker).toBeInstanceOf(Worker)

    await act(() => {
      result.current.post('name?')
    })
    await expect.poll(() => result.current.data).toBe('reaxuse-echo')
  })

  it('leaves worker errors to the consumer via worker.onerror', async () => {
    // the hook wires no onError of its own (upstream has none) — an uncaught
    // error in the worker surfaces on the raw worker's error event
    const url = createWorkerUrl('self.onmessage = () => { throw new Error("worker boom") }')
    const { result, act } = await renderHook(() => useWebWorker(url))

    await expect.poll(() => result.current.worker).toBeInstanceOf(Worker)

    const messages: string[] = []
    const worker = result.current.worker as Worker
    worker.onerror = (event: ErrorEvent) => {
      messages.push(event.message)
    }

    await act(() => {
      result.current.post('trigger')
    })

    await expect.poll(() => messages.length > 0).toBe(true)
    expect(messages[0]).toContain('worker boom')
  })

  it('keeps post and terminate stable across re-renders', async () => {
    const url = createWorkerUrl(echoWorkerSource)
    const { result, act } = await renderHook(() => useWebWorker<string>(url))

    await expect.poll(() => result.current.worker).toBeInstanceOf(Worker)
    const post = result.current.post
    const terminate = result.current.terminate

    await act(() => {
      result.current.post('stable')
    })
    await expect.poll(() => result.current.data).toBe('echo:stable')

    expect(result.current.post).toBe(post)
    expect(result.current.terminate).toBe(terminate)
  })

  it('terminate() stops the message loop and is safe to call twice', async () => {
    const url = createWorkerUrl(echoWorkerSource)
    const { result, act } = await renderHook(() => useWebWorker<string>(url))

    await expect.poll(() => result.current.worker).toBeInstanceOf(Worker)

    await act(() => {
      result.current.terminate()
    })
    expect(() => {
      result.current.terminate()
    }).not.toThrow()

    // a terminated worker silently discards postMessage
    await act(() => {
      result.current.post('late')
    })
    await new Promise(resolve => setTimeout(resolve, 200))
    expect(result.current.data).toBeNull()
  })

  it('terminates the worker on unmount', async () => {
    const url = createWorkerUrl(echoWorkerSource)
    const { result, act, unmount } = await renderHook(() => useWebWorker<string>(url))

    await expect.poll(() => result.current.worker).toBeInstanceOf(Worker)
    await unmount()

    await act(() => {
      result.current.post('after unmount')
    })
    await new Promise(resolve => setTimeout(resolve, 200))
    expect(result.current.data).toBeNull()
  })

  it('skips worker creation when the window option is falsy (SSR guard)', async () => {
    const url = createWorkerUrl(echoWorkerSource)
    const { result, act } = await renderHook(() => useWebWorker(url, undefined, { window: null as unknown as Window }))

    await act(() => {
      result.current.post('ignored')
    })
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(result.current.worker).toBeUndefined()
    expect(result.current.data).toBeNull()
  })

  it('accepts a custom window option', async () => {
    const url = createWorkerUrl(echoWorkerSource)
    const fakeWindow = {} as unknown as Window
    const { result, act } = await renderHook(() => useWebWorker<string>(url, undefined, { window: fakeWindow }))

    await expect.poll(() => result.current.worker).toBeInstanceOf(Worker)

    await act(() => {
      result.current.post('custom window')
    })
    await expect.poll(() => result.current.data).toBe('echo:custom window')
  })

  it('accepts an existing Worker instance', async () => {
    const url = createWorkerUrl(echoWorkerSource)
    const external = new Worker(url)
    const { result, act } = await renderHook(() => useWebWorker<string>(external))

    await expect.poll(() => result.current.worker).toBe(external)

    await act(() => {
      result.current.post('direct')
    })
    await expect.poll(() => result.current.data).toBe('echo:direct')

    external.terminate()
  })

  it('accepts a worker factory function', async () => {
    const url = createWorkerUrl(echoWorkerSource)
    const { result, act } = await renderHook(() => useWebWorker<string>(() => new Worker(url)))

    await expect.poll(() => result.current.worker).toBeInstanceOf(Worker)

    await act(() => {
      result.current.post('factory')
    })
    await expect.poll(() => result.current.data).toBe('echo:factory')
  })
})
