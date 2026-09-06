import { expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { usePerformanceObserver } from './usePerformanceObserver'

function wait(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

it('usePerformanceObserver receives performance.mark entries', async () => {
  let entries: PerformanceEntry[] = []
  const { result } = await renderHook(() =>
    usePerformanceObserver({ entryTypes: ['mark'] }, (list: PerformanceObserverEntryList) => {
      entries = list.getEntries()
    }),
  )

  expect(result.current.isSupported).toBe(true)

  performance.mark('use-performance-observer-receives')
  await expect.poll(() => entries.length).toBeGreaterThan(0)
  expect(entries.some(entry => entry.name === 'use-performance-observer-receives')).toBe(true)
})

it('usePerformanceObserver passes buffered to observe() and delivers dispatched entries', async () => {
  // chromium replays buffered paint/resource entries but not buffered marks,
  // so the buffered pass-through is verified against a fake observer that
  // delivers a fake entry list right after observe() (like a buffered
  // platform delivery would)
  const fakeEntry = { name: 'use-performance-observer-fake', entryType: 'mark', startTime: 1, duration: 0 } as unknown as PerformanceEntry
  const fakeList = { getEntries: () => [fakeEntry] } as unknown as PerformanceObserverEntryList

  let observedInit: PerformanceObserverInit | undefined
  let disconnectCount = 0
  let entries: PerformanceEntry[] = []

  class FakePerformanceObserver {
    callback: PerformanceObserverCallback
    constructor(callback: PerformanceObserverCallback) {
      this.callback = callback
    }

    observe(init: PerformanceObserverInit) {
      observedInit = init
      this.callback(fakeList, this as unknown as PerformanceObserver)
    }

    disconnect() {
      disconnectCount += 1
    }
  }

  const original = window.PerformanceObserver
  Object.defineProperty(window, 'PerformanceObserver', { value: FakePerformanceObserver, configurable: true, writable: true })

  try {
    const { result, unmount } = await renderHook(() =>
      usePerformanceObserver(
        { entryTypes: ['mark'], buffered: true },
        (list: PerformanceObserverEntryList) => {
          entries = list.getEntries()
        },
      ),
    )

    expect(result.current.isSupported).toBe(true)
    expect(observedInit).toEqual({ entryTypes: ['mark'], buffered: true })

    await expect.poll(() => entries.length).toBe(1)
    expect(entries[0]?.name).toBe('use-performance-observer-fake')

    unmount()
    expect(disconnectCount).toBe(1)
  }
  finally {
    Object.defineProperty(window, 'PerformanceObserver', { value: original, configurable: true, writable: true })
  }
})

it('usePerformanceObserver stops receiving entries after stop()', async () => {
  let entries: PerformanceEntry[] = []
  const { result } = await renderHook(() =>
    usePerformanceObserver({ entryTypes: ['mark'] }, (list: PerformanceObserverEntryList) => {
      entries = list.getEntries()
    }),
  )

  performance.mark('use-performance-observer-before-stop')
  await expect.poll(() => entries.length).toBeGreaterThan(0)

  result.current.stop()
  const countAtStop = entries.length

  performance.mark('use-performance-observer-after-stop')
  await wait(100)

  expect(entries.length).toBe(countAtStop)
})

it('usePerformanceObserver does not start with immediate: false until start()', async () => {
  let entries: PerformanceEntry[] = []
  const { result } = await renderHook(() =>
    usePerformanceObserver(
      { entryTypes: ['mark'], immediate: false },
      (list: PerformanceObserverEntryList) => {
        entries = list.getEntries()
      },
    ),
  )

  expect(result.current.isSupported).toBe(true)

  performance.mark('use-performance-observer-immediate-false')
  await wait(100)
  expect(entries.length).toBe(0)

  result.current.start()

  performance.mark('use-performance-observer-manual-start')
  await expect.poll(() => entries.length).toBeGreaterThan(0)
})

it('usePerformanceObserver no-ops on a window without PerformanceObserver', async () => {
  const fakeWindow = {} as unknown as Window

  let entries: PerformanceEntry[] = []
  const { result, unmount } = await renderHook(() =>
    usePerformanceObserver(
      { entryTypes: ['mark'], window: fakeWindow },
      (list: PerformanceObserverEntryList) => {
        entries = list.getEntries()
      },
    ),
  )

  expect(result.current.isSupported).toBe(false)

  result.current.start()
  performance.mark('use-performance-observer-unsupported')
  await wait(100)
  expect(entries.length).toBe(0)

  unmount()
})

it('usePerformanceObserver disconnects on unmount', async () => {
  let entries: PerformanceEntry[] = []
  const { unmount } = await renderHook(() =>
    usePerformanceObserver({ entryTypes: ['mark'] }, (list: PerformanceObserverEntryList) => {
      entries = list.getEntries()
    }),
  )

  unmount()

  performance.mark('use-performance-observer-after-unmount')
  await wait(100)

  expect(entries.length).toBe(0)
})

it('usePerformanceObserver re-subscribes when the window option changes', async () => {
  const fakeWindow = {} as unknown as Window

  let entries: PerformanceEntry[] = []
  const { result, rerender } = await renderHook(
    (props?: { window?: Window | undefined }) =>
      usePerformanceObserver({ entryTypes: ['mark'], ...props }, (list: PerformanceObserverEntryList) => {
        entries = list.getEntries()
      }),
    { initialProps: {} },
  )

  expect(result.current.isSupported).toBe(true)

  performance.mark('use-performance-observer-window-first')
  await expect.poll(() => entries.length).toBeGreaterThan(0)

  await rerender({ window: fakeWindow })
  expect(result.current.isSupported).toBe(false)

  const countAtRerender = entries.length
  performance.mark('use-performance-observer-window-second')
  await wait(100)

  expect(entries.length).toBe(countAtRerender)
})

it('usePerformanceObserver keeps start and stop stable across rerenders', async () => {
  const { result, rerender } = await renderHook(() =>
    usePerformanceObserver({ entryTypes: ['mark'] }, () => {}),
  )

  const firstStart = result.current.start
  const firstStop = result.current.stop

  await rerender()

  expect(result.current.start).toBe(firstStart)
  expect(result.current.stop).toBe(firstStop)
})
