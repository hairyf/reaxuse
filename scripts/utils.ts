import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { globSync } from 'tinyglobby'

export const root = fileURLToPath(new URL('..', import.meta.url))

export function readJSON(path: string): any {
  return JSON.parse(readFileSync(join(root, path), 'utf-8'))
}

export function writeJSON(path: string, data: any) {
  writeFileSync(join(root, path), `${JSON.stringify(data, null, 2)}\n`)
}

export function listPackages(): string[] {
  return globSync('packages/*/package.json', { cwd: root })
    .map((p) => {
      return p.split('/')[1]
    })
    .sort()
}

export function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}
