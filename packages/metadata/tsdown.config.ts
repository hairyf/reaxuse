import { packages } from '../../meta/packages.ts'
import { createTsDownConfig } from '../../tsdown.config.ts'

// metadata keeps its generated files under `src/` (functions.ts / upstream.ts
// are not hooks), so its entry stays `src/index.ts` — unlike the hook
// packages, whose barrel lives at the package root (`index.ts`).
export default {
  ...createTsDownConfig(
    packages.find(pkg => pkg.name === 'metadata')!,
  ),
  entry: ['src/index.ts'],
}
