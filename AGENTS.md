# AGENTS.md

Rules for AI agents working on the reaxuse repository. These apply to every
agent session — including issue-mapping agents, implement subagents, and any
automated issue handling.

## Naming rules for mapped functions

- 如果是 `ref*`（VueUse 的 `refAutoReset` / `refDebounced` / `refDefault` / `refManualReset` / `refThrottled` / `refWithControl` 等 ref 系函数），统一我们的实现都要是 `useState*`（如 `useStateAutoReset` / `useStateDebounced` / `useStateDefault` / `useStateManualReset` / `useStateThrottled` / `useStateWithControl`）。
- `use*RefHistory` 系列（`useRefHistory` / `useManualRefHistory` / `useDebouncedRefHistory` / `useThrottledRefHistory`）也按此规则改名为 `useState*History`（如 `useStateHistory` / `useStateManualHistory` / `useStateDebouncedHistory` / `useStateThrottledHistory`）。
- 返回值的风格也要是 React：用数组解构形式，如 `const [num, setNum, control] = useStateWithControl(0)`，而不是 Vue 风格的单一 ref 对象。
- VueUse 上游源名（`ref*` / `use*RefHistory`）必须保留在 issue 的 Target / Upstream API / Map from / vueuse 侧代码中，只有 reaxuse 侧（标题、reaxuse 路径、Map to、Expected implementation 的 reaxuse 部分）改用 `useState*` 命名。

## Issue handling rules

- 如果 issues 不符合上述两个要求（命名不是 `useState*` 形式，或返回值不是 React 风格），应该抛出给父代理处理，不要自行猜测修改。

## Export placeholder rules (index.ts)

- 所有包的 `packages/<pkg>/src/index.ts` 已预置占位符：每个尚未实现的 Hook 一行 `// export * from './useXxx'`（按字母序，与已实现行混排）。
- 实现某个 Hook 时，**只取消自己那一行的注释**（`// export * from './useXxx'` → `export * from './useXxx'`），**禁止新增导出行**。
- 如果目标 Hook 在 index.ts 中没有占位符（罕见），先检查占位符清单是否遗漏，再决定是否按字母序插入新占位符并取消注释。
- 多个并发 PR 各自取消不同的注释行，git 三方合并可自动处理，互不冲突。
- `scripts/update-branch.sh` 负责合并时：--theirs 优先 + 取消分支新增行对应的占位符 + 清理残留（真实行已存在时删除其占位符注释）。
