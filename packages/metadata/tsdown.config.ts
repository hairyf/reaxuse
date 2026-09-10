import { packages } from '../../meta/packages.ts'
import { createTsDownConfig } from '../../tsdown.config.ts'

const base = createTsDownConfig(
  packages.find(pkg => pkg.name === 'metadata')!,
)

// metadata keeps its generated files under `src/` (functions.ts / upstream.ts
// are not hooks), so its barrel entry stays `src/index.ts` — unlike the hook
// packages, whose barrel lives at the package root (`index.ts`).
export default base.map(config =>
  Array.isArray(config.format) && config.format.includes('es')
    ? { ...config, entry: { index: 'src/index.ts' } }
    : config,
)
