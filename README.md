<div align="center">

<img src="assets/vueuse.svg" width="44" height="44" alt="VueUse" style="vertical-align: middle" />
&nbsp;&nbsp; → &nbsp;&nbsp;
<img src="assets/reaxuse.svg" width="44" height="44" alt="reaxuse" style="vertical-align: middle" />

# reaxuse

**VueUse 的 React 翻版 —— 通过 AI 持续映射 VueUse 的实现**

[![Status: Experimental](https://img.shields.io/badge/status-experimental-orange)](https://github.com/hairyf/reaxuse)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> ⚠️ **实验性项目（WIP / TODO）**：基础架构已一比一还原，hooks 映射正在推进中。

</div>

## 这是什么

`reaxuse` 是一个实验性的 React hooks 工具库，目标是**一比一还原 [VueUse](https://vueuse.org) 的能力**：

- 以 git 子模块引用官方 [vueuse/vueuse](https://github.com/vueuse/vueuse)（`source/vueuse`），作为映射的唯一事实来源
- 包结构 1:1 镜像 VueUse，但 API 全部面向 React（`useState` / `useEffect` / `useMemo` …）
- 由 AI 持续对照上游实现，把 Vue 的 composable 映射为 React hook

## 包结构（镜像 VueUse）

| VueUse | reaxuse | 状态 |
|---|---|---|
| `@vueuse/core` | `@reaxuse/core` | 🚧 骨架 + 示例 hooks |
| `@vueuse/shared` | `@reaxuse/shared` | 🚧 骨架 |
| `@vueuse/integrations` | `@reaxuse/integrations` | 🚧 骨架 |
| `@vueuse/math` | `@reaxuse/math` | 🚧 骨架 |
| `@vueuse/metadata` | `@reaxuse/metadata` | 🚧 骨架 |
| `@vueuse/router` / `rxjs` / `electron` / `nuxt` / `firebase` | — | ⏳ TODO |

## 映射模式

| VueUse（Vue） | reaxuse（React） |
|---|---|
| `ref()` / `reactive()` | `useState()` |
| `watch()` / `watchEffect()` | `useEffect()` |
| `computed()` | `useMemo()` / `useCallback()` |
| composable 生命周期 | hook 卸载时清理副作用 |

## 快速开始

```bash
git clone --recurse-submodules https://github.com/hairyf/reaxuse.git
cd reaxuse
npm install
npm run typecheck
```

## 已移植示例

- `useToggle` → [`packages/core/src/useToggle.ts`](packages/core/src/useToggle.ts)
- `useCounter` → [`packages/core/src/useCounter.ts`](packages/core/src/useCounter.ts)
- `useNow` → [`packages/core/src/useNow.ts`](packages/core/src/useNow.ts)

## TODO

- [ ] 构建工具链（tsdown / rollup，镜像 VueUse 的 `tsdown.config.ts`）
- [ ] 测试框架（vitest + React Testing Library）
- [ ] 文档站点（VitePress）
- [ ] 大规模 AI 映射 `@vueuse/core` 全部 functions
- [ ] `router` / `rxjs` / `electron` / `nuxt` / `firebase` 子包
- [ ] 发布 npm（`@reaxuse/*`）

## 许可证

[MIT](LICENSE)。VueUse logo 来自 [vueuse/vueuse](https://github.com/vueuse/vueuse)（MIT 许可），reaxuse logo 为同款字形的 React 配色翻版。
