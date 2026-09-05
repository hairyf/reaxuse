import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { root, uniq } from './utils'

export interface ChangelogEntry {
  hash: string
  message: string
  version?: string
  functions: string[]
}

/**
 * Read recent git history and attribute commits to mapped functions,
 * mirroring VueUse's docs changelog (scripts/changelog.ts).
 */
export function getChangeLog(count = 200): ChangelogEntry[] {
  const log = execFileSync('git', ['log', '--pretty=format:%h|%s', `-${count}`], {
    cwd: root,
    encoding: 'utf-8',
  })

  return log
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [hash, ...rest] = line.split('|')
      const message = rest.join('|')
      const files = execFileSync('git', ['diff-tree', '--no-commit-id', '--name-only', '-r', hash], {
        cwd: root,
        encoding: 'utf-8',
      })
      const functions = uniq(
        files
          .split('\n')
          .map((file) => {
            const match = file.match(/^packages\/\w+\/src\/(\w+)\.ts$/)
            return match?.[1]
          })
          .filter((i): i is string => !!i),
      )
      return {
        hash,
        message,
        functions,
        version: message.startsWith('v') ? message.split(' ')[0] : undefined,
      }
    })
    .filter(entry => entry.functions.length > 0 || entry.version)
}

export function generateChangelog() {
  const entries = getChangeLog()
  const md = `# Changelog\n\n${entries
    .map(e => `- \`${e.hash}\` ${e.message}${e.functions.length ? ` (${e.functions.join(', ')})` : ''}`)
    .join('\n')}\n`
  writeFileSync(join(root, 'CHANGELOG.md'), md)
  console.log(`[changelog] wrote CHANGELOG.md (${entries.length} entries)`)
}

if (process.argv[1]?.endsWith('changelog.ts'))
  generateChangelog()
