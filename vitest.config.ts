import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
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
        // hook tests run in a real browser (chromium) via vitest-browser-react
        extends: true,
        test: {
          name: 'unit',
          // Browser tests share one Chromium instance. Running files in parallel
          // makes short debounce/throttle assertions race under CI load.
          fileParallelism: false,
          setupFiles: ['vitest-browser-react'],
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
