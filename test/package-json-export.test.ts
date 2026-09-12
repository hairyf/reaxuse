import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { packages } from '../meta/packages'

const root = join(import.meta.dirname, '..')

describe('package.json export maps', () => {
  for (const { name } of packages) {
    it(`@reause/${name} has a valid export map`, () => {
      const pkg = JSON.parse(readFileSync(join(root, 'packages', name, 'package.json'), 'utf-8'))
      expect(pkg.name).toBe(`@reause/${name}`)
      expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/)
      // VueUse-shaped dist exports: the tarball only ships `dist`, and every
      // package rebuilds it at pack time through `prepack`.
      expect(pkg.exports?.['.']).toBe('./dist/index.js')
      expect(pkg.exports?.['./*']).toBe('./dist/*')
      expect(pkg.exports?.['./package.json']).toBe('./package.json')
      expect(pkg.files).toEqual(['dist'])
      expect(pkg.sideEffects).toBe(false)
      expect(pkg.types).toBe('./dist/index.d.ts')
      expect(pkg.scripts?.prepack).toBe('pnpm run build')
    })
  }
})
