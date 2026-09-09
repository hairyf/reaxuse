---
category: Browser
---

# useShare

Reactive [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)

## Usage

```tsx
import { useShare } from '@reaxuse/core'

const { share, isSupported } = useShare()

function startShare() {
  share({
    title: 'Hello',
    text: 'Hello my friend!',
    url: location.href,
  })
}
```

Reactive options need no wrapper in React — pass state directly, the hook always reads the latest
values:

```tsx
const [text, setText] = useState('foo')
const { share } = useShare({ text })

setText('bar')
share() // shares `{ text: 'bar' }`
```
