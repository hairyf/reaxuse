import { execSync } from 'node:child_process'
import fs from 'node:fs/promises'

/**
 * Remove ignored build artifacts across the monorepo, mirroring VueUse's
 * `scripts/clean.ts` (`git clean -Xdn` over all git-ignored paths).
 * Filtered out: `node_modules`, `.vitepress` (docs cache/output),
 * `.eslintcache`, `.md`, `public`, and reaxuse's git-ignored `skills/`
 * directory (local skill definitions must survive a clean).
 */
const result = execSync('git clean -Xdn', { encoding: 'utf-8' })

const items = result.split('\n')
  .map(i => i.replace('Would remove ', '').trim())
  .filter(Boolean)
  .filter(i => !['node_modules', '.vitepress', '.eslintcache', '.md', 'public', 'skills'].some(j => i.includes(j)))

for (const item of items) {
  console.log(`Removing ${item}`)
  await fs.rm(item, { force: true, recursive: true })
}
