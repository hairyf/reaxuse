---
category: Sensors
---

# useSpeechRecognition

Reactive [SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) — React port of VueUse's [`useSpeechRecognition`](https://vueuse.org/core/useSpeechRecognition/).

**Mapping:** the Vue refs (`isListening` / `isFinal` / `result` / `confidence` / `error`) become plain state values, and the underlying `recognition` instance is created once during the first render when the API is available (`undefined` otherwise). `start()` / `stop()` / `toggle()` are stable callbacks — upstream's `watch(isListening)` that drives `recognition.start()` / `recognition.stop()` becomes an effect that skips its initial run, and the unmount cleanup stops the instance directly. `lang` is a plain option (upstream: `MaybeRefOrGetter`); a changed language is re-applied while not listening, and `onend` re-applies the latest value for the next run.

> [Can I use?](https://caniuse.com/mdn-api_speechrecognitionevent)

## Usage

```tsx
import { useSpeechRecognition } from '@reaxuse/core'

const {
  isSupported,
  isListening,
  isFinal,
  result,
  confidence,
  start,
  stop,
} = useSpeechRecognition()

start()
// ...
stop()
```

The `confidence` value tracks the [confidence value](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionAlternative/confidence) of the latest result, between 0 and 1.

### Options

The following shows the default values of the options, they will be directly passed to [SpeechRecognition API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition).

```tsx
useSpeechRecognition({
  lang: 'en-US',
  interimResults: true,
  continuous: true,
})
```

<DemoContainer name="UseSpeechRecognition" />

## Type Declarations

```ts
export interface UseSpeechRecognitionOptions {
  window?: Window
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
   * @default 1
   */
  maxAlternatives?: number
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean
  isListening: boolean
  isFinal: boolean
  recognition: SpeechRecognition | undefined
  result: string
  confidence: number
  error: SpeechRecognitionErrorEvent | Error | undefined
  toggle: (value?: boolean) => void
  start: () => void
  stop: () => void
}

export function useSpeechRecognition(options?: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn
```

`SpeechRecognition` and `SpeechRecognitionErrorEvent` are module-local structural types: TypeScript's `lib.dom` ships `SpeechRecognitionResult(List)` / `SpeechRecognitionAlternative` but not the `SpeechRecognition` interface itself yet, so the hook mirrors upstream's local `types.ts` instead of adding ambient declarations.

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useSpeechRecognition/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useSpeechRecognition/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useSpeechRecognition/index.browser.test.ts) (mirrored in `packages/core/src/useSpeechRecognition.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useSpeechRecognition/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useSpeechRecognition.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useSpeechRecognition.ts), docs + demo co-located in `packages/core/useSpeechRecognition/`

<Contributors name="useSpeechRecognition" />
