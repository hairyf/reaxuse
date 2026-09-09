import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

// UnoCSS for the docs demos — mirrors VueUse's unocss.config.ts (used by the
// packages/.vitepress docs build), with reaxuse's brand as the `primary`
// color. The co-located React demos (packages/<pkg>/<fn>/demo.tsx) use the
// same UnoCSS utility classes as VueUse's demos; without this config they
// render with browser-default styles.
export default defineConfig({
  shortcuts: {
    'border-main': 'border-$vp-c-divider',
    'bg-main': 'bg-gray-400',
    'bg-base': 'bg-white dark:bg-hex-1a1a1a',
  },
  // Scan scope for the PostCSS plugin: the co-located React demos plus the
  // docs theme. `content.filesystem` (not `pipeline.include`) is what the
  // `@unocss/postcss` plugin globs for classes; leaving it at the `**/*`
  // default would scan the `source/` vueuse submodule and try to load its
  // icon collections (noisy `failed to load icon` warnings).
  content: {
    filesystem: [
      'packages/*/*/demo.tsx',
      'packages/.vitepress/theme/**/*.{ts,vue,css}',
    ],
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  theme: {
    colors: {
      primary: '#3b82f6',
    },
    fontFamily: {
      mono: 'var(--vp-font-family-mono)',
    },
  },
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
