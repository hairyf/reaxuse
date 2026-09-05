import type { Plugin } from 'vite'

/**
 * Virtual module `/virtual-changelog`.
 *
 * Mirrors VueUse's `packages/.vitepress/plugins/changelog.ts`:
 * exposes the commit history as a virtual module consumed by the
 * theme's `Changelog` component on function pages.
 */
export interface CommitInfo {
  sha: string
  message: string
  date: string
}

export function ChangeLog(data: CommitInfo[]): Plugin {
  return {
    name: 'reaxuse-changelog',
    resolveId(id) {
      if (id === '/virtual-changelog')
        return '\0virtual-changelog'
    },
    load(id) {
      if (id === '\0virtual-changelog')
        return `export default ${JSON.stringify(data)}`
    },
  }
}
