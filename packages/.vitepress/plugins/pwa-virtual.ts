import type { Plugin } from 'vite'

/**
 * Virtual module `virtual:pwa`.
 *
 * Mirrors VueUse's `packages/.vitepress/plugins/pwa-virtual.ts`:
 * exposes the list of app routes to precache to the service worker
 * (`docs/.vitepress/sw.ts`). The tuple format is
 * `[path, { url, hash }]` — for reaxuse the package entries are the
 * docs routes derived from the function registry, since the packages
 * themselves ship no built artifacts in this repo.
 */
export interface PWAEntry {
  url: string
  hash: string
}

export function PWAVirtualModule(packageNames: [string, PWAEntry][]): Plugin {
  return {
    name: 'reaxuse-pwa-virtual-module',
    resolveId(id) {
      if (id === 'virtual:pwa')
        return '\0virtual:pwa'
    },
    load(id) {
      if (id === '\0virtual:pwa')
        return `export const packageNames = ${JSON.stringify(packageNames)}`
    },
  }
}
