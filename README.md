<div align="center">

<img src="packages/public/vueuse.svg" width="100" alt="VueUse" style="vertical-align: middle" />
&nbsp;&nbsp; → &nbsp;&nbsp;
<img src="packages/public/reaxuse.svg" width="100" alt="reaxuse" style="vertical-align: middle" />

# reaxuse

**A React port of VueUse — continuously AI-mapped from the upstream implementation**

[![Status: Experimental](https://img.shields.io/badge/status-experimental-orange)](https://github.com/hairyf/reaxuse)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> ⚠️ **Experimental (WIP / TODO)**: the base architecture is a 1:1 mirror; hook mapping is in progress.

</div>

## What is this?

`reaxuse` is an experimental React hooks library that aims to be a **1:1 port of [VueUse](https://vueuse.org)**:

- The official [vueuse/vueuse](https://github.com/vueuse/vueuse) repository is referenced as a git submodule (`source/vueuse`) and serves as the single source of truth for mapping
- The package structure mirrors VueUse 1:1, but every API is React-flavored (`useState` / `useEffect` / `useMemo` …)
- AI continuously maps upstream composables to React hooks

See [docs/architecture.md](docs/architecture.md) for the full VueUse → reaxuse architecture mapping.

## Package structure (mirroring VueUse)

| VueUse                                                                                 | reaxuse                 | status                      |
| -------------------------------------------------------------------------------------- | ----------------------- | --------------------------- |
| `@vueuse/core`                                                                         | `@reaxuse/core`         | 🚧 skeleton + example hooks |
| `@vueuse/shared`                                                                       | `@reaxuse/shared`       | 🚧 skeleton                 |
| `@vueuse/integrations`                                                                 | `@reaxuse/integrations` | 🚧 skeleton                 |
| `@vueuse/math`                                                                         | `@reaxuse/math`         | 🚧 skeleton                 |
| `@vueuse/metadata`                                                                     | `@reaxuse/metadata`     | 🚧 skeleton                 |
| `@vueuse/router` / `rxjs` / `electron` / `nuxt` / `firebase` / `components` / `skills` | —                       | ⏳ TODO                     |

## Quick start

```bash
git clone --recurse-submodules https://github.com/hairyf/reaxuse.git
cd reaxuse
npm install
npm run typecheck
```

## Ported examples

- `useToggle` → [`packages/core/src/useToggle.ts`](packages/core/src/useToggle.ts)
- `useCounter` → [`packages/core/src/useCounter.ts`](packages/core/src/useCounter.ts)
- `useNow` → [`packages/core/src/useNow.ts`](packages/core/src/useNow.ts)

## TODO

- [ ] Large-scale AI mapping of all `@vueuse/core` functions
- [ ] `router` / `rxjs` / `electron` / `nuxt` / `firebase` / `components` / `skills` sub-packages
- [ ] Publish to npm (`@reaxuse/*`)

## License

[MIT](LICENSE). VueUse logo from [vueuse/vueuse](https://github.com/vueuse/vueuse) (MIT licensed); the reaxuse logo is a React-colored variant of the same lettering.
