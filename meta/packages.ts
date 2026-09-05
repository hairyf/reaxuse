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
    name: 'metadata',
    display: '@reaxuse/metadata',
    description: 'Metadata for reaxuse functions — 1:1 React port of @vueuse/metadata',
  },
]
