/* eslint-disable no-console */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as metadata from '@reause/metadata'
import { getTypeDefinition } from '../../scripts/utils'
import { rewriteFunctionLinks } from './rewrite-function-links'

type FunctionInvocation = 'AUTO' | 'EXTERNAL' | 'EXPLICIT_ONLY'

interface FunctionReference {
  name: string
  description: string
  reference: string
}

const r = (path: string) => fileURLToPath(new URL(path, import.meta.url))

const SKILL_DIR = r('./skills/reause-functions')
const SKILL_COPY_DIR = r('../../skills/reause-functions')
const SKILL_REFERENCE_DIR = './references'
const SKILLS_TEMPLATE_PATH = r('./templates/reause-functions-skills.md')
const reause_ROOT = r('../..')

// Port of VueUse's `EXPLICIT_ONLY_FUNCTIONS` (`get` / `set` / `toRef`). reause
// exports no such escape hatch — the low-level state readers/writers
// (`toValue` / `writeState`) are documented as ordinary utilities on the
// shared `utils` page — so no page is explicit-only today. The hook is kept so
// that a future export can be marked here, exactly like upstream.
const EXPLICIT_ONLY_FUNCTIONS = new Set<string>([])

;(async () => {
  const categories = await prepareFunctionReferences(SKILL_DIR)
  const functionsTable = prepareFunctionsTable(categories)

  // Generate main skills markdown
  let templateContent = readFileSync(SKILLS_TEMPLATE_PATH, 'utf-8')
  templateContent = templateContent.replace('<!-- FUNCTIONS_TABLE_PLACEHOLDER -->', functionsTable)

  const outputPath = path.join(SKILL_DIR, 'SKILL.md')
  writeFileSync(outputPath, templateContent)

  console.log(`Generated skills documentation at: ${outputPath}`)

  // Copy to project root skills directory
  // Remove first, `cpSync` merges and would leave behind files no longer in the source
  rmSync(SKILL_COPY_DIR, { recursive: true, force: true })
  cpSync(SKILL_DIR, SKILL_COPY_DIR, { recursive: true })
  console.log(`Copied skills to: ${SKILL_COPY_DIR}`)
})()

// Utils

async function prepareFunctionReferences(outDir: string, referenceDir = SKILL_REFERENCE_DIR): Promise<Record<string, FunctionReference[]>> {
  // Regenerate from scratch so references of removed functions don't linger
  const outReferenceDir = path.join(outDir, referenceDir)
  rmSync(outReferenceDir, { recursive: true, force: true })
  mkdirSync(outReferenceDir, { recursive: true })

  const categories: Record<string, FunctionReference[]> = {}

  for (const category of metadata.categoryNames) {
    if (category.startsWith('_'))
      continue

    const refs: FunctionReference[] = []

    // `metadata.pages` is the page-level registry: one entry per
    // `packages/<pkg>/<page>/index.md`, named after the page directory like
    // VueUse's directory-driven metadata (so `useBreakpoints` covers
    // `breakpointsTailwind` & co. — one reference per documented page).
    const functions = metadata.pages.filter(i => i.category === category && !i.internal)
    for (const fn of functions) {
      const description = rewriteFunctionLinks(toTitleCase(fn.description?.replace(/\|/g, '\\|') ?? ''), `${referenceDir.replace(/^\.\//, '')}/`)

      // VueUse short-circuits to the package name for ecosystem functions
      // (`fn.external`); reause documents every function locally, so each
      // page resolves to its own markdown file.
      const docPath = path.join(reause_ROOT, fn.doc)
      if (existsSync(docPath)) {
        const outputPath = path.join(referenceDir, `${fn.name}.md`)
        const docContent = await genFunctionReference(fn.pkg, fn.name, docPath)
        writeFileSync(path.join(outDir, outputPath), docContent)
        // markdown links always use POSIX separators (`path.join` yields `\`
        // on Windows, which would land in the generated table)
        refs.push({ name: fn.name, description, reference: outputPath.replace(/\\/g, '/') })
      }
      else {
        console.warn(`Missing doc: ${fn.name}`)
      }
    }

    categories[category] = refs
  }
  return categories
}

function prepareFunctionsTable(categories: Record<string, FunctionReference[]>) {
  let table = ''

  for (const [category, functions] of Object.entries(categories)) {
    table += `### ${category}\n\n`
    table += `| Function | Description | Invocation |\n`
    table += `|----------|-------------|------------|\n`

    for (const fn of functions) {
      const invocation = resolveFunctionInvocation(fn.name, category)
      table += `| [\`${fn.name}\`](${fn.reference}) | ${fn.description} | ${invocation} |\n`
    }
    table += `\n`
  }

  return table
}

function resolveFunctionInvocation(name: string, category: string): FunctionInvocation {
  if (EXPLICIT_ONLY_FUNCTIONS.has(name)) {
    return 'EXPLICIT_ONLY'
  }
  if (category.startsWith('@')) {
    return 'EXTERNAL'
  }
  return 'AUTO'
}

function toTitleCase(str: string): string {
  if (!str)
    return str
  const first = str[0]
  if (first < 'a' || first > 'z')
    return str
  return first.toUpperCase() + str.slice(1)
}

async function genFunctionReference(pkg: string, name: string, mdPath: string) {
  const md = rewriteFunctionLinks(readFileSync(mdPath, 'utf-8'), './')
  const types = await getTypeDefinition(pkg, name)
  if (types) {
    return `${md}
## Type Declarations

\`\`\`ts
${types}
\`\`\`
`
  }
  return md
}
