import { rmSync } from 'node:fs'
import { join } from 'node:path'
import { globSync } from 'tinyglobby'
import { root } from './utils'

/**
 * Remove build artifacts across the monorepo (dist, coverage, .turbo, tsbuildinfo),
 * mirroring VueUse's `scripts/clean.ts`.
 */
const patterns = [
  'packages/*/dist',
  'docs/.vitepress/dist',
  'docs/.vitepress/cache',
  'coverage',
  '.turbo',
]

let removed = 0
for (const pattern of patterns) {
  for (const target of globSync(pattern, { cwd: root, onlyDirectories: true })) {
    rmSync(join(root, target), { recursive: true, force: true })
    console.log(`[clean] removed ${target}`)
    removed++
  }
}

for (const file of globSync('**/*.tsbuildinfo', { cwd: root })) {
  rmSync(join(root, file), { force: true })
  removed++
}

console.log(`[clean] done (${removed} targets)`)
