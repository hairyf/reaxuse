import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'
import ts from 'typescript'

/**
 * Type Declaration extraction for function docs pages.
 *
 * React adaptation of VueUse's auto-generated `## Type Declarations` sections:
 * instead of copying types by hand into each `index.md`, the compiler AST of the
 * hook's source module (`packages/<pkg>/<Fn>/index.tsx`) is walked and every public
 * declaration (function signatures, interfaces, type aliases, enums, exported
 * consts) is printed as a clean `export` block. Types surfacing in those
 * signatures that are imported from other reause modules — or local non-exported
 * helper aliases — are resolved and inlined, mirroring what a bundled `.d.ts`
 * would contain (and what the hand-written sections used to show).
 *
 * This is intentionally a shallow parse: single source files via the TypeScript
 * compiler API (no program / type-checking), imports followed up to a small
 * depth with cycle guards.
 *
 * Function bodies and const initializers are stripped (signature-only, `.d.ts`
 * style); overload implementations are dropped and default parameter values
 * become optional markers.
 */

const printer = ts.createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed })
const MAX_DEPTH = 5

const sourceCache = new Map<string, ts.SourceFile>()
const walkedModules = new Set<string>()
const walkedRefs = new Set<string>()

function parse(file: string): ts.SourceFile | undefined {
  const cached = sourceCache.get(file)
  if (cached)
    return cached
  if (!existsSync(file))
    return undefined
  const sf = ts.createSourceFile(file, readFileSync(file, 'utf-8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  sourceCache.set(file, sf)
  return sf
}

function isExported(node: ts.Node): boolean {
  return (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0
}

function isTypeDecl(stmt: ts.Statement): stmt is ts.InterfaceDeclaration | ts.TypeAliasDeclaration | ts.EnumDeclaration {
  return ts.isInterfaceDeclaration(stmt) || ts.isTypeAliasDeclaration(stmt) || ts.isEnumDeclaration(stmt)
}

/** Declaration names of an exported statement (handles destructuring consts). */
function declarationNames(stmt: ts.Statement): string[] {
  const names: string[] = []
  if ((ts.isFunctionDeclaration(stmt) || ts.isInterfaceDeclaration(stmt)
    || ts.isTypeAliasDeclaration(stmt) || ts.isEnumDeclaration(stmt)
    || ts.isClassDeclaration(stmt) || ts.isModuleDeclaration(stmt)) && stmt.name) {
    names.push(stmt.name.text)
  }
  else if (ts.isVariableStatement(stmt)) {
    for (const d of stmt.declarationList.declarations) {
      if (ts.isIdentifier(d.name)) {
        names.push(d.name.text)
      }
      else if (ts.isObjectBindingPattern(d.name) || ts.isArrayBindingPattern(d.name)) {
        for (const el of d.name.elements) {
          if (ts.isBindingElement(el) && ts.isIdentifier(el.name))
            names.push(el.name.text)
        }
      }
    }
  }
  return names
}

/** Exported declarations of a file: name -> statements. */
function exportedDecls(sf: ts.SourceFile): Map<string, ts.Statement[]> {
  const map = new Map<string, ts.Statement[]>()
  for (const stmt of sf.statements) {
    if (ts.isImportDeclaration(stmt) || ts.isExportDeclaration(stmt) || !isExported(stmt))
      continue
    for (const n of declarationNames(stmt))
      map.set(n, [...(map.get(n) ?? []), stmt])
  }
  return map
}

/** Non-exported local type declarations by name (interfaces, aliases, enums). */
function localTypeDecls(sf: ts.SourceFile): Map<string, ts.Statement> {
  const map = new Map<string, ts.Statement>()
  for (const stmt of sf.statements) {
    if (isExported(stmt) || !isTypeDecl(stmt) || !stmt.name)
      continue
    map.set(stmt.name.text, stmt)
  }
  return map
}

function resolveImport(fromFile: string, specifier: string): string | undefined {
  if (!specifier.startsWith('.'))
    return undefined
  const target = resolve(join(fromFile, '..'), specifier)
  // Hook dirs make the bare target a *directory* (packages/<pkg>/<hook>/),
  // so candidates must resolve to actual files — reading a directory is EISDIR.
  const candidates = [target, `${target}.ts`, `${target}.tsx`, join(target, 'index.ts'), join(target, 'index.tsx')]
  return candidates.find(c => existsSync(c) && statSync(c).isFile())
}

/**
 * Type declarations imported by a file via `import type { X } from './other'` /
 * `import { X } from './other'` (named + namespace), resolved one hop into the
 * target module's own exported declarations.
 */
function importedTypeDecls(sf: ts.SourceFile): Map<string, ts.Statement> {
  const map = new Map<string, ts.Statement>()
  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt) || !stmt.importClause || !ts.isStringLiteral(stmt.moduleSpecifier))
      continue
    const target = resolveImport(sf.fileName, stmt.moduleSpecifier.text)
    const tsf = target ? parse(target) : undefined
    if (!tsf)
      continue
    const fromExports = exportedDecls(tsf)
    const named = stmt.importClause.namedBindings
    if (named && ts.isNamespaceImport(named)) {
      for (const ds of fromExports.values()) {
        for (const d of ds) {
          if (isTypeDecl(d))
            map.set(declarationNameOf(d), d)
        }
      }
    }
    else if (named && ts.isNamedImports(named)) {
      for (const el of named.elements) {
        const ds = fromExports.get(el.name.text)
        if (ds && isTypeDecl(ds[0]))
          map.set(el.name.text, ds[0])
      }
    }
  }
  return map
}

function declarationNameOf(stmt: ts.Statement): string {
  return declarationNames(stmt)[0] ?? ''
}

/**
 * Render a top-level statement as a `.d.ts`-style snippet.
 * Returns `null` for statements that must not appear (overload implementations).
 */
function formatDecl(stmt: ts.Statement): string | null {
  if (ts.isFunctionDeclaration(stmt)) {
    if (stmt.name && stmt.body) {
      const hasOverloads = stmt.getSourceFile().statements.some(s =>
        ts.isFunctionDeclaration(s) && !s.body && s.name?.text === stmt.name?.text)
      if (hasOverloads)
        return null
    }
    const params = stmt.parameters.map((p) => {
      if (p.initializer && !p.questionToken) {
        return ts.factory.updateParameterDeclaration(
          p,
          p.modifiers,
          p.dotDotDotToken,
          p.name,
          ts.factory.createToken(ts.SyntaxKind.QuestionToken),
          p.type,
          undefined,
        )
      }
      return p
    })
    const sig = ts.factory.createFunctionDeclaration(
      stmt.modifiers,
      stmt.asteriskToken,
      stmt.name,
      stmt.typeParameters,
      params,
      stmt.type,
      undefined,
    )
    return printer.printNode(ts.EmitHint.Unspecified, sig, stmt.getSourceFile()).trim()
  }

  if (ts.isVariableStatement(stmt)) {
    const decls = stmt.declarationList.declarations.map((d) => {
      if (!d.initializer)
        return d
      return ts.factory.updateVariableDeclaration(d, d.name, d.exclamationToken, d.type, undefined)
    })
    const vs = ts.factory.updateVariableStatement(stmt, stmt.modifiers, ts.factory.updateVariableDeclarationList(stmt.declarationList, decls))
    return printer.printNode(ts.EmitHint.Unspecified, vs, stmt.getSourceFile()).trim()
  }

  return printer.printNode(ts.EmitHint.Unspecified, stmt, stmt.getSourceFile()).trim()
}

/**
 * Extract the public type declarations of a function module as a TS snippet.
 * `depth` guards against cycles when resolving re-exported/imported types.
 */
export function getTypeDefinitions(srcFile: string, depth = 0): string {
  if (depth > MAX_DEPTH)
    return ''
  const key = `${srcFile}@${depth}`
  if (walkedModules.has(key))
    return ''
  walkedModules.add(key)

  const sf = parse(srcFile)
  if (!sf)
    return ''

  const chunks: string[] = []
  const emitted = new Set<string>()
  const push = (text: string) => {
    const norm = text.endsWith(';') ? text.slice(0, -1) : text
    if (norm && !emitted.has(norm)) {
      emitted.add(norm)
      chunks.push(norm)
    }
  }

  for (const stmt of sf.statements) {
    if (ts.isImportDeclaration(stmt))
      continue
    if (ts.isExportDeclaration(stmt)) {
      // `export { a, b } from './x'` / `export * from './x'` — inline the types.
      if (!stmt.moduleSpecifier || !ts.isStringLiteral(stmt.moduleSpecifier))
        continue
      const target = resolveImport(sf.fileName, stmt.moduleSpecifier.text)
      const tsf = target ? parse(target) : undefined
      if (!tsf)
        continue
      const decls = exportedDecls(tsf)
      const names = ts.isNamedExports(stmt.exportClause!)
        ? stmt.exportClause.elements.map(el => el.propertyName?.text ?? el.name.text)
        : [...decls.keys()]
      for (const name of names) {
        for (const d of decls.get(name) ?? []) {
          const text = formatDecl(d)
          if (text)
            push(text.startsWith('export ') ? text : `export ${text}`)
        }
      }
      continue
    }
    if (!isExported(stmt))
      continue
    const text = formatDecl(stmt)
    if (text)
      push(text)
  }

  // Inline dependent types referenced by the declarations above: local helpers
  // first, then types imported from other reause modules.
  const definedHere = new Set<string>()
  for (const chunk of chunks) {
    for (const m of chunk.matchAll(/^export\s+(?:declare\s+)?(?:type\s+|interface\s+|enum\s+|class\s+|function\s+|const\s+)?([A-Za-z_$][\w$]*)\b/gm))
      definedHere.add(m[1])
  }
  const locals = localTypeDecls(sf)
  const imports = importedTypeDecls(sf)
  for (const chunk of [...chunks]) {
    const mustResolve = new Set<string>()
    for (const ref of chunk.match(/\b[A-Z][\w$]*\b/g) ?? []) {
      if (!definedHere.has(ref))
        mustResolve.add(ref)
    }
    for (const ref of mustResolve) {
      const stmt = locals.get(ref) ?? imports.get(ref)
      if (!stmt)
        continue
      const text = formatDecl(stmt)
      if (!text || definedHere.has(ref))
        continue
      const fromImport = isExported(stmt)
      push(fromImport ? (text.startsWith('export ') ? text : `export ${text}`) : text)
      definedHere.add(ref)
      // Follow the import chain once more so re-exported deps are covered.
      if (fromImport && !walkedRefs.has(`${stmt.getSourceFile().fileName}#${ref}`)) {
        walkedRefs.add(`${stmt.getSourceFile().fileName}#${ref}`)
        const nested = getTypeDefinitions(stmt.getSourceFile().fileName, depth + 1)
        for (const line of nested.split('\n\n')) {
          const name = line.match(/^export\s+\w+\s+([A-Za-z_$][\w$]*)/)?.[1]
          if (name && new RegExp(`(?:^|\\b)${ref}\\b`).test(line) && !definedHere.has(name))
            push(line)
        }
      }
    }
  }

  // Order: type declarations first, then function/const signatures.
  const direct = chunks.filter(c => !/^export (?:function|const|class) /.test(c))
  const sigs = chunks.filter(c => /^export (?:function|const|class) /.test(c))
  return [...new Set([...direct, ...sigs])].join('\n\n')
}

/** `packages/<pkg>/<Fn>/index.tsx` for a docs page dir, when it exists. */
export function findSourceFile(pkg: string, dir: string): string | undefined {
  const base = join(process.cwd(), 'packages', pkg, dir, 'index')
  for (const ext of ['.tsx', '.ts']) {
    if (existsSync(`${base}${ext}`))
      return `${base}${ext}`
  }
  return undefined
}

export function resetTypeCache(): void {
  walkedModules.clear()
  walkedRefs.clear()
  sourceCache.clear()
}
