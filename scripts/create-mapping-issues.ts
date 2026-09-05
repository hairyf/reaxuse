import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { globSync } from 'tinyglobby'
import { root } from './utils'

const REPO = 'hairyf/reaxuse'
const UPSTREAM = 'source/vueuse'

/** upstream packages in scope → reaxuse label suffix */
const PKGS = ['core', 'shared', 'math', 'integrations', 'electron', 'firebase', 'router', 'rxjs']

const SIZE_RANGES: Array<[string, number]> = [
  ['size:XS', 9],
  ['size:S', 29],
  ['size:M', 99],
  ['size:L', 499],
  ['size:XL', 999],
  ['size:XXL', Number.POSITIVE_INFINITY],
]

function sizeForLoc(loc: number): string {
  return SIZE_RANGES.find(([, max]) => loc <= max)![0]
}

/** already-ported hooks — rendered as review/completion trackers */
const PORTED: Record<string, { pkg: string, src: string, gap: string }> = {
  useNow: {
    pkg: 'core',
    src: 'packages/core/src/useNow.ts',
    gap: 'upstream also supports `{ controls: true }` (returns `{ now, pause, resume }`) and returns `Date`; current port only supports `useNow(interval)` → `number`.',
  },
  useCounter: {
    pkg: 'shared',
    src: 'packages/shared/src/useCounter.ts',
    gap: 'verify full API parity with upstream (initialValue/options overloads, min/max clamping).',
  },
  useToggle: {
    pkg: 'shared',
    src: 'packages/shared/src/useToggle.ts',
    gap: 'upstream has two overloads: `Ref<T>` → toggle fn, or plain value → `[value, toggle]` tuple; verify the React port covers both shapes.',
  },
}

interface FnInfo {
  name: string
  pkg: string
  dir: string
  loc: number
  category: string
  description: string
  deprecated: boolean
  alias: string[]
  hasComponent: boolean
  hasDirective: boolean
  hasDemo: boolean
  testFiles: string[]
  signature: string
  usage: string
  externalDeps: string[]
  size: string
}

function parseFrontmatter(content: string): { data: Record<string, string>, body: string } {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m)
    return { data: {}, body: content }
  const data: Record<string, string> = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-z-]+):(.*)$/i)
    if (kv)
      data[kv[1].trim()] = kv[2].trim().replace(/^['"]|['"]$/g, '')
  }
  return { data, body: content.slice(m[0].length) }
}

function extractDescription(body: string, name: string): string {
  const m = body.match(new RegExp(`#\\s+${name}\\s*\\n+(.+?)(?:, |\\. |\\n|\\.\\n)`))
  const desc = (m?.[1] || '').trim()
  return desc
}

function extractSignature(src: string, name: string): string {
  const re = new RegExp(`export\\s+(?:async\\s+)?function\\s+${name}\\b|export\\s+const\\s+${name}\\b`)
  const idx = src.search(re)
  if (idx < 0)
    return ''
  const lines = src.slice(idx).split(/\r?\n/)
  const sig = [lines[0]]
  let paren = 0
  for (const c of lines[0]) {
    if (c === '(')
      paren++
    else if (c === ')')
      paren--
  }
  let i = 1
  while (paren > 0 && i < lines.length) {
    sig.push(lines[i])
    for (const c of lines[i]) {
      if (c === '(')
        paren++
      else if (c === ')')
        paren--
    }
    i++
  }
  return sig.join('\n').trim().replace(/\s*\{\s*$/, '')
}

function extractUsage(body: string): string {
  const m = body.match(/##\s*Usage\s*\n```(?:ts|tsx|js)?\r?\n([\s\S]*?)```/)
  return m?.[1]?.trim() || ''
}

/** read the reaxuse-side usage example from the co-located docs page, if it exists */
function readReaxuseUsage(pkg: string, fn: string): string {
  const md = join(root, 'packages', pkg, fn, 'index.md')
  if (!existsSync(md))
    return ''
  const { body } = parseFrontmatter(readFileSync(md, 'utf-8'))
  return extractUsage(body)
}

/** strip `import ...` lines from a code snippet (imports are not shown in Expected implementation) */
function stripImports(snippet: string): string {
  return snippet
    .split(/\r?\n/)
    .filter(line => !/^\s*import\b/.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function extractExternalDeps(src: string): string[] {
  const deps = new Set<string>()
  for (const m of src.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    const spec = m[1]
    if (spec.startsWith('.'))
      continue
    if (spec === 'vue' || spec.startsWith('@vueuse/') || spec.startsWith('react') || spec.startsWith('@reaxuse/'))
      continue
    deps.add(spec)
  }
  return [...deps].sort()
}

function scanFunctions(): FnInfo[] {
  const out: FnInfo[] = []
  for (const pkg of PKGS) {
    const dir = join(root, UPSTREAM, 'packages', pkg)
    if (!existsSync(dir))
      continue
    const dirs = globSync('*', { cwd: dir, onlyDirectories: true })
      .map(d => d.endsWith('/') ? d.slice(0, -1) : d)
      .filter(d => !d.startsWith('_') && d !== 'utils')
      .sort()
    for (const fn of dirs) {
      const fnDir = join(dir, fn)
      const mdPath = join(fnDir, 'index.md')
      const tsPath = join(fnDir, 'index.ts')
      const src = readFileSync(tsPath, 'utf-8')
      const loc = src.split(/\r?\n/).length
      let category = ''
      let description = ''
      let deprecated = false
      let alias: string[] = []
      let usage = ''
      if (existsSync(mdPath)) {
        const md = readFileSync(mdPath, 'utf-8')
        const { data, body } = parseFrontmatter(md)
        category = data.category || ''
        deprecated = data.deprecated === 'true' || /DEPRECATED/i.test(body.slice(0, 400))
        alias = data.alias ? data.alias.split(',').map(s => s.trim()).filter(Boolean) : []
        description = extractDescription(body, fn)
        usage = extractUsage(body)
      }
      const testFiles = ['index.test.ts', 'index.browser.test.ts', 'directive.test.ts']
        .filter(t => existsSync(join(fnDir, t)))
      out.push({
        name: fn,
        pkg,
        dir: `source/vueuse/packages/${pkg}/${fn}`,
        loc,
        category,
        description,
        deprecated,
        alias,
        hasComponent: existsSync(join(fnDir, 'component.ts')),
        hasDirective: existsSync(join(fnDir, 'directive.ts')),
        hasDemo: existsSync(join(fnDir, 'demo.vue')),
        testFiles,
        signature: extractSignature(src, fn),
        usage,
        externalDeps: extractExternalDeps(src),
        size: sizeForLoc(loc),
      })
    }
  }
  return out
}

function titleDescription(fn: FnInfo): string {
  const d = fn.description
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return d.length > 60 ? `${d.slice(0, 57)}…` : d
}

function titleFor(fn: FnInfo): string {
  return `Mapping | \`${fn.name}\` | ${titleDescription(fn)}`
}

function bodyFor(fn: FnInfo): string {
  const ported = PORTED[fn.name]
  const reaxuseFile = ported?.src || `packages/${fn.pkg}/src/${fn.name}.ts`
  const docsDir = `packages/${fn.pkg}/${fn.name}`
  const variants = [
    fn.hasComponent ? `component \`${fn.name.replace(/^use/, 'Use')}\`` : '',
    fn.hasDirective ? `directive \`v-${fn.name.replace(/^use/, '').toLowerCase()}\`` : '',
  ].filter(Boolean).join(' / ')

  const statusLine = ported
    ? '**Status**: 🚧 ported — review/completion tracker (tick what exists, close the gaps below)'
    : '**Status**: ☐ todo · ☐ in progress · ☐ done'

  const mapFrom = [
    `- \`index.ts\` — main implementation (${fn.loc} LOC)`,
    ...fn.testFiles.map(t => `- \`${t}\` — upstream tests to mirror`),
    ...(fn.hasComponent ? ['- `component.ts` — component variant'] : []),
    ...(fn.hasDirective ? ['- `directive.ts` — directive variant'] : []),
    ...(fn.hasDemo ? ['- `demo.vue` — upstream demo to port'] : []),
  ].join('\n')

  const apiLines = [
    fn.signature ? `- **Signature**: \`${fn.signature.replace(/\n/g, ' ')}\`` : '',
    fn.category ? `- **Category**: ${fn.category}` : '',
    fn.description ? `- **Description**: ${fn.description}` : '',
    variants ? `- **Variants**: ${variants}` : '',
    fn.alias.length ? `- **Alias**: ${fn.alias.join(', ')}` : '',
    fn.deprecated ? '- **⚠️ DEPRECATED upstream** — map only if still desired' : '',
  ].filter(Boolean).join('\n')

  const reaxuseUsage = ported ? stripImports(readReaxuseUsage(fn.pkg, fn.name)) : ''
  const vueuseUsage = stripImports(fn.usage)
  const vueuseBlock = vueuseUsage
    ? `// vueuse — @vueuse/${fn.pkg}\n${vueuseUsage}`
    : `// vueuse — @vueuse/${fn.pkg}\n// TODO: add the upstream usage example from ${fn.dir}/index.md`
  const reaxuseBlock = reaxuseUsage
    ? `// reaxuse — @reaxuse/${fn.pkg} (current port: ${reaxuseFile})\n${reaxuseUsage}`
    : `// reaxuse — @reaxuse/${fn.pkg} (${reaxuseFile})\n// TODO: complete the React port during mapping — generally the same shape as\n// VueUse; document any React differences (state/effect/refs/SSR) here`
  const usageBlock = `\`\`\`tsx\n${vueuseBlock}\n\n${reaxuseBlock}\n\`\`\``

  const notes = [
    `${fn.category || '—'} · ${fn.testFiles.length ? 'upstream tests exist to mirror' : 'no upstream tests'}`,
    ...(fn.externalDeps.length ? [`external deps: \`${fn.externalDeps.join('`, `')}\` — keep optional`] : []),
    ...(fn.deprecated ? ['function is marked DEPRECATED upstream — confirm before porting'] : []),
    ...(ported ? [`**Gaps to close**: ${ported.gap}`] : []),
  ]

  const acceptance = [
    `- [${ported ? 'x' : ' '}] implementation \`${reaxuseFile}\` + re-export from \`packages/${fn.pkg}/src/index.ts\``,
    `- [${ported ? 'x' : ' '}] test \`packages/${fn.pkg}/src/${fn.name}.test.tsx\` (vitest-browser-react), mirroring the upstream test files`,
    `- [${ported ? 'x' : ' '}] docs page \`${docsDir}/index.md\` + co-located demo \`${docsDir}/demo.tsx\``,
    `- [ ] docs page references the upstream mapping files (source + tests)`,
    `- [ ] \`npm run update\` — refresh \`meta/functions.md\`, \`packages/functions.md\`, \`packages/metadata/src/functions.ts\``,
  ]

  return `## Target

- **VueUse**: \`${fn.name}\` — package \`@vueuse/${fn.pkg}\` — [docs](https://vueuse.org/${fn.pkg}/${fn.name}/) — source \`${fn.dir}\`
- **reaxuse**: \`${reaxuseFile}\`, exported from \`@reaxuse/${fn.pkg}\`
- ${statusLine}

## Upstream API

<!-- extracted from upstream index.ts + index.md frontmatter -->

${apiLines || '- (see mapping files)'}

## Mapping files

<!-- the exact upstream files this port is mapped FROM (resolved per function) -->

Map from (\`${fn.dir}/\`):

${mapFrom}

Map to (reaxuse):

- \`${reaxuseFile}\` — implementation
- \`packages/${fn.pkg}/src/${fn.name}.test.tsx\` — mirrored tests (vitest-browser-react)
- \`${docsDir}/index.md\` + \`${docsDir}/demo.tsx\` — docs page + demo (co-located per function, mirroring upstream)

## Expected implementation

<!-- COMPLETED DYNAMICALLY during mapping (not generated): the full
     side-by-side implementation. The VueUse side below is prefilled from
     upstream docs; the reaxuse side must be written by the mapper — it
     generally mirrors the VueUse shape 1:1, but React differences
     (state/effect/refs, SSR, options handling) are expected and should be
     reflected here. -->

${usageBlock}

## Mapping notes

<!-- React-flavored mapping decisions for THIS function only -->

- ${notes.join('\n- ')}

## Acceptance criteria

${acceptance.join('\n')}

## Size estimate

- upstream \`index.ts\` LOC: \`${fn.loc}\` → **\`${fn.size}\`**
- factors: ${[fn.category, fn.externalDeps.length ? 'external deps' : '', fn.hasComponent ? 'component variant' : '', fn.hasDirective ? 'directive variant' : ''].filter(Boolean).join(' · ') || '—'}
`
}

function utilsIssueBody(): string {
  return `## Target

- **VueUse**: \`shared/utils\` (internal utility folder: \`isClient\`, \`isIOS\`, \`noop\`, \`toValue\`, \`now\`, \`timestamp\`, …) — package \`@vueuse/shared\` — source \`source/vueuse/packages/shared/utils\`
- **reaxuse**: \`packages/shared/src/utils.ts\` (or per-utility files), exported from \`@reaxuse/shared\`
- **Status**: ☐ todo · ☐ in progress · ☐ done

## Mapping files

Map from (\`source/vueuse/packages/shared/utils/\`):

- \`index.ts\` — barrel re-exporting all internal utilities
- \`is.ts\` / \`general.ts\` / \`filters.ts\` / \`vue.ts\` / \`port.ts\` / \`types.ts\`
- \`index.test.ts\` / \`index.server.test.ts\` — upstream tests to mirror

Map to (reaxuse):

- \`packages/shared/src/utils.ts\` — implementation
- \`packages/shared/src/utils.test.tsx\` — mirrored tests (vitest-browser-react)
- \`packages/shared/utils/index.md\` — docs page (single page for the group)

## Expected implementation

\`\`\`tsx
// vueuse — @vueuse/shared
isClient · noop · toValue

// reaxuse — @reaxuse/shared
// TODO: port the shared utility helpers above — plain TS, no React state
\`\`\`

## Mapping notes

- mostly pure/SSR-safe helpers — no React state; plain TS re-export port
- keep the same export names so \`@reaxuse/core\` imports map 1:1

## Acceptance criteria

- [ ] implementation \`packages/shared/src/utils.ts\` + re-export from \`packages/shared/src/index.ts\`
- [ ] test \`packages/shared/src/utils.test.tsx\` (vitest-browser-react), mirroring the upstream test files
- [ ] docs page \`packages/shared/utils/index.md\`
- [ ] docs page references the upstream mapping files (source + tests)
- [ ] \`npm run update\` — refresh \`meta/functions.md\`, \`packages/functions.md\`, \`packages/metadata/src/functions.ts\`

## Size estimate

- upstream group LOC: \`${(() => {
  const d = join(root, UPSTREAM, 'packages/shared/utils')
  let n = 0
  for (const f of ['index.ts', 'is.ts', 'general.ts', 'filters.ts', 'vue.ts', 'port.ts', 'types.ts']) {
    const p = join(d, f)
    if (existsSync(p))
      n += readFileSync(p, 'utf-8').split(/\r?\n/).length
  }
  return n
})()}\` → **\`size:XXL\`**
- factors: many small utilities · one group issue
`
}

function allIssues(): Array<{ title: string, labels: string[], body: string }> {
  const fns = scanFunctions()
  const issues = fns.map(fn => ({
    title: titleFor(fn),
    labels: [`@reaxuse/${fn.pkg}`, fn.size],
    body: bodyFor(fn),
  }))
  issues.push({
    title: 'Mapping | `shared/utils` | Internal shared utility helpers',
    labels: ['@reaxuse/shared', 'size:XXL'],
    body: utilsIssueBody(),
  })
  issues.sort((a, b) => a.title.localeCompare(b.title))
  return issues
}

const OUT_DIR = join(root, '.issues')

function render(issues: Array<{ title: string, labels: string[], body: string }>, filter?: string[]): string[] {
  rmSync(OUT_DIR, { recursive: true, force: true })
  mkdirSync(OUT_DIR, { recursive: true })
  const rendered: string[] = []
  for (const issue of issues) {
    if (filter && !filter.some(f => issue.title.startsWith(f)))
      continue
    const file = join(OUT_DIR, `${issue.title.replace(/[^\w@()-]+/g, '_')}.md`)
    writeFileSync(file, issue.body)
    rendered.push(file)
  }
  return rendered
}

function create(issue: { title: string, labels: string[], body: string }): string {
  const file = join(OUT_DIR, `${issue.title.replace(/[^\w@()-]+/g, '_')}.md`)
  writeFileSync(file, issue.body)
  const out = execFileSync('gh', [
    'issue',
    'create',
    '--repo',
    REPO,
    '--title',
    issue.title,
    '--label',
    issue.labels.join(','),
    '--body-file',
    file,
  ], { encoding: 'utf-8' })
  return out.trim()
}

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const debug = args.includes('--debug')
const names = (args.find(a => a.startsWith('--names=')) || '').replace('--names=', '').split(',').filter(Boolean)

if (debug) {
  const fns = scanFunctions()
  console.log(`[debug] scanned ${fns.length} functions`)
  const byPkg = new Map<string, number>()
  for (const fn of fns)
    byPkg.set(fn.pkg, (byPkg.get(fn.pkg) || 0) + 1)
  console.log([...byPkg.entries()].map(([k, v]) => `${k}:${v}`).join(' '))
  console.log(fns.slice(0, 5).map(f => titleFor(f)).join('\n'))
  const needle = 'Mapping | `useNow` |'
  const hit = fns.filter(f => titleFor(f).startsWith(needle))
  console.log(`[debug] startsWith '${needle}' hits: ${hit.length}`)
}
else if (dry) {
  const issues = allIssues()
  const files = render(issues, names.length ? names.map(n => `Mapping | \`${n}\` |`) : undefined)
  console.log(`[dry-run] rendered ${files.length}/${issues.length} bodies to ${OUT_DIR}`)
  if (files.length > 0)
    console.log(readFileSync(files[0], 'utf-8'))
}
else {
  const issues = allIssues()
  const picked = names.length
    ? issues.filter(i => names.some(n => i.title.includes(`| \`${n}\` |`)))
    : issues
  console.log(`[create] ${picked.length} issues → ${REPO}`)
  const created: Array<{ title: string, url: string }> = []
  const failed: string[] = []
  for (const issue of picked) {
    try {
      const url = create(issue)
      created.push({ title: issue.title, url })
      console.log(`  ✓ ${issue.title} → ${url}`)
    }
    catch (e) {
      failed.push(issue.title)
      console.error(`  ✗ ${issue.title}: ${(e as Error).message.split('\n')[0]}`)
    }
  }
  console.log(`\n[result] created ${created.length}, failed ${failed.length}`)
  if (failed.length)
    console.log(`failed: ${failed.join(', ')}`)
}
