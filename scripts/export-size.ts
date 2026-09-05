import { gzipSync } from 'node:zlib'
import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { globSync } from 'tinyglobby'
import { root } from './utils'

interface SizeEntry {
  file: string
  raw: number
  gzip: number
}

/**
 * Report bundle sizes of built packages, mirroring VueUse's `scripts/export-size.ts`.
 * Requires `npm run build` to have run first.
 */
export function exportSize() {
  const files = globSync('packages/*/dist/*.{js,mjs}', { cwd: root })
  if (files.length === 0) {
    console.warn('[size] no dist output found — run `npm run build` first')
    return
  }

  const entries: SizeEntry[] = files.map((file) => {
    const full = join(root, file)
    const raw = statSync(full).size
    const gzip = gzipSync(readFileSync(full)).length
    return { file, raw, gzip }
  })

  entries.sort((a, b) => b.gzip - a.gzip)
  console.log(`\n${'file'.padEnd(48)}${'raw'.padStart(10)}${'gzip'.padStart(10)}`)
  for (const entry of entries) {
    console.log(
      `${entry.file.padEnd(48)}${String(entry.raw).padStart(10)}${String(entry.gzip).padStart(10)}`,
    )
  }
  console.log()
}

if (process.argv[1]?.endsWith('export-size.ts'))
  exportSize()
