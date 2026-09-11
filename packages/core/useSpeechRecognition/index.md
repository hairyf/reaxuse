---
category: Sensors
---

# useSpeechRecognition

Reactive [SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)

## Usage

```tsx
import { useSpeechRecognition } from '@reause/core'

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
