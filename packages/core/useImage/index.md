---
category: Browser
---

# useImage

Reactive load an image in the browser — React port of VueUse's
[`useImage`](https://vueuse.org/core/useImage/), you can wait the result to
display it or show a fallback.

**Mapping:** upstream composes `useAsyncState` with a deep `watch` on the
options; here the async state is implemented inline with React state and the
load is triggered from a mount `useEffect` (so rendering is SSR-safe — no
`Image` is touched while rendering). The return is the object
`{ isLoaded, error, url, isLoading, execute }` — `isLoaded` is upstream's
`isReady`, `url` the `currentSrc` of the last successfully loaded image, and
`executeImmediate` is dropped in favor of `execute(0)`. `options` is a plain
object; passing a new one reloads the image (deep-change detection keyed on
`JSON.stringify`, mirroring upstream's deep `watch`).

## Usage

```tsx
import { useImage } from '@reaxuse/core'

const avatarUrl = 'https://place.dog/300/200'
const { isLoading } = useImage({ src: avatarUrl })
```

While the image is loading you can show a fallback, and when it fails you can
render an error state:

```tsx
const { isLoading, error, url } = useImage({ src: avatarUrl })

if (isLoading)
  return <span>Loading...</span>

if (error)
  return <span>Failed to load image</span>

return <img src={url} alt="avatar" />
```

## Manual Control

Set `immediate: false` to defer the load and trigger it yourself with
`execute()`, optionally passing a delay in milliseconds:

```tsx
const { isLoading, execute } = useImage({ src: avatarUrl }, { immediate: false })

function handleClick() {
  execute()
}
```

## Component Usage

Not ported — upstream ships a `UseImage` component (Vue, render-slot based);
in React the hook is used directly.

<DemoContainer name="UseImage" />

## Type Declarations

```ts
export interface UseImageOptions {
  /** Address of the resource */
  src: string
  /** Images to use in different situations, e.g., high-resolution displays, small monitors, etc. */
  srcset?: string
  /** Image sizes for different page layouts */
  sizes?: string
  /** Image alternative information */
  alt?: string
  /** Image classes */
  class?: string
  /** Image loading */
  loading?: HTMLImageElement['loading']
  /** Image CORS settings */
  crossorigin?: string
  /** Referrer policy for fetch https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy */
  referrerPolicy?: HTMLImageElement['referrerPolicy']
  /** Image width */
  width?: HTMLImageElement['width']
  /** Image height */
  height?: HTMLImageElement['height']
  /** https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#decoding */
  decoding?: HTMLImageElement['decoding']
  /** Provides a hint of the relative priority to use when fetching the image */
  fetchPriority?: HTMLImageElement['fetchPriority']
  /** Provides a hint of the importance of the image */
  ismap?: HTMLImageElement['isMap']
  /** The partial URL (starting with #) of an image map associated with the element */
  usemap?: HTMLImageElement['useMap']
}

export interface UseImageAsyncStateOptions {
  /**
   * Delay for the first execution of the promise when "immediate" is true. In milliseconds.
   *
   * @default 0
   */
  delay?: number
  /**
   * Execute the promise right after the function is invoked.
   * Will apply the delay if any.
   *
   * When set to false, you will need to execute it manually.
   *
   * @default true
   */
  immediate?: boolean
  /**
   * Callback when error is caught.
   */
  onError?: (e: unknown) => void
  /**
   * Callback when success is caught.
   */
  onSuccess?: (data: HTMLImageElement) => void
  /**
   * Sets the state to initialState before executing the promise.
   *
   * This can be useful when calling the execute function more than once (for
   * example, to refresh data). When set to false, the current state remains
   * unchanged until the promise resolves.
   *
   * @default true
   */
  resetOnExecute?: boolean
  /**
   * An error is thrown when executing the execute function
   *
   * @default false
   */
  throwError?: boolean
}

export interface UseImageReturn {
  /** Whether the last load resolved successfully (upstream `isReady`). */
  isLoaded: boolean
  /** The error of the last failed load, `undefined` otherwise (upstream `error`). */
  error: unknown
  /** The `currentSrc` of the last successfully loaded image — `null` until a load succeeds. */
  url: string | null
  /** Whether an image load is currently in progress (upstream `isLoading`). */
  isLoading: boolean
  /**
   * (Re)start the image load, optionally delayed, resolving with the loaded
   * image element once its `onload` fires.
   */
  execute: (delay?: number) => Promise<HTMLImageElement | undefined>
}

export function useImage(
  options: UseImageOptions,
  asyncStateOptions?: UseImageAsyncStateOptions,
): UseImageReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useImage/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useImage/index.ts) (implementation),
  [`component.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useImage/component.ts) (Vue component variant — not ported),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useImage/demo.vue) (ported as `demo.tsx`);
  upstream ships no tests, so `packages/core/src/useImage.test.tsx` covers
  load success/failure, manual `execute`, options-change reload and SSR safety
- reaxuse: [`packages/core/src/useImage.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useImage.ts), docs + demo co-located in `packages/core/useImage/`

<Contributors name="useImage" />
