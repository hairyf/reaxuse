import antfu from '@antfu/eslint-config'

/**
 * ESLint flat config mirroring VueUse's `eslint.config.js`
 * (https://github.com/vueuse/vueuse/blob/main/eslint.config.js) via
 * `@antfu/eslint-config`. Differences:
 * - `pnpm: true` → npm workspaces, so the flag is omitted.
 * - `patches/` ignore → `source/` (upstream submodule) and `playgrounds/`.
 * - self-import guard is scoped to package `src` files (a source file must
 *   not import its own package by name — use relative imports), while
 *   co-located demos/tests/docs import the public package name on purpose.
 */
export default antfu(
  {
    formatters: true,
    ignores: [
      'source/**',
      'playgrounds/**',
      '**/skills/**',
      '**/types',
      '**/cache',
      '**/dist',
      'coverage/**',
      '.issues/**',
      '**/*.svg',
    ],
  },
  {
    rules: {
      'spaced-comment': ['error', 'always', { exceptions: ['#__PURE__', '///'] }],
    },
  },
  {
    files: ['packages/*/src/**'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: ['@reaxuse/*'],
      }],
    },
  },
)
