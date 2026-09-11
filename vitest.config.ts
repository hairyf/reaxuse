import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Package exports point at dist (like upstream VueUse), so tests resolve the
    // workspace packages from source — mirrors VueUse's vitest.config.ts aliases.
    alias: {
      '@reause/core': resolve(import.meta.dirname, 'packages/core/index.ts'),
      '@reause/shared': resolve(import.meta.dirname, 'packages/shared/index.ts'),
      '@reause/math': resolve(import.meta.dirname, 'packages/math/index.ts'),
      '@reause/integrations': resolve(import.meta.dirname, 'packages/integrations/index.ts'),
      '@reause/electron': resolve(import.meta.dirname, 'packages/electron/index.ts'),
      '@reause/firebase': resolve(import.meta.dirname, 'packages/firebase/index.ts'),
      '@reause/rxjs': resolve(import.meta.dirname, 'packages/rxjs/index.ts'),
      '@reause/metadata': resolve(import.meta.dirname, 'packages/metadata/src/index.ts'),
    },
    dedupe: ['react', 'react-dom'],
  },
  cacheDir: resolve(import.meta.dirname, 'node_modules/.vite'),
  // the browser-mode optimizer only merges root-level vite `optimizeDeps`
  // (vitest 5), so prebundle react-dom here — vitest-browser-react does
  // `import ReactDOMClient from "react-dom/client"` and the raw CJS client.js
  // has no `default` export to serve un-optimized
  optimizeDeps: {
    include: ['react-dom', 'react-dom/client'],
  },
  test: {
    reporters: 'dot',
    coverage: {
      provider: 'v8',
      // hook packages: barrel at package root + per-hook index.tsx;
      // metadata keeps its generated files under `src/`
      include: ['packages/*/index.ts', 'packages/*/*/index.{ts,tsx}', 'packages/metadata/src/**'],
      reporter: ['text'],
    },
    projects: [
      {
        // hook tests run in real browsers (chromium + webkit) via
        // vitest-browser-react; firefox stays disabled for the same upstream
        // flakiness reason (vitest-dev/vitest#7377)
        extends: true,
        test: {
          name: 'browser',
          // a fresh iframe per test file: the history/location tests mutate
          // `window.location`, and WebKit rate limits `history.replaceState`
          // per document (100 calls / 10 s), so files must not share one
          isolate: true,
          // WebKit under full-suite load needs a longer retry window for the
          // auto-retrying `expect.element` / `expect.poll` assertions
          expect: {
            poll: { timeout: 5000 },
          },
          // Browser tests share one Chromium instance. Running files in parallel
          // makes short debounce/throttle assertions race under CI load.
          fileParallelism: false,
          setupFiles: ['vitest-browser-react', resolve(import.meta.dirname, 'test/setup-browser-url.ts')],
          include: ['packages/**/*.{test,spec}.tsx'],
          browser: {
            enabled: true,
            provider: playwright({
              contextOptions: {
                locale: 'en-US',
                timezoneId: 'UTC',
              },
            }),
            headless: true,
            instances: [
              { browser: 'chromium' },
              { browser: 'webkit' },
              // { browser: 'firefox' }, // flaky FF test: https://github.com/vitest-dev/vitest/issues/7377
            ],
          },
        },
      },
      {
        // structural tests run in plain node
        extends: true,
        test: {
          name: 'exports',
          environment: 'node',
          // build-time tooling (the skills generator) is co-located with its
          // tests, the same way the hooks are — see packages/skills
          include: ['test/*.{test,spec}.ts', 'packages/skills/*.{test,spec}.ts'],
        },
      },
    ],
  },
})
