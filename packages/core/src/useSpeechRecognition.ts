import type { ConfigurableWindow } from '@reaxuse/shared'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Structural subset of the Web Speech API `SpeechRecognition` interface —
 * `lib.dom` does not ship the global type yet (it only defines
 * `SpeechRecognitionResult(List)` and `SpeechRecognitionAlternative`), so
 * this mirrors upstream's local `types.ts` instead of adding ambient
 * declarations.
 */
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  grammars: unknown
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onaudioend: ((this: SpeechRecognition, ev: Event) => unknown) | null
  onaudiostart: ((this: SpeechRecognition, ev: Event) => unknown) | null
  onend: ((this: SpeechRecognition, ev: Event) => unknown) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown) | null
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null
  onsoundend: ((this: SpeechRecognition, ev: Event) => unknown) | null
  onsoundstart: ((this: SpeechRecognition, ev: Event) => unknown) | null
  onspeechend: ((this: SpeechRecognition, ev: Event) => unknown) | null
  onspeechstart: ((this: SpeechRecognition, ev: Event) => unknown) | null
  onstart: ((this: SpeechRecognition, ev: Event) => unknown) | null
  start: () => void
  stop: () => void
  abort: () => void
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string
  readonly message: string
}

interface SpeechRecognitionCtor {
  new (): SpeechRecognition
}

interface WindowWithSpeechRecognition {
  SpeechRecognition?: SpeechRecognitionCtor
  webkitSpeechRecognition?: SpeechRecognitionCtor
}

export interface UseSpeechRecognitionOptions extends ConfigurableWindow {
  /**
   * Controls whether continuous results are returned for each recognition, or only a single result.
   *
   * @default true
   */
  continuous?: boolean
  /**
   * Controls whether interim results should be returned (true) or not (false.) Interim results are results that are not yet final
   *
   * @default true
   */
  interimResults?: boolean
  /**
   * Language for SpeechRecognition
   *
   * @default 'en-US'
   */
  lang?: string
  /**
   * A number representing the maximum returned alternatives for each result.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/maxAlternatives
   * @default 1
   */
  maxAlternatives?: number
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean
  isListening: boolean
  isFinal: boolean
  /**
   * The underlying SpeechRecognition instance — created once during the
   * first render when the API is available, `undefined` otherwise.
   */
  recognition: SpeechRecognition | undefined
  result: string
  /**
   * Confidence value of the latest result, between 0 and 1.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionAlternative/confidence
   */
  confidence: number
  error: SpeechRecognitionErrorEvent | Error | undefined
  toggle: (value?: boolean) => void
  start: () => void
  stop: () => void
}

function getDefaultWindow(): Window | undefined {
  return typeof window === 'undefined' ? undefined : window
}

/**
 * React port of VueUse's `useSpeechRecognition`.
 *
 * Map from @vueuse/core `useSpeechRecognition`
 * (`source/vueuse/packages/core/useSpeechRecognition/`). Reactive
 * [SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
 * — drives the browser speech service and tracks the recognized transcript.
 *
 * React divergences:
 *
 * 1. The Vue refs (`isListening`, `isFinal`, `result`, `confidence`,
 *    `error`) become plain state values; `recognition` is the stable
 *    underlying instance, created during the first render when the API is
 *    available (upstream creates it eagerly in setup).
 * 2. `start()` / `stop()` / `toggle()` are stable callbacks backed by
 *    latest-value refs. Upstream drives `recognition.start()` /
 *    `recognition.stop()` from a `watch(isListening)`; here an effect does,
 *    skipping its initial run to mirror the watcher (which never fires for
 *    the initial `false`).
 * 3. `lang` is a plain option (upstream accepts a `MaybeRefOrGetter`). A
 *    changed language is re-applied while not listening, and `onend`
 *    re-applies the latest value for the next run — same as upstream's
 *    `watch(lang)` + `onend` reset.
 * 4. The unmount cleanup stops the recognition instance directly: a React
 *    state update during unmount cannot re-run effects, so upstream's
 *    `tryOnScopeDispose(stop)` is translated to a `recognition.stop()` call
 *    guarded by the same try/catch as upstream's start/stop.
 * 5. SSR-safe: without a `window` the hook reports `isSupported: false`,
 *    and `start()` / `stop()` only flip `isListening` (upstream keeps the
 *    flag writable with no recognition instance, too).
 *
 * @example
 * const {
 *   isSupported,
 *   isListening,
 *   isFinal,
 *   result,
 *   confidence,
 *   start,
 *   stop,
 * } = useSpeechRecognition({ lang: 'en-US' })
 *
 * start()
 */
export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const {
    interimResults = true,
    continuous = true,
    maxAlternatives = 1,
  } = options

  const lang = options.lang ?? 'en-US'

  // latest-value refs synced each render so every callback below is stable
  // and always reads the newest state and options
  const langRef = useRef(lang)
  const isListeningRef = useRef(false)

  const [isListening, setIsListening] = useState(false)
  const [isFinal, setIsFinal] = useState(false)
  const [result, setResult] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState<SpeechRecognitionErrorEvent | Error | undefined>(undefined)

  langRef.current = lang
  isListeningRef.current = isListening

  // the recognition instance is created once during the first render when
  // the API is available (upstream creates it eagerly in setup)
  const [recognition] = useState<SpeechRecognition | undefined>(() => {
    const win = options.window !== undefined ? options.window : getDefaultWindow()
    const SpeechRecognitionCtor = win && ((win as Window & WindowWithSpeechRecognition).SpeechRecognition
      ?? (win as Window & WindowWithSpeechRecognition).webkitSpeechRecognition)

    if (!SpeechRecognitionCtor)
      return undefined

    const instance = new SpeechRecognitionCtor()

    instance.continuous = continuous
    instance.interimResults = interimResults
    instance.lang = lang
    instance.maxAlternatives = maxAlternatives

    instance.onstart = () => {
      setIsListening(true)
      setIsFinal(false)
    }

    instance.onresult = (event) => {
      const currentResult = event.results[event.resultIndex]
      const { transcript, confidence: alternativeConfidence } = currentResult[0]

      setIsFinal(currentResult.isFinal)
      setResult(transcript)
      setConfidence(alternativeConfidence)
      setError(undefined)
    }

    instance.onerror = (event) => {
      setError(event)
    }

    instance.onend = () => {
      setIsListening(false)
      // re-apply the latest language so the next run uses it
      instance.lang = langRef.current
    }

    return instance
  })

  const isSupported = recognition !== undefined

  const start = useCallback(() => setIsListening(true), [])
  const stop = useCallback(() => setIsListening(false), [])
  const toggle = useCallback((value?: boolean) => {
    setIsListening(value ?? !isListeningRef.current)
  }, [])

  // upstream `watch(isListening)`: drive the recognition instance from the
  // flag — the previous-value ref skips the initial mount run
  const prevIsListeningRef = useRef(isListening)
  useEffect(() => {
    if (prevIsListeningRef.current === isListening)
      return
    prevIsListeningRef.current = isListening

    if (!recognition)
      return

    try {
      if (isListening)
        recognition.start()
      else
        recognition.stop()
    }
    catch (err) {
      setError(err as Error)
    }
  }, [isListening, recognition])

  // upstream `watch(lang)`: re-apply the language while not listening
  useEffect(() => {
    if (!recognition || isListeningRef.current)
      return
    recognition.lang = lang
  }, [lang, recognition])

  // upstream `tryOnScopeDispose(stop)` — a state update during unmount
  // cannot re-run effects, so the instance is stopped directly
  useEffect(() => {
    return () => {
      try {
        recognition?.stop()
      }
      catch {
        // the recognition service may already be stopped — same guard as
        // upstream's start/stop try/catch
      }
    }
  }, [recognition])

  return {
    isSupported,
    isListening,
    isFinal,
    recognition,
    result,
    confidence,
    error,
    toggle,
    start,
    stop,
  }
}
