---
category: '@Integrations'
---

# useNProgress

Reactive wrapper for [`nprogress`](https://github.com/rstacruz/nprogress)

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

`currentProgress` is the hook's **read-only value source** and takes a plain `number | null | undefined`
(upstream: `MaybeRefOrGetter`). A changed value is mirrored into the hook's internal `progress` on the
next render. Writes through `setProgress` / `start` / `done` / `remove` are **not** propagated back to
the caller (upstream's `toRef` writes through to a ref input), and an external change always wins over
an internal write.

### Customization

Just edit [nprogress.css](https://github.com/rstacruz/nprogress/blob/master/nprogress.css) to your liking. Tip: you probably only want to find and replace occurrences of #29d.

You can [configure](https://github.com/rstacruz/nprogress#configuration) it by passing an object as a second parameter. Options are applied once on mount (like upstream's setup-time `nprogress.configure(options)`); later changes are not re-applied.

```tsx
import { useNProgress } from '@reaxuse/integrations'

useNProgress(null, {
  minimum: 0.1,
  // ...
})
```

## Return Values

`useNProgress` returns the object `{ progress, setProgress, isLoading, setIsLoading, start, done, remove }`:

| Property       | Type                                                    | Description                                                                                                                                                                |
| -------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `progress`     | `number \| null \| undefined`                           | Current progress percentage (`0..1`), `null` after `remove()`, `1` after `done()` — the plain-state replacement for upstream's `progress` ref.                             |
| `setProgress`  | `Dispatch<SetStateAction<number \| null \| undefined>>` | Setter for `progress` (upstream: writing `progress.value`), accepts a plain value or a functional updater (`prev => next`); a number result is also pushed to `nprogress`. |
| `isLoading`    | `boolean`                                               | Whether the bar is currently showing (upstream: the writable `isLoading` computed) — `true` while `progress` is a number below 1.                                          |
| `setIsLoading` | `Dispatch<SetStateAction<boolean>>`                     | Starts or completes the bar (upstream: writing `isLoading.value`), accepts a plain value or a functional updater (`prev => next`).                                         |
| `start`        | `() => NProgress`                                       | Show the bar (upstream: `start`).                                                                                                                                          |
| `done`         | `(force?: boolean) => NProgress`                        | Complete the bar (upstream: `done`).                                                                                                                                       |
| `remove`       | `() => void`                                            | Reset `progress` to `null` and remove the bar from the DOM (upstream: `remove`).                                                                                           |
