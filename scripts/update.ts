import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { format } from 'prettier'
import { globSync } from 'tinyglobby'
import { root } from './utils'

interface MappedFunction {
  name: string
  file: string
  pkg: string
  /** Docs-page directory (`packages/<pkg>/<page>`), shared by every export of that page. */
  dir: string
  /** Docs-page category, read from the co-located index.md frontmatter. */
  category: string
  /** Last commit unix-ms touching the hook source file (for `sort=updated`). */
  lastUpdated?: number
  /**
   * Resolved upstream module (`packages/<pkg>/<dir>`), or `undefined` when no
   * module in the pinned submodule has the export (see `missingFrom`). Resolved
   * per *export* (see `resolveExport`), never by the same-name-directory probe
   * alone — a renamed port (`useLongPress` ← `onLongPress`) or a secondary
   * export of a page (`breakpointsTailwind` ← `useBreakpoints`) must not read as
   * "no upstream". Only consumed by `meta/functions.md`.
   */
  upstream?: string
}

/**
 * Page-level view of the registry — the reause analogue of VueUse's
 * `metadata.functions`, which is keyed by function *directory*
 * (`packages/<package>/<name>/`) rather than by exported symbol. Every
 * export of a page (`useBreakpoints` + `breakpointsTailwind` + …) collapses
 * onto a single entry here, which is what the generated agent skill
 * (`packages/skills/build.ts`) consumes.
 */
interface MappedPage {
  name: string
  pkg: string
  /** Docs page, relative to the repo root (`packages/<pkg>/<page>/index.md`). */
  doc: string
  category: string
  description: string
  /** Not part of the public surface — mirrors VueUse's `listFunctions` `_*` ignore. */
  internal?: boolean
  lastUpdated?: number
}

const RE_EXPORT = /export\s+(?:async\s+)?function\s+(\w+)|export\s+const\s+(\w+)\s*=/g

/** One provenance claim a hook source makes about an export. */
interface UpstreamClaim {
  /**
   * Upstream module the claim names (`packages/<pkg>/<dir>`), or `''` when the
   * claim only names a symbol (the `React port of VueUse's \`x\`` prose form).
   */
  module: string
  /** Upstream symbol the claim names. */
  symbol: string
  /** Offset of the claim in its source file, to pair it with an export. */
  offset: number
}

const RE_MAP_FROM = /Map from @vueuse\/[^\n]*(?:\n[^\n]*)?/g
const RE_PROSE_PORT = /port of VueUse's `([A-Z_]\w*)`/gi

/**
 * Every provenance claim a hook file makes, in source order: the
 * `Map from @vueuse/<pkg> \`<name>\`` form reause documents ports with (also
 * the explicit `source/vueuse/packages/<pkg>/<name>` path form, the slash form
 * `@vueuse/firebase/useAuth` and the bare form `@vueuse/shared watchOnce`), plus
 * the `React port of VueUse's \`<name>\`` prose form some hooks use instead.
 * A file may claim several upstreams (one per export — `useKeyStroke`'s file
 * claims `onKeyStroke`, `onKeyDown`, `onKeyPressed` and `onKeyUp`), so claims
 * keep their offsets and `resolveUpstream` pairs each with its own export.
 */
function parseClaims(content: string): UpstreamClaim[] {
  const claims: UpstreamClaim[] = []
  // The `Map from` marker sits in a JSDoc `*` line; read to the end of that
  // line, plus the next line so a following explicit
  // `(source/vueuse/packages/<pkg>/<name>/...)` reference is seen too.
  for (const match of content.matchAll(RE_MAP_FROM)) {
    const line = match[0]
    const pkg = line.match(/@vueuse\/([a-z0-9-]+)/)?.[1]
    if (!pkg)
      continue
    const path = line.match(/source\/vueuse\/packages\/([a-z0-9-]+)\/([\w-]+)/)
    // The symbol is the token the marker is followed by — `` `onLongPress` ``,
    // `/useAuth` or ` watchOnce`. Read it from that position only: a later
    // backticked mention is context, not the claim (`useWatchPausable` says
    // "Map from @vueuse/shared watchPausable. Upstream wraps `watchWithFilter`"),
    // so scanning the whole window would claim the wrong upstream.
    const tail = line.slice(line.indexOf(`@vueuse/${pkg}`) + `@vueuse/${pkg}`.length)
    const symbol = tail.match(/^\s*`([A-Z_][\w.]*)`/i)?.[1]
      || tail.match(/^\/([\w-]+)/)?.[1]
      || tail.match(/^\s+([\w-]+)/)?.[1]
    claims.push({
      module: path
        ? `packages/${path[1]}/${path[2]}`
        : symbol
          ? `packages/${pkg}/${symbol.replace(/\.ts$/, '')}`
          : '',
      symbol: symbol || path?.[2] || '',
      offset: match.index,
    })
  }
  for (const match of content.matchAll(RE_PROSE_PORT))
    claims.push({ module: '', symbol: match[1], offset: match.index })
  return claims.sort((a, b) => a.offset - b.offset)
}

/**
 * Pair every claim with the export it documents — the first export declared
 * after it. Pairing by offset is what makes a multi-export file resolve per
 * export, and it survives TypeScript overload signatures, which can place the
 * documented implementation *after* the JSDoc block.
 */
function claimsByExport(content: string): Map<string, UpstreamClaim[]> {
  const declarations: { name: string, offset: number }[] = []
  for (const match of content.matchAll(RE_EXPORT))
    declarations.push({ name: match[1] || match[2], offset: match.index })

  const owners = new Map<string, UpstreamClaim[]>()
  for (const claim of parseClaims(content)) {
    const next = declarations.find(declaration => declaration.offset > claim.offset)
    if (!next)
      continue
    const list = owners.get(next.name)
    if (list)
      list.push(claim)
    else
      owners.set(next.name, [claim])
  }
  return owners
}

/**
 * A path relative to a root, slash-normalized (`file` may come from
 * `globSync`, which always reports forward slashes even on Windows).
 */
function relativeTo(rootDir: string, file: string) {
  const dir = rootDir.replace(/\\/g, '/').replace(/\/$/, '')
  return file.replace(/\\/g, '/').replace(`${dir}/`, '')
}

/** The pinned upstream checkout, read-only: `source/vueuse`. */
const UPSTREAM_ROOT = join(root, 'source/vueuse').replace(/\\/g, '/').replace(/\/$/, '')

/** `packages/<pkg>/<dir>` module directories upstream, each mapped to its files. */
let upstreamModules: Map<string, string[]> | undefined
/** Parsed export names per upstream file, filled lazily and shared across lookups. */
const upstreamExports = new Map<string, Set<string>>()

/**
 * Read the upstream tree once and index every module directory against its
 * files: `packages/shared/watchArray/index.ts` and
 * `packages/core/useBreakpoints/breakpoints.ts` both own the directory they
 * live in, so a symbol can be found in the module that actually exports it
 * rather than in a same-name directory that may not exist. `exportsOf` is the
 * shared symbol scanner; every answer is confirmed against the sources.
 */
function collectUpstreamModules() {
  if (upstreamModules)
    return upstreamModules
  const modules = new Map<string, string[]>()
  const files = globSync('packages/{shared,core,integrations,math,rxjs,electron,firebase,router}/**/*.ts', {
    cwd: UPSTREAM_ROOT,
    absolute: true,
    ignore: ['**/*.test.ts'],
  })
  for (const file of files) {
    // The module directory owns its files: `packages/core/useBreakpoints`
    // covers `index.ts` and `breakpoints.ts`, exactly as the table's
    // `source (vueuse)` column is expected to read.
    const module = relativeTo(UPSTREAM_ROOT, file).split('/').slice(0, -1).join('/')
    const owners = modules.get(module)
    if (owners)
      owners.push(file)
    else
      modules.set(module, [file])
  }
  upstreamModules = modules
  return modules
}

function exportsOf(content: string): Set<string> {
  const names = new Set<string>()
  for (const match of content.matchAll(/export\s+(?:async\s+)?(?:function|const|let|var|class|interface|type|enum)\s+(\w+)/g))
    names.add(match[1])
  for (const match of content.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const specifier of match[1].split(',')) {
      // `export { foo as bar }` is exported under `bar`.
      const name = specifier.trim().split(/\s+as\s+/).pop()?.trim() || ''
      if (/^\w+$/.test(name))
        names.add(name)
    }
  }
  return names
}

/** Does the upstream `module` really export `symbol`? (Never assumed.) */
function moduleExports(module: string, symbol: string): boolean {
  for (const file of collectUpstreamModules().get(module) || []) {
    const exports = upstreamExports.get(file) || exportsOf(readFileSync(file, 'utf-8'))
    upstreamExports.set(file, exports)
    if (exports.has(symbol))
      return true
  }
  return false
}

/** Symbols upstream imports from `vue` itself, filled lazily. */
let vueApiSymbols: Set<string> | undefined

/**
 * The symbols VueUse takes from `vue` (`toValue`, `isRef`, …) rather than
 * defining. A reause export of one of these has no module in the pinned
 * submodule, but it was not invented here either — VueUse surfaces Vue's own
 * API through its barrel.
 */
function collectVueApiSymbols() {
  if (vueApiSymbols)
    return vueApiSymbols
  const symbols = new Set<string>()
  for (const files of collectUpstreamModules().values()) {
    for (const file of files) {
      const content = readFileSync(file, 'utf-8')
      for (const match of content.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+['"]vue(?:-demi)?['"]/g)) {
        for (const specifier of match[1].split(',')) {
          const name = specifier.trim().split(/\s+as\s+/).pop()?.trim() || ''
          if (/^\w+$/.test(name))
            symbols.add(name)
        }
      }
    }
  }
  vueApiSymbols = symbols
  return symbols
}

/**
 * The upstream module exporting `name`, searched in the given modules (and
 * only those). Shallower directories win, so a symbol that upstream defines in
 * a module file (`packages/core/useBreakpoints`) is preferred over one that
 * only re-exports it from a nested internal directory.
 */
function findUpstreamModule(modules: string[], name: string): string | undefined {
  const index = collectUpstreamModules()
  const candidates = modules
    .filter(module => index.has(module))
    .sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b))
  return candidates.find(module => moduleExports(module, name))
}

/** The upstream modules of one reause package (`packages/<pkg>/…`). */
function modulesOfPackage(pkg: string): string[] {
  const prefix = `packages/${pkg}/`
  return [...collectUpstreamModules().keys()].filter(module => module.startsWith(prefix))
}

/** What one reause export resolves to, and the claim that decided it. */
interface ResolvedExport {
  /** Resolved upstream module, or `undefined` when the export is reause-only. */
  upstream?: string
  /** Upstream module this export's own annotation names, when it names one. */
  claimed?: string
  /** Whether `claimed` exists upstream and really exports the symbol it names. */
  claimConfirmed: boolean
  /**
   * Why no module in the pinned submodule has this export. Only set when
   * `upstream` is undefined, and it is what keeps the label honest: only
   * `reause-only` means "reause invented this symbol".
   */
  missingFrom?: 'unconfirmed-claim' | 'vue-api' | 'reause-only'
}

/**
 * Resolve the real upstream module of one reause export, in order:
 *
 * 1. the claim the port itself makes for this export — its `Map from` (or
 *    `React port of VueUse's`) annotation, paired by offset — accepted only
 *    when it is materially true (the upstream module exists *and* exports the
 *    symbol the claim names). This is what resolves renames (`useLongPress` ←
 *    `onLongPress`, `useWatchAtMost` ← `watchAtMost`), which a
 *    same-name-directory probe can never see;
 * 2. another module the file claims that exports this symbol under a different
 *    name (`SSRWidthProvider` is reause's React component for the `useSSRWidth`
 *    page) — same confirmation, never "the module merely exists";
 * 3. the page's upstream directory (`packages/<pkg>/<dir>`), confirmed by an
 *    actual export rather than assumed — covers a page's secondary exports;
 * 4. any upstream module of the page's own package (`breakpointsTailwind` is
 *    defined in `useBreakpoints`, `createCookies` in `useCookies`);
 * 5. upstream `shared/utils`, which has one barrel and no per-symbol dirs
 *    (`clamp`, `noop`, `debounceFilter`, …).
 *
 * Anything left has no module in the pinned submodule — either because the port
 * claims an upstream the pin cannot confirm, or because it is genuinely
 * reause-only (`missingFrom` records which, so the status column never calls a
 * Vue API or a post-pin hook "reause-only"). What it never means is "the
 * same-name directory does not exist", which is what the removed probe
 * reported for every renamed and secondary export.
 */
function resolveExport(name: string, pkg: string, dir: string, file: string): ResolvedExport {
  const content = readFileSync(file, 'utf-8')
  const claims = claimsByExport(content)
  const own = claims.get(name) || []
  // The upstream this export's own annotation names, and whether that claim is
  // materially true — surfaced on the row so the structural guard can assert
  // that a `reause-only` verdict is never contradicted by the port's own claim.
  const named = own.find(claim => claim.module)
  const claimed = named?.module
  const claimConfirmed = !!named && moduleExports(named.module, named.symbol)
  const withClaim = (upstream: string | undefined): ResolvedExport => {
    if (upstream)
      return { upstream, claimed, claimConfirmed }
    // No module in the pinned submodule has this export. Say *why*, so the
    // status column stops calling a Vue API or a post-pin hook "reause-only":
    // a claim the pin cannot confirm (`useWebMCP` postdates it; `useWatch` is
    // Vue's own `watch`), or a symbol VueUse itself imports from `vue`
    // (`toValue`) rather than defines.
    return {
      claimed,
      claimConfirmed,
      missingFrom: named ? 'unconfirmed-claim' : collectVueApiSymbols().has(name) ? 'vue-api' : 'reause-only',
    }
  }

  // 1 — the claim this export's own annotation makes.
  if (claimConfirmed)
    return withClaim(claimed)
  for (const claim of own) {
    // The prose form names a symbol without a package: look for the module
    // defining it in the page's own upstream package, then in `shared/utils`.
    if (!claim.module && claim.symbol) {
      const hit = findUpstreamModule(modulesOfPackage(pkg), claim.symbol)
        || findUpstreamModule(['packages/shared/utils'], claim.symbol)
      if (hit)
        return withClaim(hit)
    }
  }
  // 2 — a module the file claims that exports this symbol under another name.
  const sibling = findUpstreamModule([...claims.values()].flat().map(claim => claim.module), name)
  if (sibling)
    return withClaim(sibling)
  // 3 — the page maps onto an upstream directory of the same name.
  const page = `packages/${pkg}/${dir}`
  if (findUpstreamModule([page], name))
    return withClaim(page)
  // 4 — another module of the page's own upstream package.
  const withinPackage = findUpstreamModule(modulesOfPackage(pkg), name)
  if (withinPackage)
    return withClaim(withinPackage)
  // 5 — upstream `shared/utils` (one barrel, no per-symbol directories).
  return withClaim(findUpstreamModule(['packages/shared/utils'], name))
}
function parseExports(file: string): string[] {
  const content = readFileSync(file, 'utf-8')
  const names: string[] = []
  for (const match of content.matchAll(RE_EXPORT)) {
    names.push(match[1] || match[2])
  }
  return names
}

/**
 * Last commit time (ms) of a hook source file, via `git log -1 --format=%at`.
 * Mirrors VueUse's `git.raw(['log', '-1', '--format=%at', tsPath]) * 1000`
 * (metadata/scripts/update.ts). Returns `undefined` when the file is not
 * tracked (or git fails) so callers can fall back gracefully.
 */
function getLastUpdated(file: string): number | undefined {
  try {
    const at = execSync(`git log -1 --format=%at -- "${file}"`, { cwd: root, encoding: 'utf-8' }).trim()
    const seconds = Number(at)
    return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : undefined
  }
  catch {
    return undefined
  }
}

/**
 * Scan every hook package's co-located modules (`packages/<pkg>/<hook>/index.tsx`)
 * and regenerate `meta/functions.md` and `meta/functions.ts` (the structured
 * registry consumed by the docs markdown transformer and the PWA route list),
 * mirroring VueUse's metadata-driven function list.
 */
export async function generateFunctionsMD() {
  const rows = collectFunctionRows().map(({ name, file, upstream, missingFrom }) => {
    // A resolved upstream is a real path; `—` is reserved for exports with no
    // module in the pinned submodule, and the status distinguishes *why*:
    //   - `reause-only export`  — nothing upstream defines or re-exports it;
    //   - `not in pinned submodule` — the port claims an upstream the pin cannot
    //     confirm (`useWebMCP` postdates it, `useWatch` is Vue's `watch`) or the
    //     symbol is one VueUse takes from `vue` (`toValue`).
    // Neither is "no upstream match" for a renamed or secondary export, which is
    // what the removed same-name-directory probe used to report.
    const status = upstream
      ? '✅ ported'
      : missingFrom === 'reause-only' ? '✅ reause-only export' : '✅ ported (not in pinned submodule)'
    return `| \`${name}\` | ${upstream || '—'} | \`${file}\` | ${status} |`
  })

  const md = `# Function mapping status

> Auto-generated by \`npm run update\` (scripts/update.ts) — do not edit by hand.
> The upstream source of truth is the \`source/vueuse\` submodule.
> Export-driven: every row is an export of this repo, so an upstream function with no reause port would simply be absent — this table is a port registry, not a coverage proof (audit procedure: docs/upstream-monitoring.md §3.2).
> Status: \`✅ ported\` = resolved to an upstream module; \`✅ ported (not in pinned submodule)\` = the port's upstream is newer than the pin, or a symbol VueUse re-exports from \`vue\`; \`✅ reause-only export\` = nothing upstream defines or re-exports it.

| VueUse function | source (vueuse) | reause | status |
|---|---|---|---|
${rows.join('\n') || '| — | — | — | no hooks mapped yet |'}
`

  writeFileSync(join(root, 'meta/functions.md'), await format(md, { parser: 'markdown' }))
  console.log(`[update] wrote meta/functions.md (${rows.length} functions)`)
}

/**
 * One `meta/functions.md` row: the reause export, the source file it points at,
 * the resolved upstream module (`undefined` when the export is genuinely
 * reause-only) and the provenance claim the port itself makes for that export.
 * Exported so the structural guard in `test/functions-table.test.ts` can assert
 * the resolver's output directly, rather than only the committed (and lagging)
 * generated table.
 */
export interface FunctionRow extends ResolvedExport {
  name: string
  /** Hook source the row points at, relative to the repo root. */
  file: string
}

export function collectFunctionRows(): FunctionRow[] {
  // `meta/functions.md` carries no `lastUpdated` column, so skip the per-file
  // `git log` probe — it is the only expensive part of the scan.
  return collectFunctions({ lastUpdated: false })
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(fn => ({
      name: fn.name,
      file: fn.file,
      ...resolveExport(fn.name, fn.pkg, fn.dir, join(root, fn.file)),
    }))
}

function collectFunctions(options: { lastUpdated?: boolean } = {}): MappedFunction[] {
  // hooks live co-located with their docs: packages/<pkg>/<hook>/index.tsx
  // (metadata is not scanned — its files are generated, not hooks)
  const files = globSync('packages/{core,shared,math,integrations,electron,firebase,rxjs}/*/index.tsx', {
    cwd: root,
    absolute: true,
  })

  const functions: MappedFunction[] = []
  const seen = new Set<string>()
  for (const file of files) {
    const rel = file.replace(/\\/g, '/')
    const [, pkg, dir] = rel.match(/packages\/(\w+)\/([^/]+)\/index\.tsx$/) || []
    if (!pkg || !dir)
      continue
    const category = getPageCategory(pkg, dir)
    const lastUpdated = options.lastUpdated === false ? undefined : getLastUpdated(`packages/${pkg}/${dir}/index.tsx`)
    for (const name of parseExports(file)) {
      // TypeScript overload signatures export the same name repeatedly —
      // collapse them into a single registry entry per (name, file).
      const key = `${name}\u0000${pkg}/${dir}`
      if (seen.has(key))
        continue
      seen.add(key)
      functions.push({ name, file: `packages/${pkg}/${dir}/index.tsx`, pkg, dir, category, lastUpdated })
    }
  }
  return functions.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Collapse the export-level registry onto docs pages — one entry per
 * `packages/<pkg>/<page>/index.md`, named after the page directory exactly
 * like VueUse's directory-driven metadata (`useBreakpoints` covers
 * `breakpointsTailwind` & co.). Consumed by `packages/skills/build.ts`, which
 * mirrors VueUse's `packages/skills/build.ts` one function page per skill
 * reference.
 */
function collectPages(functions: MappedFunction[]): MappedPage[] {
  const byDir = new Map<string, MappedFunction[]>()
  for (const fn of functions) {
    const key = `${fn.pkg}/${fn.dir}`
    const list = byDir.get(key)
    if (list)
      list.push(fn)
    else
      byDir.set(key, [fn])
  }

  const pages: MappedPage[] = []
  for (const entries of byDir.values()) {
    const { pkg, dir, category, lastUpdated } = entries[0]
    const md = readFileSync(join(root, 'packages', pkg, dir, 'index.md'), 'utf-8')
    pages.push({
      name: dir,
      pkg,
      doc: `packages/${pkg}/${dir}/index.md`,
      category,
      description: extractDescription(md),
      // `_`-prefixed directories are shared internals rather than a documented
      // composable — VueUse's `listFunctions` skips them the same way.
      internal: dir.startsWith('_') || undefined,
      lastUpdated: lastUpdated ? Math.max(...entries.map(e => e.lastUpdated || 0)) : undefined,
    })
  }

  return pages.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Intro sentence of a docs page, used as the skill-table description.
 * Ports VueUse's `readMetadata()` (packages/metadata/scripts/update.ts):
 * drop the frontmatter and `:::` container blocks, take the first paragraph
 * after the `#` heading, then lower-case the leading character unless the
 * description starts with an abbreviation.
 */
function extractDescription(md: string): string {
  const content = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
  const matched = (
    content
      // normalize newlines
      .replace(/\r\n/g, '\n')
      // remove ::: tip blocks
      .replace(/(:{3,}(?=[^:\n]*\n))[^\n]*\n[\s\S]*?\1 *(?=\n)/g, '')
      // remove headers
      .match(/#(?=\s).*\n+(.+?)(?:, |\. |\n|\.\n)/) || []
  )[1] || ''

  const description = matched.trim()
  if (!/^[A-Z][A-Z]/.test(description))
    return description.charAt(0).toLowerCase() + description.slice(1)
  return description
}

/**
 * Write `packages/metadata/src/functions.ts` — the structured function
 * registry (name/pkg/file/category/lastUpdated) consumed by the docs
 * markdown transformer, the PWA route list and the theme's FunctionsList
 * (category filter / search / sort), plus the page-level `pages` view the
 * agent-skill generator consumes. Mirrors VueUse's generated
 * `packages/metadata/metadata.ts`.
 */
async function generateFunctionsTS() {
  // The /functions registry drives sidebar-visible docs pages: keep only
  // functions whose co-located page (index.md) exists, so every entry in
  // the FunctionsList links to a real page (mirrors VueUse's page-driven
  // metadata; the progress table in meta/functions.md keeps all entries).
  const functions = collectFunctions().filter((fn) => {
    const [, pkg, dir] = fn.file.match(/^packages\/(\w+)\/([^/]+)\/index\.tsx$/) || []
    if (!pkg || !dir)
      return false
    try {
      readFileSync(join(root, 'packages', pkg, dir, 'index.md'))
      return true
    }
    catch {
      return false
    }
  })

  const pages = collectPages(functions)

  // Category list in VueUse's canonical order: core categories first,
  // `@`-prefixed addon categories last (mirrors `categoryNames` in
  // vueuse/packages/metadata/metadata.ts).
  const categoryNames = [...new Set(functions.map(fn => fn.category))]
    .sort((a, b) => rankCategory(a) - rankCategory(b) || a.localeCompare(b))

  const ts = `/* eslint-disable style/quotes -- prettier keeps double quotes around descriptions containing an apostrophe */
/**
 * Function registry — auto-generated by \`npm run update\` (scripts/update.ts).
 * Do not edit by hand. Mirrors VueUse's generated
 * \`packages/metadata/metadata.ts\` (react-adapted).
 */
export interface FunctionInfo {
  name: string
  pkg: string
  /** Page directory the export belongs to (\`packages/<pkg>/<dir>\`). */
  dir: string
  file: string
  category: string
  lastUpdated?: number
}

/**
 * Page-level registry: one entry per \`packages/<pkg>/<page>/index.md\`, named
 * after the page directory like VueUse's directory-driven metadata. Consumed
 * by \`packages/skills/build.ts\`.
 */
export interface FunctionPageInfo {
  name: string
  pkg: string
  doc: string
  category: string
  description: string
  internal?: boolean
  lastUpdated?: number
}

export const functions: FunctionInfo[] = ${JSON.stringify(functions, null, 2)}

export const pages: FunctionPageInfo[] = ${JSON.stringify(pages, null, 2)}

export const categoryNames: string[] = ${JSON.stringify(categoryNames, null, 2)}

export const coreCategoryNames = categoryNames.filter(c => !c.startsWith('@'))

export const addonCategoryNames = categoryNames.filter(c => c.startsWith('@'))
`
  writeFileSync(join(root, 'packages/metadata/src/functions.ts'), await format(ts, { parser: 'typescript', singleQuote: true, semi: false, trailingComma: 'all', printWidth: 120, arrowParens: 'avoid' }))
  console.log(`[update] wrote packages/metadata/src/functions.ts (${functions.length} functions, ${pages.length} pages, ${categoryNames.length} categories)`)
}

// Category order mirrors VueUse's `packages/metadata/metadata.ts`
// `categoriesOrder` (addon categories, prefixed with `@`, sort after core).
const CATEGORY_ORDER = [
  'State',
  'Elements',
  'Browser',
  'Sensors',
  'Network',
  'Animation',
  'Component',
  'Watch',
  'Reactivity',
  'Array',
  'Time',
  'Utilities',
]

// Read the docs-page category from the co-located index.md frontmatter
// (packages/<pkg>/<page>/index.md). Returns 'Uncategorized' when the page
// has none or doesn't exist.
function getPageCategory(pkg: string, page: string): string {
  try {
    return readFileSync(join(root, 'packages', pkg, page, 'index.md'), 'utf-8')
      .split('\n')
      .find(line => line.startsWith('category:'))
      ?.slice('category:'.length)
      .trim()
      .replace(/^['"]|['"]$/g, '') || 'Uncategorized'
  }
  catch {
    return 'Uncategorized'
  }
}

// VueUse's canonical category order: known core categories by rank, unknown
// categories after, `@`-prefixed addon categories last.
function rankCategory(c: string): number {
  const i = CATEGORY_ORDER.indexOf(c)
  if (i !== -1)
    return i
  return c.startsWith('@') ? CATEGORY_ORDER.length : CATEGORY_ORDER.length + 1
}

/**
 * Regenerate `packages/functions.md` — the /functions/ docs page.
 * Mirrors VueUse's auto-generated `packages/functions.md`: a thin page that
 * renders the theme's `<FunctionsList />` component (category filter, search
 * and sort driven by `#category=` / `#search=` / `#sort=` hash params, e.g.
 * `/functions#category=State` from the sidebar/nav category links).
 */
async function generateFunctionsPage() {
  const md = `# Functions

<FunctionsList />
`
  writeFileSync(join(root, 'packages/functions.md'), await format(md, { parser: 'markdown' }))
  console.log('[update] wrote packages/functions.md (<FunctionsList />)')
}

async function main() {
  await generateFunctionsMD()
  await generateFunctionsTS()
  await generateFunctionsPage()
}

// Only regenerate when run as the CLI (`npm run update`) — importing this
// module (e.g. from the structural guard in `test/`) must stay side-effect free.
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]))
  main()
