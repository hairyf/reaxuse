import { execFileSync } from 'node:child_process'
import process from 'node:process'
import { root } from './utils'

/**
 * Publish all reaxuse packages to npm.
 * Used by the `publish:ci` script in the release workflow (CI only).
 */
export function publish() {
  const packages = ['shared', 'core', 'integrations', 'math', 'metadata']
  for (const pkg of packages) {
    console.log(`[publish] publishing @reaxuse/${pkg}…`)
    execFileSync('npm', ['publish', '--workspace', `@reaxuse/${pkg}`, '--access', 'public'], {
      cwd: root,
      stdio: 'inherit',
    })
  }
  console.log('[publish] done')
}

if (process.argv[1]?.endsWith('publish.ts'))
  publish()
