import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  title: 'reaxuse',
  description: 'Reactive utilities for React — an experimental 1:1 AI-mapped port of VueUse',
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/reaxuse.svg', type: 'image/svg+xml' }],
  ],
  // Note: no @vitejs/plugin-react here — vitepress bundles vite 5 and Vite's
  // built-in esbuild transforms .tsx with the automatic JSX runtime. React
  // demos are mounted client-side by the theme's DemoContainer component.
  themeConfig: {
    logo: '/reaxuse.svg',
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Functions', link: '/functions' },
      { text: 'Architecture', link: '/architecture' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
          ],
        },
      ],
      '/core/': [
        {
          text: 'Core',
          items: [
            { text: 'useToggle', link: '/core/useToggle' },
            { text: 'useCounter', link: '/core/useCounter' },
            { text: 'useNow', link: '/core/useNow' },
          ],
        },
      ],
    },
    footer: {
      message: 'Released under the MIT License.',
    },
  },
})
