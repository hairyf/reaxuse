import type { Plugin } from 'vite'

/**
 * Virtual module `/virtual-contributors`.
 *
 * Mirrors VueUse's `packages/.vitepress/plugins/contributors.ts`:
 * exposes per-function contributor lists (fetched from the GitHub
 * API at build time, falling back to an empty list) to the theme's
 * `Contributors` component.
 */
export interface ContributorInfo {
  name: string
  avatar: string
  login: string
  url: string
  commits: number
}

export function Contributors(data: Record<string, ContributorInfo[]>): Plugin {
  return {
    name: 'reaxuse-contributors',
    resolveId(id) {
      if (id === '/virtual-contributors')
        return '\0virtual-contributors'
    },
    load(id) {
      if (id === '\0virtual-contributors')
        return `export default ${JSON.stringify(data)}`
    },
  }
}
