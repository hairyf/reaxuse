import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useSpeechSynthesis } from './useSpeechSynthesis'

class FakeSpeechSynthesisUtterance {
  text: string
  lang = ''
  voice: SpeechSynthesisVoice | null = null
  pitch = 1
  rate = 1
  volume = 1
  onstart: (() => void) | null = null
  onpause: (() => void) | null = null
  onresume: (() => void) | null = null
  onend: (() => void) | null = null
  onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null
  onboundary: ((event: SpeechSynthesisEvent) => void) | null = null

  constructor(text?: string) {
    this.text = text ?? ''
  }
}

/**
 * Headless chromium has a real `speechSynthesis` but no voices and no audio,
 * so every test runs against a fake synth whose calls are recorded. Events
 * are fired explicitly on the captured utterance to keep the tests
 * deterministic; the globals are restored after each test.
 */
function stubSpeechSynthesis() {
  const calls: string[] = []
  let spoken: FakeSpeechSynthesisUtterance | undefined

  const synth = {
    cancel: vi.fn(() => { calls.push('cancel') }),
    speak: vi.fn((utterance: FakeSpeechSynthesisUtterance) => {
      calls.push(`speak:${utterance.text}`)
      spoken = utterance
    }),
    pause: vi.fn(() => { calls.push('pause') }),
    resume: vi.fn(() => { calls.push('resume') }),
    getVoices: vi.fn((): SpeechSynthesisVoice[] => []),
  }

  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true })
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: FakeSpeechSynthesisUtterance, configurable: true })

  return {
    calls,
    spoken: () => {
      if (!spoken)
        throw new Error('no utterance was spoken')
      return spoken
    },
  }
}

const stubKeys = ['speechSynthesis', 'SpeechSynthesisUtterance'] as const
let originals: Array<[string, PropertyDescriptor | undefined]> = []

beforeEach(() => {
  originals = stubKeys.map(key => [key, Object.getOwnPropertyDescriptor(window, key)])
})

afterEach(() => {
  for (const [key, descriptor] of originals.reverse()) {
    if (descriptor)
      Object.defineProperty(window, key, descriptor)
    else
      Reflect.deleteProperty(window, key)
  }
})

function fakeVoice(name: string, lang: string): SpeechSynthesisVoice {
  return { voiceURI: name, name, lang, localService: true, default: false }
}

it('reports isSupported with the initial idle state', async () => {
  stubSpeechSynthesis()

  const { result } = await renderHook(() => useSpeechSynthesis('Hello world'))

  expect(result.current.isSupported).toBe(true)
  expect(result.current.isPlaying).toBe(false)
  expect(result.current.status).toBe('init')
  expect(result.current.utterance).toBeUndefined()
  expect(result.current.error).toBeUndefined()
})

it('reports isSupported false and no-ops speak/stop without speechSynthesis', async () => {
  const fakeWindow = {} as unknown as Window

  const { result } = await renderHook(() => useSpeechSynthesis('Hello', { window: fakeWindow }))

  expect(result.current.isSupported).toBe(false)

  expect(() => result.current.stop()).not.toThrow()
  expect(() => result.current.speak()).not.toThrow()
  expect(result.current.utterance).toBeUndefined()
})

it('speak cancels previous speech and speaks a new utterance with defaults', async () => {
  const stub = stubSpeechSynthesis()

  const { result, act } = await renderHook(() => useSpeechSynthesis('Hello world'))

  await act(() => {
    result.current.speak()
  })

  expect(stub.calls).toEqual(['cancel', 'speak:Hello world'])

  const spoken = stub.spoken()
  expect(spoken.text).toBe('Hello world')
  expect(spoken.lang).toBe('en-US')
  expect(spoken.pitch).toBe(1)
  expect(spoken.rate).toBe(1)
  expect(spoken.volume).toBe(1)
  expect(spoken.voice).toBeNull()

  expect(result.current.utterance).toBe(spoken)
})

it('speak applies the lang, pitch, rate, volume and voice options', async () => {
  const stub = stubSpeechSynthesis()
  const voice = fakeVoice('Fake Voice', 'zh-CN')

  const { result, act } = await renderHook(
    () => useSpeechSynthesis('你好', { lang: 'zh-CN', pitch: 0.5, rate: 2, volume: 0.25, voice }),
  )

  await act(() => {
    result.current.speak()
  })

  const spoken = stub.spoken()
  expect(spoken.text).toBe('你好')
  expect(spoken.lang).toBe('zh-CN')
  expect(spoken.pitch).toBe(0.5)
  expect(spoken.rate).toBe(2)
  expect(spoken.volume).toBe(0.25)
  expect(spoken.voice).toBe(voice)
})

it('speak resets status to init and replaces the utterance on repeated calls', async () => {
  const stub = stubSpeechSynthesis()

  const { result, act } = await renderHook(() => useSpeechSynthesis('Hello'))

  await act(() => {
    result.current.speak()
  })
  const first = stub.spoken()

  await act(() => {
    first.onend?.()
  })
  expect(result.current.status).toBe('end')

  await act(() => {
    result.current.speak()
  })

  expect(result.current.status).toBe('init')
  expect(result.current.isPlaying).toBe(false)
  expect(stub.spoken()).not.toBe(first)
  expect(stub.calls).toEqual(['cancel', 'speak:Hello', 'cancel', 'speak:Hello'])
})

it('utterance events drive isPlaying and status', async () => {
  const stub = stubSpeechSynthesis()

  const { result, act } = await renderHook(() => useSpeechSynthesis('Hello'))

  await act(() => {
    result.current.speak()
  })
  const spoken = stub.spoken()

  await act(() => {
    spoken.onstart?.()
  })
  expect(result.current.isPlaying).toBe(true)
  expect(result.current.status).toBe('play')

  await act(() => {
    spoken.onpause?.()
  })
  expect(result.current.isPlaying).toBe(false)
  expect(result.current.status).toBe('pause')

  await act(() => {
    spoken.onresume?.()
  })
  expect(result.current.isPlaying).toBe(true)
  expect(result.current.status).toBe('play')

  await act(() => {
    spoken.onend?.()
  })
  expect(result.current.isPlaying).toBe(false)
  expect(result.current.status).toBe('end')
})

it('onerror stores the error event', async () => {
  const stub = stubSpeechSynthesis()

  const { result, act } = await renderHook(() => useSpeechSynthesis('Hello'))

  await act(() => {
    result.current.speak()
  })

  const errorEvent = { error: 'interrupted' } as unknown as SpeechSynthesisErrorEvent
  await act(() => {
    stub.spoken().onerror?.(errorEvent)
  })

  expect(result.current.error).toBe(errorEvent)
})

it('onboundary forwards boundary events to the callback', async () => {
  const stub = stubSpeechSynthesis()
  const onBoundary = vi.fn()

  const { result, act } = await renderHook(() => useSpeechSynthesis('Hello world', { onBoundary }))

  await act(() => {
    result.current.speak()
  })

  const boundaryEvent = { charIndex: 6, charLength: 5 } as unknown as SpeechSynthesisEvent
  await act(() => {
    stub.spoken().onboundary?.(boundaryEvent)
  })

  expect(onBoundary).toHaveBeenCalledTimes(1)
  expect(onBoundary).toHaveBeenCalledWith(boundaryEvent)
})

it('stop cancels speech and clears isPlaying without touching status', async () => {
  const stub = stubSpeechSynthesis()

  const { result, act } = await renderHook(() => useSpeechSynthesis('Hello'))

  await act(() => {
    result.current.speak()
  })
  await act(() => {
    stub.spoken().onstart?.()
  })
  expect(result.current.isPlaying).toBe(true)

  const callsBeforeStop = stub.calls.length
  await act(() => {
    result.current.stop()
  })

  expect(stub.calls[callsBeforeStop]).toBe('cancel')
  expect(result.current.isPlaying).toBe(false)
  // upstream `stop` does not reset `status`
  expect(result.current.status).toBe('play')
})

it('toggle drives synth resume and pause', async () => {
  const stub = stubSpeechSynthesis()

  const { result, act } = await renderHook(() => useSpeechSynthesis('Hello'))

  await act(() => {
    result.current.toggle()
  })
  expect(result.current.isPlaying).toBe(true)
  expect(stub.calls).toEqual(['resume'])

  await act(() => {
    result.current.toggle(false)
  })
  expect(result.current.isPlaying).toBe(false)
  expect(stub.calls).toEqual(['resume', 'pause'])

  await act(() => {
    result.current.toggle(true)
  })
  expect(result.current.isPlaying).toBe(true)
  expect(stub.calls).toEqual(['resume', 'pause', 'resume'])
})

it('changing the voice option cancels current speech', async () => {
  const stub = stubSpeechSynthesis()
  const voiceA = fakeVoice('Voice A', 'en-US')
  const voiceB = fakeVoice('Voice B', 'fr-FR')

  const { result, act, rerender } = await renderHook(
    (props?: { voice?: SpeechSynthesisVoice }) => useSpeechSynthesis('Hello', { voice: props?.voice }),
    { initialProps: { voice: voiceA } },
  )

  await act(() => {
    result.current.speak()
  })
  expect(stub.calls).toEqual(['cancel', 'speak:Hello'])

  await rerender({ voice: voiceB })
  expect(stub.calls).toEqual(['cancel', 'speak:Hello', 'cancel'])
})

it('changing lang updates the spoken utterance only while not playing', async () => {
  const stub = stubSpeechSynthesis()

  const { result, act, rerender } = await renderHook(
    (props?: { lang?: string }) => useSpeechSynthesis('Hello', { lang: props?.lang }),
    { initialProps: { lang: 'en-US' } },
  )

  await act(() => {
    result.current.speak()
  })
  const spoken = stub.spoken()
  expect(spoken.lang).toBe('en-US')

  // while playing the utterance is left alone
  await act(() => {
    spoken.onstart?.()
  })
  await rerender({ lang: 'fr-FR' })
  expect(spoken.lang).toBe('en-US')

  // once ended the pending utterance follows the new lang
  await act(() => {
    spoken.onend?.()
  })
  await rerender({ lang: 'de-DE' })
  expect(spoken.lang).toBe('de-DE')
})

it('keeps speak, stop and toggle stable and picks up the latest text', async () => {
  const stub = stubSpeechSynthesis()

  const { result, act, rerender } = await renderHook(
    (props?: { text?: string }) => useSpeechSynthesis(props?.text ?? 'First'),
    { initialProps: { text: 'First' } },
  )
  const { speak, stop, toggle } = result.current

  await rerender({ text: 'Second' })
  expect(result.current.speak).toBe(speak)
  expect(result.current.stop).toBe(stop)
  expect(result.current.toggle).toBe(toggle)

  await act(() => {
    result.current.speak()
  })
  expect(stub.calls).toEqual(['cancel', 'speak:Second'])
})

it('does not cancel ongoing speech on unmount (mirrors upstream scope dispose)', async () => {
  const stub = stubSpeechSynthesis()

  const { result, act, unmount } = await renderHook(() => useSpeechSynthesis('Hello'))

  await act(() => {
    result.current.speak()
  })
  const callsAfterSpeak = stub.calls.length

  await unmount()

  expect(stub.calls.length).toBe(callsAfterSpeak)
})
