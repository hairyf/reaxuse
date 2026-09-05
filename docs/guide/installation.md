# Installation

```bash
git clone --recurse-submodules https://github.com/hairyf/reaxuse.git
cd reaxuse
npm install
```

## Using a package

Every hook lives in `@reaxuse/*`, mirroring `@vueuse/*`:

```bash
npm install @reaxuse/core
```

```tsx
import { useToggle } from '@reaxuse/core'

function App() {
  const [value, toggle] = useToggle()
  return <button onClick={() => toggle()}>{String(value)}</button>
}
```

## Development

```bash
npm run typecheck   # TypeScript check
npm run test        # vitest (browser mode via vitest-browser-react)
npm run lint        # eslint
npm run build       # tsdown via turbo
npm run docs        # VitePress dev server
```
