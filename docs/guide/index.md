# Introduction

`reaxuse` is an experimental React hooks library that aims to be a **1:1 port of
[VueUse](https://vueuse.org)**.

- The official [vueuse/vueuse](https://github.com/vueuse/vueuse) repository is referenced as a
  git submodule (`source/vueuse`) and serves as the single source of truth for mapping
- The package structure mirrors VueUse 1:1, but every API is React-flavored
  (`useState` / `useEffect` / `useMemo` …)
- AI continuously maps upstream composables to React hooks

See [architecture](/architecture) for the full VueUse → reaxuse mapping.
