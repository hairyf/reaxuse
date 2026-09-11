---
category: Browser
---

# useEyeDropper

Reactive [EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API)

## Usage

```tsx
import { useEyeDropper } from '@reause/core'

const { isSupported, open, sRGBHex } = useEyeDropper()
```

## Type Declarations

```ts
export interface EyeDropperOpenOptions {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
   */
  signal?: AbortSignal
}
export interface EyeDropper {
  new (): EyeDropper
  open: (options?: EyeDropperOpenOptions) => Promise<{
    sRGBHex: string
  }>
  [Symbol.toStringTag]: "EyeDropper"
}
export interface UseEyeDropperOptions {
  /**
   * Initial sRGBHex.
   *
   * @default ''
   */
  initialValue?: string
}
export interface UseEyeDropperReturn {
  /**
   * Whether the `EyeDropper` API is available in the current environment.
   * `false` during render and on the server, resolved in a mount effect.
   */
  isSupported: boolean
  /**
   * The last color sampled by the eye dropper as an sRGB hex string.
   * `''` before the first successful `open()`.
   */
  sRGBHex: string
  /**
   * Opens the eye dropper picker. Resolves with `{ sRGBHex }` when a color
   * is sampled and updates the `sRGBHex` state; resolves `undefined` when
   * the API is unsupported.
   */
  open: (openOptions?: EyeDropperOpenOptions) => Promise<
    | {
        sRGBHex: string
      }
    | undefined
  >
}
/**
 * Reactive [EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API).
 *
 * Map from @vueuse/core `useEyeDropper`
 * (`source/vueuse/packages/core/useEyeDropper/`), which returns an object
 * mirroring the upstream `{ isSupported, open, sRGBHex }` members. `open`
 * launches the browser's native eye dropper picker, resolves with
 * `{ sRGBHex }` and keeps the `sRGBHex` state fresh.
 *
 * React divergences:
 * - the Vue `ShallowRef<string>` return becomes a plain `string` state, so
 *   read `sRGBHex` directly instead of `watch`ing it;
 * - `isSupported` (upstream `useSupported`) becomes a plain boolean that
 *   starts `false` and is computed in the mount effect, so nothing touches
 *   `window` during render (SSR-safe);
 * - `open` is a stable callback that checks the mount-resolved support flag
 *   at call time (upstream reads the `isSupported` computed) and resolves
 *   `undefined` when the API is unavailable.
 *
 * @see https://vueuse.org/core/useEyeDropper/
 * @param options
 *
 * @example
 * const { isSupported, open, sRGBHex } = useEyeDropper()
 */
export declare function useEyeDropper(
  options?: UseEyeDropperOptions,
): UseEyeDropperReturn
```
