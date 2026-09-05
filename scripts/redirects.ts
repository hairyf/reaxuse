import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { root } from './utils'

/**
 * Generate Netlify `_redirects` for the docs site from the mapped functions,
 * mirroring VueUse's `scripts/redirects.ts`.
 */
export function generateRedirects() {
  const dist = join(root, 'packages/.vitepress/dist')
  const lines = [
    '/ *  /index.html  200',
  ]
  mkdirSync(dist, { recursive: true })
  writeFileSync(join(dist, '_redirects'), `${lines.join('\n')}\n`)
  console.log('[redirects] wrote packages/.vitepress/dist/_redirects')
}

if (process.argv[1]?.endsWith('redirects.ts'))
  generateRedirects()
