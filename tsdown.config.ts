import type { UserConfig } from 'tsdown'
import type { PackageManifest } from './meta/packages.ts'

export const externals = [
  'react',
  'react-dom',
  /@reaxuse\/.*/,
]

/**
 * Shared tsdown config factory, mirroring VueUse's `tsdown.config.ts`.
 * Each package has its own `tsdown.config.ts` that calls this helper.
 */
export function createTsDownConfig(pkg: PackageManifest): UserConfig {
  return {
    entry: ['src/index.ts'],
    format: ['es'],
    target: 'es2018',
    dts: true,
    platform: 'browser',
    deps: {
      neverBundle: [
        ...externals,
        ...(pkg.external || []),
      ],
    },
  }
}
