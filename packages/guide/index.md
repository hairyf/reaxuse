# Get Started

`reaxuse` is a collection of React hooks based on the Hooks
API (`useState` / `useEffect` / `useCallback` / `useMemo`). We assume you are
already familiar with the basic ideas of [React Hooks](https://react.dev/reference/react)
before you continue.

It is a **1:1 port of [VueUse](https://vueuse.org)**: every `@vueuse/*`
composable is mapped to a React hook with the same options and return shape,
adapted to the React idiom. The package structure, docs and demos are mirrored
1:1; the only systematic deviation is the React flavor of the APIs.

- The official [vueuse/vueuse](https://github.com/vueuse/vueuse) repository is referenced as a
  git submodule (`source/vueuse`) and serves as the single source of truth for mapping
- Every function is a React hook (`useX`) mapped 1:1 from the upstream implementation
- See [architecture](/guide/architecture) for the full VueUse → reaxuse mapping

## Installation

```bash
npm i @reaxuse/core
```

Packages mirror `@vueuse/*` 1:1 — install the package that matches the upstream
one:

| VueUse                 | reaxuse                 |
| ---------------------- | ----------------------- |
| `@vueuse/core`         | `@reaxuse/core`         |
| `@vueuse/shared`       | `@reaxuse/shared`       |
| `@vueuse/integrations` | `@reaxuse/integrations` |
| `@vueuse/math`         | `@reaxuse/math`         |
| `@vueuse/metadata`     | `@reaxuse/metadata`     |
| `@vueuse/rxjs`         | `@reaxuse/rxjs`         |
| `@vueuse/electron`     | `@reaxuse/electron`     |
| `@vueuse/firebase`     | `@reaxuse/firebase`     |
| `@vueuse/skills`       | `@reaxuse/skills`       |

> reaxuse requires React `>= 18`.

## Usage Example

Simply import the hooks you need. React hooks return plain values (not refs), so
you destructure and use them directly:

```tsx
import { useLocalStorage, useMouse, usePreferredDark } from '@reaxuse/core'

function App() {
  // tracks mouse position
  const { x, y } = useMouse()

  // is user prefers dark theme
  const isDark = usePreferredDark()

  // persist state in localStorage
  const [store, setStore] = useLocalStorage('my-storage', {
    name: 'Apple',
    color: 'red',
  })

  return (
    <div>
      <p>
        pos:
        {x}
        ,
        {y}
      </p>
      <p>
        dark:
        {String(isDark)}
      </p>
      <button onClick={() => setStore(s => ({ ...s, color: 'green' }))}>
        green
      </button>
    </div>
  )
}
```

Refer to the [functions list](/functions) for more details.
