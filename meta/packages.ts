export interface PackageManifest {
  /** short name, e.g. `core` */
  name: string
  /** npm name, e.g. `@reaxuse/core` */
  display: string
  description: string
  /** additional externals not to bundle (besides react / @reaxuse/*) */
  external?: string[]
}

export const packages: PackageManifest[] = [
  {
    name: 'shared',
    display: '@reaxuse/shared',
    description: 'Shared utilities for reaxuse — 1:1 React port of @vueuse/shared',
  },
  {
    name: 'core',
    display: '@reaxuse/core',
    description: 'Core React hooks — 1:1 React port of @vueuse/core',
    external: ['@reaxuse/shared'],
  },
  {
    name: 'integrations',
    display: '@reaxuse/integrations',
    description: 'Integration wrappers for reaxuse — 1:1 React port of @vueuse/integrations',
  },
  {
    name: 'math',
    display: '@reaxuse/math',
    description: 'Math functions for reaxuse — 1:1 React port of @vueuse/math',
  },
  {
    name: 'router',
    display: '@reaxuse/router',
    description: 'Router bindings for reaxuse — React port of @vueuse/router',
  },
  {
    name: 'rxjs',
    display: '@reaxuse/rxjs',
    description: 'RxJS reactive functions for reaxuse — React port of @vueuse/rxjs',
    external: ['rxjs'],
  },
  {
    name: 'firebase',
    display: '@reaxuse/firebase',
    description: 'Realtime bindings for Firebase — React port of @vueuse/firebase',
    external: ['firebase'],
  },
  {
    name: 'electron',
    display: '@reaxuse/electron',
    description: 'Electron renderer process modules — React port of @vueuse/electron',
    external: ['electron'],
  },
  {
    name: 'metadata',
    display: '@reaxuse/metadata',
    description: 'Metadata for reaxuse functions — 1:1 React port of @vueuse/metadata',
  },
]
