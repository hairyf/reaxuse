---
category: '@Integrations'
---

# useNProgress

Reactive wrapper for [`nprogress`](https://github.com/rstacruz/nprogress).

## Install

```bash
npm i nprogress@^0
```

## Usage

```tsx
import { useNProgress } from '@reaxuse/integrations'

const { isLoading, setIsLoading } = useNProgress()

function toggle() {
  setIsLoading(!isLoading)
}
```

### Passing a progress percentage

You can pass a percentage to indicate where the bar should start from.

```tsx
import { useNProgress } from '@reaxuse/integrations'

const { progress, setProgress } = useNProgress(0.5)

function done() {
  setProgress(1.0)
}
```

> To change the progress percentage, call `setProgress(n)`, where n is a number between 0..1.

### Customization

Just edit [nprogress.css](https://github.com/rstacruz/nprogress/blob/master/nprogress.css) to your liking. Tip: you probably only want to find and replace occurrences of #29d.

You can [configure](https://github.com/rstacruz/nprogress#configuration) it by passing an object as a second parameter.

```tsx
import { useNProgress } from '@reaxuse/integrations'

useNProgress(null, {
  minimum: 0.1,
  // ...
})
```
