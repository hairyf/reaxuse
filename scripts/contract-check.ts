/**
 * contract-check.ts — verify every existing hook in packages/{core,shared}/src
 * satisfies the house contracts:
 *   A. naming: ref* upstream → useState*; use*RefHistory upstream → useState*History
 *   B. useState* family returns a React array tuple
 *   C. registered in the package index.ts
 *   D. docs page (index.md) + demo.tsx exist
 *   E. JSDoc carries a "Map from @vueuse/..." mapping
 * Usage: npx tsx scripts/contract-check.ts
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const root = process.cwd()
const PKGS = ['core', 'shared']
const findings: string[] = []

function pkgSrcDir(pkg: string) {
  return join(root, 'packages', pkg, 'src')
}

function extractUpstream(src: string): string | null {
  // accepts "Map from @vueuse/core `useX`", "Map from react-use `useX`",
  // "Map from hairylib `useMounted`", ...
  const m = src.match(/Map from @?[\w-]+(?:\/[\w-]+)?\s+`?([A-Za-z]+)`?/)
  return m ? m[1] : null
}

function exportedHookNames(src: string): string[] {
  const names = new Set<string>()
  for (const m of src.matchAll(/export\s+function\s+(use[A-Z]\w*)\s*(?:<[^>]*>\s*)?\(/g))
    names.add(m[1])
  return [...names]
}

function resolveReturnShape(src: string, ret: string): string {
  // strip generics, resolve a named return type to its declared shape
  const base = ret.replace(/<.*>$/, '').trim()
  if (!/^[A-Z]/.test(base))
    return ret
  const m = src.match(new RegExp(`(?:export\\s+)?(?:type|interface)\\s+${base}\\s*(?:<[^>]*>)?\\s*=\\s*([^;\\n]+)`))
  if (m) {
    const shape = m[1].trim()
    return shape.startsWith('[') ? shape : shape
  }
  return ret
}

function returnTypeOfHook(src: string, hook: string): string | null {
  // match the implementation signature — `export function hook<generics>(params): RET {`
  // (overload declarations have no `{` and are skipped); take the LAST match
  const re = new RegExp(`export function ${hook}[\\s\\S]*?\\)\\s*:\\s*([^\\n{]+?)\\s*\\{`, 'g')
  const matches = [...src.matchAll(re)]
  if (matches.length === 0)
    return null
  return matches[matches.length - 1][1].trim()
}

function namingIssue(hook: string, upstream: string | null): string | null {
  if (!upstream)
    return `${hook}: no "Map from @vueuse/..." found in JSDoc`
  if (upstream.startsWith('ref')) {
    const expected = `useState${upstream.slice(3)}`
    if (hook !== expected)
      return `${hook}: maps from ref* upstream '${upstream}' — must be named '${expected}' (AGENTS.md)`
  }
  else if (/^use\w*RefHistory$/.test(upstream)) {
    // useRefHistory → useStateHistory · useManualRefHistory → useStateManualHistory
    const expected = `useState${upstream.slice(3).replace('RefHistory', 'History')}`
    if (hook !== expected)
      return `${hook}: maps from '${upstream}' — must be named '${expected}' (AGENTS.md)`
  }
  if (hook.startsWith('useState')) {
    const expectedUpstreams: string[] = [`ref${hook.slice('useState'.length)}`]
    if (hook.endsWith('History')) {
      const base = hook.slice('useState'.length, -'History'.length)
      expectedUpstreams.push(`use${base}RefHistory`)
    }
    if (!expectedUpstreams.includes(upstream))
      return `${hook}: useState* name but maps from '${upstream}' (expected ${expectedUpstreams.join(' | ')})`
  }
  return null
}

for (const pkg of PKGS) {
  const srcDir = pkgSrcDir(pkg)
  const files = readdirSync(srcDir).filter(f => /^use[A-Z].*\.tsx?$/.test(f) && !f.includes('.test.'))
  const indexSrc = readFileSync(join(srcDir, 'index.ts'), 'utf-8')

  for (const file of files) {
    const full = join(srcDir, file)
    const src = readFileSync(full, 'utf-8')
    const hooks = exportedHookNames(src)
    if (hooks.length === 0)
      continue // helper/utility module, not a hook

    const upstream = extractUpstream(src)

    for (const hook of hooks) {
      const fileHook = file.replace(/\.tsx?$/, '')
      // C. registration
      if (!indexSrc.includes(`export * from './${fileHook}'`))
        findings.push(`${pkg}/${hook}: NOT registered in index.ts`)

      // D. docs + demo
      const md = join(root, 'packages', pkg, fileHook, 'index.md')
      const demo = join(root, 'packages', pkg, fileHook, 'demo.tsx')
      if (!existsSync(md))
        findings.push(`${pkg}/${hook}: missing docs page packages/${pkg}/${fileHook}/index.md`)
      if (!existsSync(demo))
        findings.push(`${pkg}/${hook}: missing demo packages/${pkg}/${fileHook}/demo.tsx`)

      // E. mapping + A. naming
      const naming = namingIssue(hook, upstream)
      if (naming)
        findings.push(naming)

      // B. useState* family must return a tuple
      if (hook.startsWith('useState')) {
        const ret = returnTypeOfHook(src, hook)
        if (ret) {
          const shape = resolveReturnShape(src, ret)
          if (!shape.trim().startsWith('['))
            findings.push(`${pkg}/${hook}: useState* family must return a tuple, got '${ret.trim()}' (resolved '${shape.trim()}')`)
        }
        else {
          findings.push(`${pkg}/${hook}: could not extract return type`)
        }
      }
    }
  }
}

if (findings.length === 0) {
  console.log('contract-check: ALL OK')
}
else {
  console.log(`contract-check: ${findings.length} finding(s)`)
  for (const f of findings)
    console.log(` - ${f}`)
}
