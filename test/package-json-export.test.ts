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
      expect(pkg.exports['.'].types).toBe('./src/index.ts')
      expect(pkg.exports['.'].default).toBe('./src/index.ts')
    })
  }
})
