import type { Format, UserConfig } from 'tsdown'
import type { PackageManifest } from './meta/packages.ts'
import process from 'node:process'
import { globSync } from 'tinyglobby'

export const externals = [
  'react',
  'react-dom',
  /@reaxuse\/.*/,
]

/**
 * Shared tsdown config factory, mirroring VueUse's `tsdown.config.ts`
 * (`source/vueuse/tsdown.config.ts`).
 *
 * Differences from upstream:
 * - hooks live at `<hook>/index.tsx` (not `<hook>/index.ts`), so submodule
 *   entries glob `.tsx` files;
 * - the IIFE global is `Reaxuse` and `react`/`react-dom` are mapped to the
 *   `React`/`ReactDOM` globals;
 * - `react/jsx-runtime` is bundled into IIFE builds: React ships no UMD
 *   global for it (its implementation is self-contained, so inlining is safe),
 *   while the ESM build keeps it external;
 * - no `component` entries — reaxuse has no renderless-component concept.
 */
export function createTsDownConfig(
  pkg: PackageManifest,
  copy?: UserConfig['copy'],
  cwd = process.cwd(),
): UserConfig[] {
  const { globals, external, submodules, iife, build, mjs, dts, target = 'es2018' } = pkg

  if (build === false)
    return []

  const iifeName = 'Reaxuse'
  const iifeGlobals = {
    'react': 'React',
    'react-dom': 'ReactDOM',
    '@reaxuse/shared': 'Reaxuse',
    '@reaxuse/core': 'Reaxuse',
    ...(globals || {}),
  }

  const format: Format[] = []
  if (mjs !== false) {
    format.push('es')
  }

  const baseConfig: UserConfig = {
    target,
    dts,
    platform: 'browser',
    deps: {
      neverBundle: [
        ...externals,
        ...(external || []),
      ],
    },
  }

  const configs: UserConfig[] = []

  const functionNames = ['index']
  if (submodules) {
    functionNames.push(...globSync(
      '*/index.tsx',
      { cwd },
    ).map(i => i.split('/')[0]))
  }

  const entry: Record<string, string> = {}

  for (const fn of functionNames) {
    const fnEntry = {
      [fn]: fn === 'index' ? 'index.ts' : `${fn}/index.tsx`,
    }

    if (iife !== false) {
      const BASE_IIFE_CONFIG: UserConfig = {
        ...baseConfig,
        entry: fnEntry,
        format: 'iife',
        globalName: iifeName,
        outputOptions: {
          extend: true,
          globals: iifeGlobals,
        },
        deps: {
          ...baseConfig.deps,
          // React ships no UMD/IIFE global for `react/jsx-runtime`, so it
          // cannot stay external in IIFE builds — inline its self-contained
          // implementation instead. ESM builds keep it external (it is a real
          // ESM module there). `alwaysBundle` is checked before the deps-based
          // externalization, so it wins over the `react` peer-dep rule.
          alwaysBundle: ['react/jsx-runtime'],
        },
      }

      configs.push(
        BASE_IIFE_CONFIG,
        {
          ...BASE_IIFE_CONFIG,
          minify: true,
          outExtensions: () => ({
            js: '.min.js',
          }),
        },
      )
    }

    Object.assign(entry, fnEntry)
  }

  configs.push({
    ...baseConfig,
    entry,
    format,
    copy,
    // VueUse enables tsdown's `attw` (Are The Types Wrong) check here
    // (`profile: 'esm-only'`, `ignoreRules: ['cjs-resolves-to-esm']`), which
    // validates the packed tarball against the package.json `exports` map.
    // reaxuse's `exports` intentionally point at source (`./index.ts`) so the
    // dev/test flow needs no build step — attw would flag every entrypoint
    // (`Internal resolution error ... /@reaxuse/core/index.ts` — the barrel's
    // extensionless `./useXxx` imports cannot be resolved inside a tarball).
    // Once the packages ship dist-based exports, re-enable the check.
  })

  return configs
}
