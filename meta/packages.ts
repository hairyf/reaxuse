export interface PackageManifest {
  /** short name, e.g. `core` */
  name: string
  /** npm name, e.g. `@reaxuse/core` */
  display: string
  description: string
  /** whether this is an addon package (integrations/rxjs/firebase/electron/math) */
  addon?: boolean
  /** additional externals not to bundle (besides react / @reaxuse/*) */
  external?: string[]
  /** iife global name mapping for bundled externals, e.g. `{ axios: 'axios' }` */
  globals?: Record<string, string>
  /** manual import — do not generate an iife build */
  manualImport?: boolean
  deprecated?: boolean
  /** build per-hook submodules (`dist/<hook>.js`) in addition to the barrel */
  submodules?: boolean
  /** disable the build entirely */
  build?: boolean
  /** disable the iife build (defaults to enabled) */
  iife?: boolean
  /** disable the es build (defaults to enabled) */
  mjs?: boolean
  /** dts flag (defaults to auto-detect from package.json `types`) */
  dts?: boolean
  /** build target, defaults to `es2018` */
  target?: string
  /** package exposes utilities rather than hooks */
  utils?: boolean
  /** files to copy into the build output */
  copy?: string[]
  manualEntryPoints?: true
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
  },
  {
    name: 'integrations',
    display: '@reaxuse/integrations',
    description: 'Integration wrappers for reaxuse — 1:1 React port of @vueuse/integrations',
    addon: true,
    submodules: true,
    external: [
      'async-validator',
      'axios',
      'change-case',
      'drauu',
      'focus-trap',
      'fuse.js',
      'idb-keyval',
      'jwt-decode',
      'nprogress',
      'qrcode',
      'sortablejs',
      'universal-cookie',
      'node:http',
    ],
    globals: {
      'axios': 'axios',
      'universal-cookie': 'UniversalCookie',
      'qrcode': 'QRCode',
      'nprogress': 'nprogress',
      'jwt-decode': 'jwt_decode',
      'focus-trap': 'focusTrap',
      'drauu': 'Drauu',
      'fuse.js': 'Fuse',
      'change-case': 'changeCase',
      'async-validator': 'AsyncValidator',
      'idb-keyval': 'idbKeyval',
      'sortablejs': 'Sortable',
    },
  },
  {
    name: 'math',
    display: '@reaxuse/math',
    description: 'Math functions for reaxuse — 1:1 React port of @vueuse/math',
    addon: true,
  },
  {
    name: 'rxjs',
    display: '@reaxuse/rxjs',
    description: 'RxJS reactive functions for reaxuse — React port of @vueuse/rxjs',
    addon: true,
    external: [
      'rxjs',
      'rxjs/operators',
    ],
    globals: {
      'rxjs': 'rxjs',
      'rxjs/operators': 'rxjs.operator',
    },
  },
  {
    name: 'firebase',
    display: '@reaxuse/firebase',
    description: 'Realtime bindings for Firebase — React port of @vueuse/firebase',
    addon: true,
    submodules: true,
    external: [
      'firebase',
      'firebase/auth',
      'firebase/database',
    ],
    globals: {
      'firebase': 'firebase',
      'firebase/auth': 'firebase',
      'firebase/database': 'firebase',
    },
  },
  {
    name: 'electron',
    display: '@reaxuse/electron',
    description: 'Electron renderer process modules — React port of @vueuse/electron',
    addon: true,
    external: [
      'electron',
    ],
    iife: false,
  },
  {
    name: 'metadata',
    display: '@reaxuse/metadata',
    description: 'Metadata for reaxuse functions — 1:1 React port of @vueuse/metadata',
    manualImport: true,
    iife: false,
    utils: true,
    target: 'node14',
  },
]
