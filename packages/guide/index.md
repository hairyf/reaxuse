# Get Started

`reause` is a collection of React hooks based on the Hooks
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
- See [architecture](/guide/architecture) for the full VueUse → reause mapping

## Installation

```bash
npm i @reause/core
```

Packages mirror `@vueuse/*` 1:1 — install the package that matches the upstream
one:

| VueUse                 | reause                 |
| ---------------------- | ---------------------- |
| `@vueuse/core`         | `@reause/core`         |
| `@vueuse/shared`       | `@reause/shared`       |
| `@vueuse/integrations` | `@reause/integrations` |
| `@vueuse/math`         | `@reause/math`         |
| `@vueuse/metadata`     | `@reause/metadata`     |
| `@vueuse/rxjs`         | `@reause/rxjs`         |
| `@vueuse/electron`     | `@reause/electron`     |
| `@vueuse/firebase`     | `@reause/firebase`     |
| `@vueuse/skills`       | `@reause/skills`       |

> reause requires React `>= 18`.

## Usage Example

Simply import the hooks you need. React hooks return plain values (not refs), so
you destructure and use them directly:

```tsx
import { useLocalStorage, useMouse, usePreferredDark } from '@reause/core'

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
