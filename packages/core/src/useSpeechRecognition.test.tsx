import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useSpeechRecognition } from './useSpeechRecognition'

interface ResultEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface ErrorEventLike extends Event {
  error: string
  message: string
}

type MockHandler<T> = ((ev: T) => void) | null

interface MockHooks {
  onresult: MockHandler<ResultEvent>
  onstart: MockHandler<Event>
  onerror: MockHandler<ErrorEventLike>
  onend: MockHandler<Event>
}

function createResultEvent(
  alternatives: Array<{ transcript: string, confidence: number }>,
  isFinal: boolean,
  resultIndex = 0,
): ResultEvent {
  const result = Object.assign([...alternatives], { isFinal }) as unknown as SpeechRecognitionResult
  const results = [result] as unknown as SpeechRecognitionResultList
  return Object.assign(new Event('result'), { resultIndex, results })
}

function createMockWindow() {
  const calls: string[] = []
  const instances: MockSpeechRecognition[] = []
  const handlers: MockHooks = {
    onresult: null,
    onstart: null,
    onerror: null,
    onend: null,
  }

  class MockSpeechRecognition {
    continuous = false
    interimResults = false
    lang = ''
    maxAlternatives = 1
    failStart = false
    failStop = false

    set onresult(fn: MockHandler<ResultEvent>) { handlers.onresult = fn }
    get onresult(): MockHandler<ResultEvent> { return handlers.onresult }

    set onstart(fn: MockHandler<Event>) { handlers.onstart = fn }
    get onstart(): MockHandler<Event> { return handlers.onstart }

    set onerror(fn: MockHandler<ErrorEventLike>) { handlers.onerror = fn }
    get onerror(): MockHandler<ErrorEventLike> { return handlers.onerror }

    set onend(fn: MockHandler<Event>) { handlers.onend = fn }
    get onend(): MockHandler<Event> { return handlers.onend }

    constructor() {
      instances.push(this)
    }

    start() {
      calls.push('start')
      if (this.failStart)
        throw new Error('InvalidStateError: recognition already started')
    }

    stop() {
      calls.push('stop')
      if (this.failStop)
        throw new Error('InvalidStateError: recognition not started')
    }

    abort() {
      calls.push('abort')
    }
  }

  return {
    window: { SpeechRecognition: MockSpeechRecognition } as unknown as Window,
    handlers,
    calls,
    instances,
  }
}

describe('useSpeechRecognition', () => {
  it('should be defined', () => {
    expect(useSpeechRecognition).toBeDefined()
  })

  it('exposes confidence with default 0', async () => {
    const { window } = createMockWindow()
    const { result } = await renderHook(() => useSpeechRecognition({ window }))

    expect(result.current.confidence).toBe(0)
  })

  it('exposes the recognition instance with empty initial state', async () => {
    const { window, instances } = createMockWindow()
    const { result } = await renderHook(() => useSpeechRecognition({ window }))

    expect(result.current.isSupported).toBe(true)
    expect(result.current.recognition).toBe(instances[0])
    expect(result.current.result).toBe('')
    expect(result.current.isListening).toBe(false)
    expect(result.current.isFinal).toBe(false)
    expect(result.current.error).toBeUndefined()
  })

  it('applies the options to the recognition instance', async () => {
    const { window, instances } = createMockWindow()
    const { result } = await renderHook(() => useSpeechRecognition({
      window,
      lang: 'fr',
      continuous: false,
      interimResults: false,
      maxAlternatives: 3,
    }))

    const recognition = instances[0]
    expect(recognition.lang).toBe('fr')
    expect(recognition.continuous).toBe(false)
    expect(recognition.interimResults).toBe(false)
    expect(recognition.maxAlternatives).toBe(3)
    expect(result.current.isSupported).toBe(true)
  })

  it('reuses one recognition instance across re-renders', async () => {
    const { window, instances } = createMockWindow()
    const { result, rerender } = await renderHook(() => useSpeechRecognition({ window }))

    await rerender()
    await rerender()

    expect(instances).toHaveLength(1)
    expect(result.current.recognition).toBe(instances[0])
  })

  it('updates result, confidence and isFinal from result events', async () => {
    const { window, handlers } = createMockWindow()
    const { result, act } = await renderHook(() => useSpeechRecognition({ window }))

    await act(() => {
      handlers.onresult!(createResultEvent([{ transcript: 'hello', confidence: 0.4 }], false))
    })
    expect(result.current.result).toBe('hello')
    expect(result.current.confidence).toBe(0.4)
    expect(result.current.isFinal).toBe(false)

    await act(() => {
      handlers.onresult!(createResultEvent([{ transcript: 'hello world', confidence: 0.85 }], true))
    })
    expect(result.current.result).toBe('hello world')
    expect(result.current.confidence).toBe(0.85)
    expect(result.current.isFinal).toBe(true)
  })

  it('clears a previous error on a new result', async () => {
    const { window, handlers } = createMockWindow()
    const { result, act } = await renderHook(() => useSpeechRecognition({ window }))

    await act(() => {
      handlers.onerror!(Object.assign(new Event('error'), { error: 'network', message: '' }))
    })
    expect(result.current.error).toBeDefined()

    await act(() => {
      handlers.onresult!(createResultEvent([{ transcript: 'hello', confidence: 0.5 }], true))
    })
    expect(result.current.error).toBeUndefined()
    expect(result.current.result).toBe('hello')
  })

  it('start() drives recognition.start() and stop() drives recognition.stop()', async () => {
    const { window, calls } = createMockWindow()
    const { result, act } = await renderHook(() => useSpeechRecognition({ window }))

    expect(result.current.isListening).toBe(false)

    await act(() => {
      result.current.start()
    })
    expect(calls).toEqual(['start'])
    expect(result.current.isListening).toBe(true)

    await act(() => {
      result.current.stop()
    })
    expect(calls).toEqual(['start', 'stop'])
    expect(result.current.isListening).toBe(false)
  })

  it('onstart resets isFinal and onend clears isListening', async () => {
    const { window, handlers } = createMockWindow()
    const { result, act } = await renderHook(() => useSpeechRecognition({ window }))

    await act(() => {
      result.current.start()
    })
    await act(() => {
      handlers.onresult!(createResultEvent([{ transcript: 'final words', confidence: 1 }], true))
    })
    expect(result.current.isFinal).toBe(true)

    await act(() => {
      handlers.onend!(new Event('end'))
    })
    expect(result.current.isListening).toBe(false)

    await act(() => {
      handlers.onstart!(new Event('start'))
    })
    expect(result.current.isListening).toBe(true)
    expect(result.current.isFinal).toBe(false)
  })

  it('re-applies a changed lang while not listening and on onend', async () => {
    const { window, instances, handlers } = createMockWindow()
    const { result, act, rerender } = await renderHook(
      (props?: { lang?: string }) => useSpeechRecognition({ window, lang: props?.lang }),
      { initialProps: { lang: 'en-US' } },
    )
    const recognition = instances[0]

    await act(() => {
      result.current.start()
    })
    // while listening the language change is deferred (upstream `watch(lang)`)
    await rerender({ lang: 'fr' })
    expect(recognition.lang).toBe('en-US')

    // onend re-applies the latest language for the next run
    await act(() => {
      handlers.onend!(new Event('end'))
    })
    expect(recognition.lang).toBe('fr')

    // idle re-renders apply the language immediately
    await rerender({ lang: 'es' })
    expect(recognition.lang).toBe('es')
  })

  it('records errors from onerror', async () => {
    const { window, handlers } = createMockWindow()
    const { result, act } = await renderHook(() => useSpeechRecognition({ window }))

    const errorEvent = Object.assign(new Event('error'), { error: 'not-allowed', message: 'permission denied' }) as ErrorEventLike
    await act(() => {
      handlers.onerror!(errorEvent)
    })

    expect(result.current.error).toBe(errorEvent)
  })

  it('records errors thrown by start/stop', async () => {
    const { window, instances } = createMockWindow()
    const { result, act } = await renderHook(() => useSpeechRecognition({ window }))
    const recognition = instances[0]

    recognition.failStart = true
    await act(() => {
      result.current.start()
    })
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toContain('InvalidStateError')

    recognition.failStart = false
    recognition.failStop = true
    await act(() => {
      result.current.stop()
    })
    expect(result.current.error?.message).toContain('InvalidStateError')
  })

  it('toggle() flips between listening states', async () => {
    const { window, calls } = createMockWindow()
    const { result, act } = await renderHook(() => useSpeechRecognition({ window }))

    await act(() => {
      result.current.toggle()
    })
    expect(result.current.isListening).toBe(true)
    expect(calls).toEqual(['start'])

    await act(() => {
      result.current.toggle()
    })
    expect(result.current.isListening).toBe(false)
    expect(calls).toEqual(['start', 'stop'])

    // an explicit value matching the current state is a no-op
    await act(() => {
      result.current.toggle(false)
    })
    expect(result.current.isListening).toBe(false)
    expect(calls).toEqual(['start', 'stop'])

    await act(() => {
      result.current.toggle(true)
    })
    expect(result.current.isListening).toBe(true)
    expect(calls).toEqual(['start', 'stop', 'start'])
  })

  it('preserves the return shape when the window is unavailable', async () => {
    const { result, act } = await renderHook(() => useSpeechRecognition({ window: null as unknown as Window }))

    expect(result.current.isSupported).toBe(false)
    expect(result.current.recognition).toBeUndefined()
    expect(result.current.confidence).toBe(0)
    expect(result.current.result).toBe('')
    expect(result.current.isListening).toBe(false)

    await act(() => {
      result.current.start()
    })
    expect(result.current.isListening).toBe(true)

    await act(() => {
      result.current.stop()
    })
    expect(result.current.isListening).toBe(false)
  })

  it('treats a window without SpeechRecognition as unsupported', async () => {
    const { result } = await renderHook(() => useSpeechRecognition({ window: {} as unknown as Window }))

    expect(result.current.isSupported).toBe(false)
    expect(result.current.recognition).toBeUndefined()
  })

  it('stops the recognition instance on unmount', async () => {
    const { window, calls } = createMockWindow()
    const { result, act, unmount } = await renderHook(() => useSpeechRecognition({ window }))

    await act(() => {
      result.current.start()
    })
    expect(calls).toEqual(['start'])

    await unmount()
    expect(calls).toEqual(['start', 'stop'])
  })
})
