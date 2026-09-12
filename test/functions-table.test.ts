import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { collectFunctionRows } from '../scripts/update'

/**
 * Structural guard for the `meta/functions.md` mapping table.
 *
 * The table is generated (`npm run update`) and only regenerated after merge,
 * so the committed copy can lag behind the resolver. The strongest assertion
 * therefore runs the resolver itself over the hook sources; the committed table
 * is additionally checked for the invariants that hold no matter how stale its
 * status column is.
 *
 * Background (issue #882): the old table resolved an export's upstream by
 * probing `source/vueuse/packages/<pkg>/<reause export name>` and nothing else,
 * so every renamed port (`useLongPress`, `useStateHistory`, …) and every
 * secondary export (`breakpointsTailwind`) was mislabelled "no upstream match".
 */

const root = join(import.meta.dirname, '..')
const upstreamRoot = join(root, 'source/vueuse')
/** `source/vueuse` is an uninitialized submodule in a fresh worktree. */
const upstreamReady = existsSync(join(upstreamRoot, 'packages', 'core'))

interface TableRow {
  name: string
  upstream: string
  file: string
  status: string
}

/** Parse the generated table — `| \`name\` | upstream | \`file\` | status |`. */
function parseTable(md: string): TableRow[] {
  const rows: TableRow[] = []
  for (const line of md.split('\n')) {
    if (!line.startsWith('| `'))
      continue
    const cells = line.split('|').map(cell => cell.trim())
    // Empty edge cells around `name`, `upstream`, `file` and `status`.
    if (cells.length !== 6)
      continue
    rows.push({
      name: cells[1].replaceAll('`', ''),
      upstream: cells[2],
      file: cells[3].replaceAll('`', ''),
      status: cells[4],
    })
  }
  return rows
}

describe('meta/functions.md resolution', () => {
  const table = parseTable(readFileSync(join(root, 'meta/functions.md'), 'utf-8'))

  it('keeps every hook export as a row, with the header caveat intact', () => {
    // A floor, not an equality: porting another hook legitimately adds rows.
    expect(table.length).toBeGreaterThanOrEqual(310)
    expect(readFileSync(join(root, 'meta/functions.md'), 'utf-8'))
      .toContain('port registry, not a coverage proof')
  })

  it('carries 202+ real upstream paths (not the same-name-directory probe)', () => {
    // The probe this issue removed could only ever resolve 202 of 310 rows.
    const withPath = table.filter(row => row.upstream !== '—')
    expect(withPath.length).toBeGreaterThanOrEqual(202)
  })

  it('labels every row ported, outside-the-pin, or reause-only', () => {
    // Exactly the three statuses `scripts/update.ts` can emit. The retired
    // `ported (no upstream match)` label is deliberately *not* accepted here: it
    // is what the removed same-name-directory probe reported for every renamed
    // or secondary export (issue #882), so accepting it would let that
    // regression pass silently.
    for (const row of table) {
      expect(row.status).toMatch(/^✅ (?:ported|ported \(not in pinned submodule\)|reause-only export)$/)
      // The same hole, asserted as its own failure with a readable message
      // rather than only as the absence of a regex match above.
      expect(row.status, `${row.name} carries the retired probe status`).not.toContain('no upstream match')
      // A `—` upstream column and a resolved path are mutually exclusive; only
      // the two `—` statuses may carry it.
      if (row.status === '✅ reause-only export' || row.status === '✅ ported (not in pinned submodule)')
        expect(row.upstream).toBe('—')
      if (row.status === '✅ ported')
        expect(row.upstream).not.toBe('—')
    }
  })

  describe.skipIf(!upstreamReady)('against the pinned upstream checkout', () => {
    // Resolving scans every hook source and the upstream tree once; share it
    // across the assertions below.
    let rows: ReturnType<typeof collectFunctionRows>
    beforeAll(() => {
      rows = collectFunctionRows()
    })

    it('resolves every real upstream path to an existing source/vueuse module', () => {
      for (const row of table.filter(r => r.upstream !== '—'))
        expect(existsSync(join(upstreamRoot, row.upstream)), `${row.name} → ${row.upstream}`).toBe(true)
    })

    it('never labels an export reause-only when its own annotation names a real upstream', () => {
      for (const row of rows.filter(r => !r.upstream && r.missingFrom === 'reause-only'))
        expect(row.claimConfirmed, `${row.name} claims ${row.claimed} but is reause-only`).toBe(false)
    })

    it('does not call a Vue API or a post-pin hook reause-only', () => {
      const missingFrom = (name: string) => rows.find(row => row.name === name)?.missingFrom
      // VueUse surfaces `toValue` from `vue`; `watch` likewise. `useWebMCP`
      // postdates the frozen pin (docs/upstream-monitoring.md §3.1). None of
      // them were invented here, so none may read as `reause-only export`.
      expect(missingFrom('toValue')).toBe('vue-api')
      expect(missingFrom('useWatch')).toBe('unconfirmed-claim')
      expect(missingFrom('useWebMCP')).toBe('unconfirmed-claim')
      // Genuinely reause-invented helpers, by contrast, are reause-only.
      for (const name of ['isRefLike', 'writeState', 'deepClone', 'deepEqual', 'toArgsFlat', 'useListener'])
        expect(missingFrom(name), name).toBe('reause-only')
    })

    it('resolves renamed ports to their annotated upstream, not to a missing same-name dir', () => {
      const upstreamOf = (name: string) => rows.find(row => row.name === name)?.upstream
      // `on*` → `use*` and `ref*`/`use*Ref*` → `useState*` renames (AGENTS.md §1.2).
      expect(upstreamOf('useLongPress')).toBe('packages/core/onLongPress')
      expect(upstreamOf('useStartTyping')).toBe('packages/core/onStartTyping')
      expect(upstreamOf('useKeyStroke')).toBe('packages/core/onKeyStroke')
      expect(upstreamOf('useStateHistory')).toBe('packages/core/useRefHistory')
      expect(upstreamOf('useStateAutoReset')).toBe('packages/shared/refAutoReset')
      expect(upstreamOf('syncState')).toBe('packages/shared/syncRef')
      expect(upstreamOf('createSharedHook')).toBe('packages/shared/createSharedComposable')
      // Secondary exports of a VueUse-derived page (defined in a module, not a dir).
      expect(upstreamOf('breakpointsTailwind')).toBe('packages/core/useBreakpoints')
      expect(upstreamOf('createCookies')).toBe('packages/integrations/useCookies')
      expect(upstreamOf('mapGamepadToXbox360Controller')).toBe('packages/core/useGamepad')
      // Re-exports of upstream `shared/utils` (one barrel, no per-symbol dirs).
      expect(upstreamOf('clamp')).toBe('packages/shared/utils')
      expect(upstreamOf('noop')).toBe('packages/shared/utils')
      // Genuinely reause-invented helpers keep an honest `—`.
      expect(upstreamOf('isRefLike')).toBeUndefined()
      expect(upstreamOf('writeState')).toBeUndefined()
    })

    it('resolves a large majority of rows, so a collapse to reause-only fails loudly', () => {
      const resolved = rows.filter(row => row.upstream)
      // 295 of 310 at the time of the fix; the floor catches a regression that
      // silently re-breaks the annotation or page routes rather than the odd row.
      expect(resolved.length).toBeGreaterThanOrEqual(285)
      expect(rows.length - resolved.length).toBeLessThanOrEqual(25)
    })
  })
})
