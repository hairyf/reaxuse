---
category: Sensors
---

# useSpeechSynthesis

Reactive [SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)

## Usage

```tsx
import { useSpeechSynthesis } from '@reause/core'

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

The following shows the default values of the options, they will be directly passed to [SpeechSynthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis).

```ts
import { useSpeechSynthesis } from '@reause/core'

useSpeechSynthesis('Hello world', {
  lang: 'en-US',
  pitch: 1,
  rate: 1,
  volume: 1,
})
```
