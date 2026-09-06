---
category: Sensors
---

# useSpeechSynthesis

Reactive [SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) — React port of VueUse's [`useSpeechSynthesis`](https://vueuse.org/core/useSpeechSynthesis/).

> [Can I use?](https://caniuse.com/mdn-api_speechsynthesis)

**Mapping:** upstream's `isSupported` / `isPlaying` / `status` / `error` / `utterance` shallow refs become plain
React state. Upstream's `utterance` is a computed that recreates a `SpeechSynthesisUtterance` on every read —
here each `speak()` call owns that lifecycle: it cancels the previous speech, creates a fresh utterance, binds
its events in speak's own scope and stores it in state (`undefined` until the first `speak()`). `speak` /
`stop` / `toggle` are stable callbacks reading the latest `text` and options through refs; the `isPlaying`
watcher (`synth.resume()` / `synth.pause()`) and the `lang` / `voice` watchers become `useEffect`s.
`isSupported` resolves in a mount effect like `useMounted`, so SSR renders `false` first. Upstream docs list a
`voiceInfo` return member, but the upstream implementation never provides it — this port mirrors the
implementation.

## Usage

```tsx
import { useSpeechSynthesis } from '@reaxuse/core'

const {
  isSupported,
  isPlaying,
  status,
  utterance,
  error,
  stop,
  toggle,
  speak,
} = useSpeechSynthesis('Hello world')
// speak() — cancels the previous speech, then speaks with the current text/options
```

### Options

The following shows the default values of the options, they will be directly passed to
[SpeechSynthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis).

```ts
import { useSpeechSynthesis } from '@reaxuse/core'

useSpeechSynthesis('Hello world', {
  lang: 'en-US',
  pitch: 1,
  rate: 1,
  volume: 1,
})
```

<DemoContainer name="UseSpeechSynthesis" />

## Type Declarations

```ts
export type UseSpeechSynthesisStatus = 'init' | 'play' | 'pause' | 'end'

export interface UseSpeechSynthesisOptions extends ConfigurableWindow {
  lang?: string
  pitch?: number
  rate?: number
  volume?: number
  voice?: SpeechSynthesisVoice
  onBoundary?: (event: SpeechSynthesisEvent) => void
}

export interface UseSpeechSynthesisReturn {
  isSupported: boolean
  isPlaying: boolean
  status: UseSpeechSynthesisStatus
  utterance: SpeechSynthesisUtterance | undefined
  error: SpeechSynthesisErrorEvent | undefined
  stop: () => void
  toggle: (value?: boolean) => void
  speak: () => void
}

export function useSpeechSynthesis(text?: string, options?: UseSpeechSynthesisOptions): UseSpeechSynthesisReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useSpeechSynthesis/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useSpeechSynthesis/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useSpeechSynthesis/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useSpeechSynthesis.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useSpeechSynthesis.ts), docs + demo co-located in `packages/core/useSpeechSynthesis/`

<Contributors name="useSpeechSynthesis" />
