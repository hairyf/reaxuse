---
category: Browser
---

# useSSRWidth

Used to set a global viewport width which will be used when rendering SSR components that rely on the viewport width like `useMediaQuery` or `useBreakpoints`

## Usage

Provide the width above the tree while rendering on the server, so the server markup and the first client render already agree on it

```tsx
import { SSRWidthProvider } from '@reause/core'
import { renderToString } from 'react-dom/server'

const html = renderToString(
  <SSRWidthProvider width={500}>
    <App />
  </SSRWidthProvider>,
)
```

Or in the root component

```tsx
import { SSRWidthProvider } from '@reause/core'

function App() {
  return (
    <SSRWidthProvider width={500}>
      <MyComponent />
    </SSRWidthProvider>
  )
}
```

To retrieve the provided value if you need it in a subcomponent

```tsx
import { useSSRWidth } from '@reause/core'

function MyComponent() {
  const [width, setWidth] = useSSRWidth()

  return <div>{`Width: ${width}px`}</div>
}
```
