---
category: '@Integrations'
---

# useChangeCase

Reactive wrapper for [`change-case`](https://github.com/blakeembrey/change-case)

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
