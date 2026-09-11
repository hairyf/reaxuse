<div align="center">

<img src="packages/public/vueuse.svg" width="100" alt="VueUse" style="vertical-align: middle" />
&nbsp;&nbsp; → &nbsp;&nbsp;
<img src="packages/public/reause.svg" width="100" alt="reause" style="vertical-align: middle" />

# reause

**A React port of VueUse — continuously AI-mapped from the upstream implementation**

[![Status: Experimental](https://img.shields.io/badge/status-experimental-orange)](https://github.com/hairyf/reause)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> ✅ **Mapping complete**: the base architecture is a 1:1 mirror and every VueUse composable has a React counterpart.
> The generated [function mapping table](meta/functions.md) tracks each one.

</div>

## What is this?

`reause` is an experimental React hooks library that aims to be a **1:1 port of [VueUse](https://vueuse.org)**:

- The official [vueuse/vueuse](https://github.com/vueuse/vueuse) repository is referenced as a git submodule (`source/vueuse`) and serves as the single source of truth for mapping
- The package structure mirrors VueUse 1:1, but every API is React-flavored (`useState` / `useEffect` / `useMemo` …)
- AI continuously maps upstream composables to React hooks

See [packages/guide/architecture.md](packages/guide/architecture.md) for the full VueUse → reause architecture mapping.

## Package structure (mirroring VueUse)

| VueUse                 | reause                 | status       |
| ---------------------- | ----------------------- | ------------ |
| `@vueuse/core`         | `@reause/core`         | ✅ completed |
| `@vueuse/shared`       | `@reause/shared`       | ✅ completed |
| `@vueuse/integrations` | `@reause/integrations` | ✅ completed |
| `@vueuse/math`         | `@reause/math`         | ✅ completed |
| `@vueuse/metadata`     | `@reause/metadata`     | ✅ completed |
| `@vueuse/rxjs`         | `@reause/rxjs`         | ✅ completed |
| `@vueuse/electron`     | `@reause/electron`     | ✅ completed |
| `@vueuse/firebase`     | `@reause/firebase`     | ✅ completed |
| `@vueuse/skills`       | `@reause/skills`       | ✅ completed |
| `@vueuse/components`   | —                       | ⏳ TODO      |

## Quick start

```bash
git clone --recurse-submodules https://github.com/hairyf/reause.git
cd reause
npm install
npm run typecheck
```

## Mapped examples

The complete list lives in the generated [function mapping table](meta/functions.md).
A few entry points:

- `useToggle` → [`packages/shared/useToggle/index.tsx`](packages/shared/useToggle/index.tsx)
- `useCounter` → [`packages/shared/useCounter/index.tsx`](packages/shared/useCounter/index.tsx)
- `useNow` → [`packages/core/useNow/index.tsx`](packages/core/useNow/index.tsx)
- `useStorage` → [`packages/core/useStorage/index.tsx`](packages/core/useStorage/index.tsx)

## Status

- [x] Large-scale AI mapping of all `@vueuse/core` functions
- [x] `rxjs` / `electron` / `firebase` / `skills` sub-packages
- [x] Publish to npm (`@reause/*`)

## License

[MIT](LICENSE). VueUse logo from [vueuse/vueuse](https://github.com/vueuse/vueuse) (MIT licensed); the reause logo is a React-colored variant of the same lettering.
