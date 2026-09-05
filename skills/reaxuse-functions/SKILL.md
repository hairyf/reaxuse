---
name: reaxuse-functions
description: Everything about reaxuse functions, including what they do, how to use them, and how to migrate them from VueUse.
license: MIT
metadata:
  author: reaxuse
  version: 0.0.1
compatibility:
  - react >= 18
---

# reaxuse Functions

reaxuse is a React port of [VueUse](https://vueuse.org) — a collection of
reactive utilities that wrap React's `useState`/`useEffect`/`useCallback`
primitives the way VueUse wraps Vue's reactivity system. Every function is a
React hook (`useX`) mapped 1:1 from the upstream VueUse implementation (see
`source/vueuse` submodule).

## Functions

| Function | Description | Invocation |
| --- | --- | --- |
| [useToggle](./references/useToggle.md) | A boolean switcher with utility functions | AUTO |
| [useCounter](./references/useCounter.md) | Basic counter with utility functions | AUTO |
| [useNow](./references/useNow.md) | Reactive current Date instance | AUTO |

### Invocation

- `AUTO` — used automatically inside React components via normal hook rules.
- `EXTERNAL` — only used outside React (not applicable to hooks).
- `EXPLICIT_ONLY` — must be explicitly invoked by the consumer.

## Contributing

When porting a new function from VueUse:

1. Implement it in `packages/<pkg>/src/<fn>.ts` with the same options and
   return shape as the upstream (react-adapted).
2. Run `npm run update` to regenerate `meta/functions.md`,
   `packages/functions.md` and `packages/metadata/src/functions.ts`.
3. Add a docs page at `packages/<pkg>/<fn>/index.md` and a co-located demo at
   `packages/<pkg>/<fn>/demo.tsx` (mirroring upstream `index.md` + `demo.vue`).
4. Update this file's Functions table and add `references/<fn>.md`.
