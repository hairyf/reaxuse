import type { HeadConfig, TransformContext } from 'vitepress'
import type { CommitInfo } from './plugins/changelog'
import type { ContributorInfo } from './plugins/contributors'
import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { withPwa } from '@vite-pwa/vitepress'
import UnoCSSPostCSS from 'unocss/postcss'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitepress'
import { currentVersion } from '../../meta/versions'
import { functions } from '../../packages/metadata/src/functions'
import { ChangeLog } from './plugins/changelog'
import { Contributors } from './plugins/contributors'
import { MarkdownTransform } from './plugins/markdownTransform'
import { PWAVirtualModule } from './plugins/pwa-virtual'

/**
 * VitePress config for the reaxuse docs site (docs root = `packages/`,
 * mirroring VueUse's `packages/.vitepress/config.ts`).
 */

// Changelog data: last 50 commits (offline, deterministic).
function getCommits(): CommitInfo[] {
  try {
    const raw = execSync('git log --pretty=format:%H%x09%s%x09%ad --date=short -50', { encoding: 'utf-8' })
    return raw.split('\n').filter(Boolean).map((line) => {
      const [sha, message, date] = line.split('\t')
      return { sha, message, date }
    })
  }
  catch {
    return []
  }
}

// Per-function contributors, derived from git history of the function file
// (mirrors VueUse, which derives them from the function directory history).
function getFunctionContributors(): Record<string, ContributorInfo[]> {
  const result: Record<string, ContributorInfo[]> = {}
  for (const fn of functions) {
    try {
      const raw = execSync(`git log --pretty=format:%an%x09%ae --follow -- "${fn.file}"`, { encoding: 'utf-8' })
      const byEmail = new Map<string, { name: string, email: string, commits: number }>()
      for (const line of raw.split('\n').filter(Boolean)) {
        const [name, email] = line.split('\t')
        const key = (email || name).toLowerCase()
        const entry = byEmail.get(key)
        if (entry) {
          entry.commits += 1
        }
        else {
          byEmail.set(key, { name, email, commits: 1 })
        }
      }
      result[fn.name] = [...byEmail.values()].map(a => ({
        name: a.name,
        avatar: `https://www.gravatar.com/avatar/${createHash('md5').update(a.email.trim().toLowerCase()).digest('hex')}?d=retro`,
        login: a.name.replace(/\s+/g, ''),
        url: '',
        commits: a.commits,
      }))
    }
    catch {
      result[fn.name] = []
    }
  }
  return result
}

// Sidebar groups, mirroring VueUse's `getFunctionsSideBar()`: every function
// docs page (packages/<pkg>/<fn>/index.md) is grouped by its `category`
// frontmatter, in VueUse's canonical category order (addon categories last).
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

interface DocsFunction {
  name: string
  pkg: string
  category: string
}

function getDocsFunctions(): DocsFunction[] {
  const docsRoot = resolve(__dirname, '..')
  const result: DocsFunction[] = []
  for (const pkg of ['core', 'shared', 'math', 'integrations']) {
    const pkgDir = resolve(docsRoot, pkg)
    for (const entry of readdirSync(pkgDir, { withFileTypes: true })) {
      if (!entry.isDirectory())
        continue
      let category = ''
      try {
        // YAML frontmatter may quote the category (e.g. `category: '@Math'`).
        const categoryLine = readFileSync(resolve(pkgDir, entry.name, 'index.md'), 'utf-8').split('\n').find(line => line.startsWith('category:'))
        category = (categoryLine?.slice('category:'.length) ?? '').trim().replace(/^['"]|['"]$/g, '')
      }
      catch {
        // not a docs function directory — no index.md
      }
      if (category)
        result.push({ name: entry.name, pkg, category })
    }
  }
  return result
}

function getFunctionsSideBar() {
  const groups = new Map<string, DocsFunction[]>()
  for (const fn of getDocsFunctions()) {
    const list = groups.get(fn.category) ?? []
    list.push(fn)
    groups.set(fn.category, list)
  }
  return [...groups.entries()]
    .sort(([a], [b]) => {
      const ai = CATEGORY_ORDER.indexOf(a)
      const bi = CATEGORY_ORDER.indexOf(b)
      return (ai === -1 ? Number.POSITIVE_INFINITY : ai) - (bi === -1 ? Number.POSITIVE_INFINITY : bi) || a.localeCompare(b)
    })
    .map(([category, fns]) => ({
      // Addon categories carry a leading `@` in frontmatter (mirroring
      // VueUse's addon naming); strip it for display, like VueUse's nav.
      text: category.startsWith('@') ? category.slice(1) : category,
      items: fns
        .sort((x, y) => x.name.localeCompare(y.name) || x.pkg.localeCompare(y.pkg))
        .map(fn => ({ text: fn.name, link: `/${fn.pkg}/${fn.name}/` })),
    }))
}

// Guide pages (mirrors VueUse's `Guide` links, adapted to reaxuse's pages).
const Guide = [
  { text: 'Introduction', link: '/guide/' },
  { text: 'Installation', link: '/guide/installation' },
  { text: 'Architecture', link: '/guide/architecture' },
  { text: 'Mapping Issue Template', link: '/guide/mapping-issue-template' },
]

// Function categories present in the docs, in VueUse's canonical order
// (core categories first, `@`-prefixed addon categories last).
function getCategoryNames() {
  const core: string[] = []
  const addons: string[] = []
  const seen = new Set<string>()
  for (const fn of getDocsFunctions()) {
    if (seen.has(fn.category))
      continue
    seen.add(fn.category)
    ;(fn.category.startsWith('@') ? addons : core).push(fn.category)
  }
  core.sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b) || a.localeCompare(b))
  addons.sort()
  return { core, addons }
}

const { core: coreCategoryNames, addons: addonCategoryNames } = getCategoryNames()

// Category anchors on /functions (e.g. /functions#category=State), mirroring
// VueUse's CoreCategories / AddonCategories nav + sidebar entries.
const CoreCategories = coreCategoryNames.map(c => ({
  text: c,
  activeMatch: '___', // never active — these are anchors on /functions
  link: `/functions#category=${c}`,
}))

const AddonCategories = addonCategoryNames.map(c => ({
  text: c.slice(1),
  activeMatch: '___',
  link: `/functions#category=${encodeURIComponent(c)}`,
}))

// The default sidebar shown on guide pages, mirroring VueUse's DefaultSideBar.
const DefaultSideBar = [
  { text: 'Guide', items: Guide },
  { text: 'Core Functions', items: CoreCategories },
  { text: 'Add-ons', items: AddonCategories },
]

// Routes to precache in the service worker (virtual:pwa), mirroring
// VueUse's packageNames entries.
const packageNames: [string, { url: string, hash: string }][] = [
  ['/', { url: '/index.html', hash: '' }],
  ['/functions', { url: '/functions.html', hash: '' }],
  ...functions.map(fn => [`${fn.pkg}/${fn.name}`, { url: `/${fn.pkg}/${fn.name}/`, hash: '' }] as [string, { url: string, hash: string }]),
]

// Per-page head additions (og meta), mirroring VueUse's transformHead.ts.
function transformHead(context: TransformContext): HeadConfig[] {
  const title = context.pageData.title ? `${context.pageData.title} | reaxuse` : 'reaxuse'
  return [
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:image', content: '/reaxuse.svg' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
  ]
}

const FunctionsSideBar = getFunctionsSideBar()

export default withPwa(defineConfig({
  lang: 'en-US',
  title: 'reaxuse',
  description: 'Reactive utilities for React — an experimental 1:1 AI-mapped port of VueUse',
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/reaxuse.svg', type: 'image/svg+xml' }],
    ['meta', { property: 'og:description', content: 'Reactive utilities for React — an experimental 1:1 AI-mapped port of VueUse' }],
  ],
  transformHead,
  // Note: no @vitejs/plugin-react here — Vite's built-in esbuild transforms
  // .tsx with the automatic JSX runtime. React demos are mounted client-side
  // by the theme's DemoContainer component.
  vite: {
    // Cast: vitepress bundles its own vite copy, so its PluginOption type
    // differs structurally from the root vite types our plugins import.
    plugins: [
      ChangeLog(getCommits()),
      Contributors(getFunctionContributors()),
      PWAVirtualModule(packageNames),
      MarkdownTransform(functions),
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'injectManifest',
        srcDir: '.vitepress',
        filename: 'sw.ts',
        injectManifest: {
          // Explicit esnext target: the inherited mixed build target makes
          // esbuild try to lower destructuring in workbox v7's sw bundle,
          // which it refuses to do ("Transform failed ... not supported yet").
          target: 'esnext',
          // The sw build runs its own bundling step; `virtual:pwa` must be
          // resolved there, so the module plugin is wired into this build too.
          plugins: [PWAVirtualModule(packageNames)],
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          maximumFileSizeToCacheInBytes: 10_000_000,
        },
        manifest: {
          name: 'reaxuse',
          short_name: 'reaxuse',
          description: 'Reactive utilities for React — an experimental 1:1 AI-mapped port of VueUse',
          theme_color: '#3b82f6',
          icons: [
            { src: '/reaxuse.svg', sizes: 'any', type: 'image/svg+xml' },
          ],
        },
      }),
    ] as any,
    // UnoCSS via its PostCSS plugin (the unocss vite plugin is a no-op under
    // this repo's vite 8.2.2): the `@unocss default;` directive in
    // theme/styles/demo.css expands the utility classes used by the demos.
    css: {
      postcss: {
        plugins: [UnoCSSPostCSS()],
      },
    },
  },
  themeConfig: {
    logo: '/reaxuse.svg',
    nav: [
      {
        text: 'Guide',
        items: [
          { text: 'Guide', items: Guide },
        ],
      },
      {
        text: 'Functions',
        items: [
          { text: 'All Functions', link: '/functions' },
          { text: 'Core', items: CoreCategories },
          { text: 'Add-ons', items: AddonCategories },
        ],
      },
      { text: 'Architecture', link: '/guide/architecture' },
    ],
    sidebar: {
      '/guide/': DefaultSideBar,
      '/functions': FunctionsSideBar,
      '/core/': FunctionsSideBar,
      '/shared/': FunctionsSideBar,
      '/math/': FunctionsSideBar,
      '/integrations/': FunctionsSideBar,
    },
    footer: {
      message: `Released under the MIT License. ${currentVersion}`,
    },
  },
}))
