---
category: Browser
---

# usePermission

Reactive [Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API) state —
React port of VueUse's [`usePermission`](https://vueuse.org/core/usePermission/).

**Mapping:** upstream queries `navigator.permissions.query()` once at setup and mirrors the resolved
`PermissionStatus.state` (`?? 'prompt'`) into a shallow ref → `useState<PermissionState>('prompt')` +
a mount `useEffect` running the query, re-run when the descriptor changes (the descriptor is
serialized for change detection, so inline object literals are safe). The `change` event listener
attaches to the resolved `PermissionStatus` and is removed on unmount and on descriptor change.
The Vue ref return becomes a plain `'granted' | 'denied' | 'prompt'` string — nothing touches
`navigator` during render (SSR-safe: the server renders the `'prompt'` default). With
`controls: true` the `{ state, isSupported, query }` shape is kept; `isSupported` resolves after
mount and `query()` re-queries instead of returning upstream's cached singleton result.

## Usage

```tsx
import { usePermission } from '@reaxuse/core'

const microphoneAccess = usePermission('microphone') // 'granted' | 'denied' | 'prompt'
```

<DemoContainer name="UsePermission" />

## Type Declarations

```ts
export type GeneralPermissionDescriptor
  = | PermissionDescriptor
    | { name: DescriptorNamePolyfill }

export interface UsePermissionOptions<Controls extends boolean = false> {
  /**
   * Expose more controls
   *
   * @default false
   */
  controls?: Controls
}

export type UsePermissionReturn = PermissionState

export interface UsePermissionReturnWithControls {
  state: UsePermissionReturn
  isSupported: boolean
  query: () => Promise<PermissionStatus | undefined>
}

export function usePermission(
  permissionDesc: GeneralPermissionDescriptor | GeneralPermissionDescriptor['name'],
  options?: UsePermissionOptions<false>,
): UsePermissionReturn
export function usePermission(
  permissionDesc: GeneralPermissionDescriptor | GeneralPermissionDescriptor['name'],
  options: UsePermissionOptions<true>,
): UsePermissionReturnWithControls
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/usePermission/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePermission/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePermission/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/usePermission.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/usePermission.ts), docs + demo co-located in `packages/core/usePermission/`
- upstream has no test file; `packages/core/src/usePermission.test.tsx` stubs `navigator.permissions`
  deterministically following the repo's browser-hook test patterns

<Contributors name="usePermission" />
