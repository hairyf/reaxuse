import type { HeadConfig, TransformContext } from 'vitepress'
import type { CommitInfo } from './plugins/changelog'
import type { ContributorInfo } from './plugins/contributors'
import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { withPwa } from '@vite-pwa/vitepress'
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
  },
  themeConfig: {
    logo: '/reaxuse.svg',
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Functions', link: '/functions' },
      { text: 'Architecture', link: '/guide/architecture' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Architecture', link: '/guide/architecture' },
          ],
        },
      ],
      '/core/': [
        {
          text: 'Core',
          items: [
            { text: 'useNow', link: '/core/useNow' },
          ],
        },
      ],
      '/shared/': [
        {
          text: 'Shared',
          items: [
            { text: 'useToggle', link: '/shared/useToggle' },
            { text: 'useCounter', link: '/shared/useCounter' },
          ],
        },
      ],
    },
    footer: {
      message: `Released under the MIT License. ${currentVersion}`,
    },
  },
}))
