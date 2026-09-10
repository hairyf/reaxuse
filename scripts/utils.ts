import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { globSync } from 'tinyglobby'

export const root = fileURLToPath(new URL('..', import.meta.url))

/** Declaration output of `npm run build:types` (`tsc -p tsconfig.types.json`). */
export const DIR_TYPES = join(root, 'types/packages')

/**
 * Type declarations of one function page, read from the emitted
 * `types/packages/<pkg>/<page>/index.d.ts` and cleaned up for embedding in
 * markdown. Ports VueUse's `getTypeDefinition` (scripts/utils.ts).
 */
export async function getTypeDefinition(pkg: string, name: string): Promise<string | undefined> {
  const typingFilepath = join(DIR_TYPES, pkg, name, 'index.d.ts')

  if (!existsSync(typingFilepath))
    return

  let types = await fs.readFile(typingFilepath, 'utf-8')

  if (!types)
    return

  // clean up types
  types = types
    .replace(/import\(.*?\)\./g, '')
    .replace(/import[\s\S]+?from ?["'][\s\S]+?["']/g, '')
    .replace(/export \{\}/g, '')

  const prettier = await import('prettier')
  return (await prettier
    .format(
      types,
      {
        semi: false,
        parser: 'typescript',
      },
    ))
    .trim()
}

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
