import { packages } from '../../meta/packages.ts'
import { createTsDownConfig, externals } from '../../tsdown.config.ts'

const base = createTsDownConfig(
  packages.find(pkg => pkg.name === 'integrations')!,
)

export default {
  ...base,
  deps: {
    ...base.deps,
    // focus-trap ships an ambient `declare module` d.ts (no top-level named
    // exports); the d.ts bundler cannot correlate its types and emits broken
    // `undefined` references instead. Keep its declarations as an import.
    // dts.neverBundle replaces the inherited externals, so list them again.
    dts: {
      neverBundle: [
        ...externals,
        ...(base.deps?.dts?.neverBundle || []),
        'focus-trap',
      ],
    },
  },
}
