# Export size

> 🚧 **TODO** — this page is not implemented yet. It will mirror VueUse's
> [Export size](https://vueuse.org/export-size) page: a per-API min+gzipped
> bundle-size table for `@reaxuse/*` packages, generated from the build
> output via `scripts/export-size.ts` (run `npm run build` first, then
> `npm run export-size`).

> Please note this is bundle size for each individual API. Since we have a lot
> of shared utilities underneath each function, importing two different
> functions does NOT necessarily mean the bundle size will be the sum of them
> (usually smaller). Depends on the bundler and minifier you use, the final
> result might vary, this list is for reference only.
