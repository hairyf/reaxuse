---
category: '@Integrations'
---

# useCookies

Wrapper for [`universal-cookie`](https://www.npmjs.com/package/universal-cookie) — React port of VueUse's
[`useCookies`](https://vueuse.org/integrations/useCookies/). Reactive methods to work with cookies: reading
a watched cookie re-renders the component when that cookie changes.

**Mapping:** upstream returns a **method object** (`get`, `getAll`, `set`, `remove`, `addChangeListener`,
`removeChangeListener`), not a piece of writable state, so the React port returns the same object rather
than a tuple. Upstream's reactivity is a `shallowRef(0)` "touches" counter bumped inside
`cookies.addChangeListener(onChange)` when `shouldUpdate(dependencies, new, old)` reports a watched cookie
changed, and the methods read `touches.value` to subscribe; here the counter is a `useState` read in the
render body, so the same change re-renders the component and the `get` / `getAll` closures from that render
observe the new value. `previousCookies` and the mutable watch list live in refs to survive re-renders
exactly as upstream's local variables do, and `tryOnScopeDispose` maps to a `useEffect` cleanup that
removes the change listener.

**Deviation:** `createCookies` accepts a structural `CreateCookiesRequest` (`{ headers?: { cookie?: string
| null } }`) — or a plain cookie string — instead of Node's `IncomingMessage`. Upstream types the parameter
as `import type { IncomingMessage } from 'node:http'`, which would pull a Node built-in into a browser
bundle; only `headers.cookie` is actually read.

## Install

```bash
npm i universal-cookie@^8
```

## Usage

### Common usage

```tsx
import { useCookies } from '@reaxuse/integrations'

function Component() {
  const cookies = useCookies(['locale'])

  return (
    <div>
      <strong>locale</strong>
      :
      {cookies.get('locale')}
      <hr />
      <pre>{JSON.stringify(cookies.getAll())}</pre>
      <button onClick={() => cookies.set('locale', 'ru-RU')}>
        Russian
      </button>
      <button onClick={() => cookies.set('locale', 'en-US')}>
        English
      </button>
    </div>
  )
}
```

## Options

Access and modify cookies using React hooks.

```tsx
import { useCookies } from '@reaxuse/integrations'

const {
  get,
  getAll,
  set,
  remove,
  addChangeListener,
  removeChangeListener,
} = useCookies(['cookie-name'], {
  doNotParse: false,
  autoUpdateDependencies: false,
})
```

### `dependencies` (optional)

Let you optionally specify a list of cookie names your component depend on or that should trigger a
re-render. If unspecified, it will render on every cookie change.

### `options` (optional)

- `doNotParse` (boolean = false): do not convert the cookie into an object no matter what. **Passed as default value to `get`/`getAll` methods.**
- `autoUpdateDependencies` (boolean = false): automatically add cookie names ever provided to `get` method. If **true** then you don't need to care about provided `dependencies`.

### `cookies` (optional)

Let you provide a `universal-cookie` instance (creates a new instance by default)

> Info about methods available in the [universal-cookie api docs](https://www.npmjs.com/package/universal-cookie#api---cookies-class)

## `createCookies([req])`

Create a `universal-cookie` instance from a request (default is `window.document.cookie`) and returns a
`useCookies` function bound to that instance.

- req (object | string): a request-like object with `headers.cookie` (Node's
  [`http.IncomingMessage`](https://nodejs.org/api/http.html#http_class_http_incomingmessage) satisfies it),
  or the cookie header string itself

```ts
import { createCookies } from '@reaxuse/integrations'

const useSsrCookies = createCookies({ headers: { cookie: 'locale=en-US' } })
const { get } = useSsrCookies(['locale'])
get('locale') // 'en-US'
```

<DemoContainer name="useCookies" />

## Type Declarations

```ts
export interface UseCookiesOptions {
  /**
   * Do not convert the cookie into an object no matter what
   *
   * @default false
   */
  doNotParse?: boolean
  /**
   * Automatically add cookie names ever provided to `get` method
   *
   * @default false
   */
  autoUpdateDependencies?: boolean
}

export interface UseCookiesReturn {
  get: <T = any>(name: string, options?: CookieGetOptions) => T
  getAll: <T = any>(options?: CookieGetOptions) => T
  set: (name: string, value: Cookie, options?: CookieSetOptions) => void
  remove: (name: string, options?: CookieSetOptions) => void
  addChangeListener: (callback: CookieChangeListener) => void
  removeChangeListener: (callback: CookieChangeListener) => void
}

export interface CreateCookiesRequest {
  headers?: {
    cookie?: string | null
  }
}

export function useCookies(
  dependencies?: string[] | null,
  options?: UseCookiesOptions,
  cookies?: Cookie,
): UseCookiesReturn

export function createCookies(
  req?: CreateCookiesRequest | string,
): (dependencies?: string[] | null, options?: UseCookiesOptions) => UseCookiesReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/integrations/useCookies/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useCookies/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useCookies/index.test.ts) (mirrored in `useCookies.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useCookies/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/integrations/src/useCookies.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/integrations/src/useCookies.ts), docs + demo co-located in `packages/integrations/useCookies/`

<Contributors name="useCookies" />
