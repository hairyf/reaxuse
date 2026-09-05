import { execFileSync } from 'node:child_process'
import { root } from './utils'

/**
 * Backport commits to an older branch, mirroring VueUse's `scripts/backport.ts`.
 *
 * Usage: `npm run backport <commit-sha> [branch]` (default branch: `previous-major`).
 */
export function backport(commit: string, branch = 'previous-major') {
  const current = execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf-8' }).trim()
  execFileSync('git', ['fetch', 'origin'], { cwd: root, stdio: 'inherit' })
  execFileSync('git', ['checkout', branch], { cwd: root, stdio: 'inherit' })
  execFileSync('git', ['cherry-pick', commit], { cwd: root, stdio: 'inherit' })
  execFileSync('git', ['push', 'origin', branch], { cwd: root, stdio: 'inherit' })
  console.log(`[backport] ${commit} → ${branch} (from ${current})`)
}

if (process.argv[1]?.endsWith('backport.ts')) {
  const [commit, branch] = process.argv.slice(2)
  if (!commit) {
    console.error('Usage: npm run backport <commit-sha> [branch]')
    process.exit(1)
  }
  backport(commit, branch)
}
