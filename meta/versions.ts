import { version } from '../package.json'

/**
 * Mirrors VueUse's `meta/versions.ts`: version constants consumed by
 * the docs theme (e.g. the site footer / release links).
 */
export const currentVersion = `v${version}`

export const versions = [
  { version: currentVersion, link: `https://github.com/hairyf/reaxuse/releases/tag/${currentVersion}` },
]
