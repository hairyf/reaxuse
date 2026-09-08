---
category: '@Integrations'
---

# useChangeCase

Reactive wrapper for [`change-case`](https://github.com/blakeembrey/change-case) — React port of
VueUse's [`useChangeCase`](https://vueuse.org/integrations/useChangeCase/). Substitutes
`useCamelCase`, `usePascalCase`, `useSnakeCase`, `useSentenceCase`, `useCapitalize`, etc.

**Mapping:** upstream returns a writable `WritableComputedRef<string>`; the React port returns a
`[value, setValue]` tuple where `value` is the transformed string (`change-case` applied to the
internal input state with the current `type`) and `setValue` updates that internal input state like
a controlled `useState`. `input`, `type` and `options` accept plain values, ref-like `{ current }`
objects or getters, resolved with `toValue` from `@reaxuse/shared`.

## Install

```bash
npm i change-case@^5
```

## Usage

```tsx
import { useChangeCase } from '@reaxuse/integrations'

// `changeCase` is the transformed value, `setChangeCase` updates the input
const [changeCase, setChangeCase] = useChangeCase('hello world', 'camelCase')
changeCase // helloWorld
setChangeCase('vue use')
changeCase // vueUse
```

or passing a ref-like object to it, the returned value will change along with the source's changes.

```tsx
import { useChangeCase } from '@reaxuse/integrations'

const input = { current: 'helloWorld' }
const [changeCase] = useChangeCase(input, 'camelCase')
changeCase // helloWorld
input.current = 'vue use'
changeCase // vueUse
```

Can be passed into `options` for customization

```tsx
import { useChangeCase } from '@reaxuse/integrations'

const [changeCase] = useChangeCase('helloWorld', 'camelCase', {
  delimiter: '-',
})
changeCase // hello-World
```

## Supported methods

```ts
export {
  camelCase,
  capitalCase,
  constantCase,
  dotCase,
  kebabCase,
  noCase,
  pascalCase,
  pascalSnakeCase,
  pathCase,
  sentenceCase,
  snakeCase,
  trainCase,
} from 'change-case'
```

<DemoContainer name="useChangeCase" />

## Type Declarations

```ts
export type ChangeCaseType = 'noCase' | 'camelCase' | 'capitalCase' | 'constantCase' | 'dotCase' | 'kebabCase' | 'pascalCase' | 'pascalSnakeCase' | 'pathCase' | 'sentenceCase' | 'snakeCase' | 'trainCase'

export type UseChangeCaseReturn = [string, Dispatch<SetStateAction<string>>]

export function useChangeCase(
  input: MaybeRefOrGetter<string>,
  type: MaybeRefOrGetter<ChangeCaseType>,
  options?: MaybeRefOrGetter<Options> | undefined,
): UseChangeCaseReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/integrations/useChangeCase/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useChangeCase/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useChangeCase/index.test.ts) (mirrored in `useChangeCase.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useChangeCase/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/integrations/src/useChangeCase.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/integrations/src/useChangeCase.ts), docs + demo co-located in `packages/integrations/useChangeCase/`

<Contributors name="useChangeCase" />
