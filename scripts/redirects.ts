import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { root } from './utils'

const CATCH_ALL = '/*  /index.html  200'

/**
 * Write Netlify `_redirects` for the docs site: a single SPA catch-all serving
 * `/index.html` for paths that have no page of their own.
 *
 * Mirrors VueUse's `scripts/redirects.ts` in intent only: upstream instead
 * writes one `302` per documented function and per alias (`/useMouse` →
 * `/core/useMouse/`) and keeps its catch-all in `netlify.toml`. Upstream's list
 * is not derivable here — the generated `packages/metadata/src/functions.ts`
 * carries no `docs` or `alias` fields, so it would need the metadata generator
 * extended first.
 */
export function generateRedirects() {
  const dist = join(root, 'packages/.vitepress/dist')
  mkdirSync(dist, { recursive: true })
  writeFileSync(join(dist, '_redirects'), `${CATCH_ALL}\n`)
  console.log('[redirects] wrote packages/.vitepress/dist/_redirects')
}

if (process.argv[1]?.endsWith('redirects.ts'))
  generateRedirects()
