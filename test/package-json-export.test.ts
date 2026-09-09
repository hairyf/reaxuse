import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..')
const packages = ['core', 'shared', 'integrations', 'math', 'metadata']

describe('package.json export maps', () => {
  for (const name of packages) {
    it(`@reaxuse/${name} has a valid export map`, () => {
      const pkg = JSON.parse(readFileSync(join(root, 'packages', name, 'package.json'), 'utf-8'))
      expect(pkg.name).toBe(`@reaxuse/${name}`)
      expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/)
      expect(pkg.exports?.['.']).toBeDefined()
      // the barrel lives at the package root (VueUse-style layout):
      // packages/<pkg>/index.ts re-exports the per-hook index.tsx modules.
      // metadata is the exception — its generated files stay under src/.
      const entry = name === 'metadata' ? './src/index.ts' : './index.ts'
      expect(pkg.exports['.'].types).toBe(entry)
      expect(pkg.exports['.'].default).toBe(entry)
    })
  }
})
