---
category: Utilities
---

# useBase64

Reactive base64 transforming — React port of VueUse's [`useBase64`](https://vueuse.org/core/useBase64/). Supports plain text, blobs/files, buffers, canvas elements, images and JSON-serializable objects, maps and sets.

**Mapping:** upstream returns an object of shallow refs (`base64`, `promise`) plus the `execute` control function → a plain object of plain values held in `useState`s. The target is transformed to a base64 data URL automatically whenever it changes, `promise` holds the promise of the current transformation and `execute` re-triggers it manually.

## Usage

```tsx
import { useBase64 } from '@reaxuse/core'

const [text, setText] = useState('')

const { base64, promise, execute } = useBase64(text)
```

### Supported Input Types

- `string` — Plain text
- `Blob` — File or blob data
- `ArrayBuffer` — Binary data
- `HTMLCanvasElement` — Canvas element
- `HTMLImageElement` — Image element
- `Object` / `Array` / `Map` / `Set` — Serialized to JSON

### Return Values

| Property  | Description                               |
| --------- | ----------------------------------------- |
| `base64`  | The resulting base64 string               |
| `promise` | The promise of the current transformation |
| `execute` | Manually trigger the transformation       |

### Data URL Format

By default, the output is in Data URL format (e.g., `data:text/plain;base64,...`). Set `dataUrl: false` to get raw base64.

```tsx
const { base64 } = useBase64(text, { dataUrl: false })
// Returns raw base64 without the data URL prefix
```

### Canvas and Image Options

When transforming canvas or image elements, you can specify the MIME type and quality.

```tsx
const canvas = document.querySelector('canvas')

const { base64 } = useBase64(canvas, {
  type: 'image/jpeg', // MIME type
  quality: 0.8, // Image quality (0-1, for jpeg/webp)
})
```

### Custom Serializer

For objects, arrays, maps and sets, you can provide a custom serializer. Otherwise, the data will be serialized using `JSON.stringify` (maps are converted to objects, sets to arrays).

```tsx
const data = { foo: 'bar' }

const { base64 } = useBase64(data, {
  serializer: v => JSON.stringify(v, null, 2),
})
```

<DemoContainer name="UseBase64" />

## Type Declarations

```ts
export interface UseBase64Options {
  dataUrl?: boolean
}

export interface ToDataURLOptions extends UseBase64Options {
  type?: string | undefined
  quality?: any
}

export interface UseBase64ObjectOptions<T> extends UseBase64Options {
  serializer?: (v: T) => string
}

export interface UseBase64Return {
  base64: string
  promise: Promise<string> | undefined
  execute: () => Promise<string> | undefined
}

export function useBase64(target: RefOrValue<string | undefined>, options?: UseBase64Options): UseBase64Return
export function useBase64(target: RefOrValue<Blob | undefined>, options?: UseBase64Options): UseBase64Return
export function useBase64(target: RefOrValue<ArrayBuffer | undefined>, options?: UseBase64Options): UseBase64Return
export function useBase64(target: RefOrValue<HTMLCanvasElement | undefined>, options?: ToDataURLOptions): UseBase64Return
export function useBase64(target: RefOrValue<HTMLImageElement | undefined>, options?: ToDataURLOptions): UseBase64Return
export function useBase64<T extends Record<string, unknown>>(target: RefOrValue<T>, options?: UseBase64ObjectOptions<T>): UseBase64Return
export function useBase64<T extends Map<string, unknown>>(target: RefOrValue<T>, options?: UseBase64ObjectOptions<T>): UseBase64Return
export function useBase64<T extends Set<unknown>>(target: RefOrValue<T>, options?: UseBase64ObjectOptions<T>): UseBase64Return
export function useBase64<T>(target: RefOrValue<T[]>, options?: UseBase64ObjectOptions<T[]>): UseBase64Return
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useBase64/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useBase64/index.ts) (implementation),
  [`serialization.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useBase64/serialization.ts) (inlined as `getDefaultSerialization`),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useBase64/index.browser.test.ts) (mirrored in `packages/core/src/useBase64.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useBase64/demo.vue) (ported to `demo.tsx` below).
- reaxuse: [`packages/core/src/useBase64.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useBase64.ts), docs + demo co-located in `packages/core/useBase64/`

<Contributors name="useBase64" />
