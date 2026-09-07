# PR 监控 / 审批 / 合并工作流

> 稳定流程文档（与会话状态的 `MONITORING-HANDOFF.md` 分离）。
> 适用角色：编排者代理，已获维护者合并授权。

---

## 0. 前提

- `gh` 已登录 repo owner（hairyf）。ruleset 要求 approving review，但 owner 经 `gh pr merge` 直接合并实测可用。
- 5 项关键 CI checks（lint / autofix / test 22.x / test lts/* / build）**非阻塞**——`UNSTABLE` 也可合并；Vercel FAILURE 需区分（rate limit 已知非内容问题）。

---

## 1. 监控（轮询）

```bash
gh pr list --repo hairyf/reaxuse --state open --limit 100 --json number,title,headRefName,mergeable,mergeStateStatus
```

`mergeStateStatus` 判读：

| 状态 | 含义 | 动作 |
| --- | --- | --- |
| `CLEAN` | 可直接合并 | → §3a |
| `UNSTABLE` | checks 未完但未阻塞 | → §3a |
| `CONFLICTING` / `DIRTY` | 有冲突 | → §3b |
| `BLOCKED` | 审查/规则拦截 | 查原因，不硬合 |

---

## 2. 审批（合并前审查）

逐 PR 核对 API 契约，**不合规 → 评论标记 + 抛回维护者，不合并**：

1. **命名**（AGENTS.md）：`ref*` → `useState*`；`use*RefHistory` → `useState*History`；上游名保留在 JSDoc `Map from`。
2. **返回值**（§2B tuple 协议，`MONITORING-HANDOFF.md`）：tuple 强制家族（`useState*` 全部 + `useStorage` / `useSessionStorage` / `useScrollLock` / `useTitle` / `useUrlSearchParams` / `useTextDirection` 等白名单）必须返回 `[value, setValue]`；对象镜像上游 / 纯派生值 / watch 控制对象不在 tuple 范围。issue 与协议冲突 → 以协议为准。
3. **引用链**（§2C）：通用工具（`toValue` / `isRefLike` / `MaybeRefOrGetter` / `ConfigurableWindow` / `noop` 等）从 `@reaxuse/shared` 引用，禁止本地副本。
4. **SSR 安全**：渲染期不得触碰 `window` / `document` / `navigator`（capability 探测在 mount effect）。
5. **占位符纪律**：只取消自己那一行 `// export * from './useXxx'`，不新增行。
6. 审查方式：读 PR 的 hook 源码 + 测试 + index.md（`git show <branch>:...` 或 `gh pr diff`）；大批量可派发并行审查子代理，但**指控必须亲自复核**（误报率高）。

---

## 3. 合并

### 3a. CLEAN / UNSTABLE

```bash
gh pr merge <N> --repo hairyf/reaxuse --merge --delete-branch=false
```

### 3b. CONFLICTING（index.ts 相邻行冲突是常态）

```bash
bash scripts/update-branch.sh <worktree-dir> <branch>   # merge main → 解析 index.ts → push
gh pr merge <N> --repo hairyf/reaxuse --merge
```

- 冲突解析规则：core 的 index.ts = 两侧 export 行 **union + ASCII 排序**；shared 的 index.ts = 以 main 为准 + **取消本分支占位符注释**。
- `Base branch was modified` / `merge conflicts` 属**瞬时状态**（GitHub 异步重算）→ 重试，最多 3 次、间隔 3s。
- 批量：`scripts/driver-core.sh`（PR→worktree 映射硬编码在脚本内，**每个新批次需更新映射**）。
- 合并顺序：升序逐个；每合并一个，其余 PR 由脚本对最新 main 重新解析。

### 3c. 合并方式

统一 `--merge`（merge commit，与仓库历史一致）；不 squash。

---

## 4. 合并后（每批一次）

```bash
git fetch origin main && git checkout main && git reset --hard origin/main
npm run update          # 重新生成 3 个元数据文件
git add meta/functions.md packages/functions.md packages/metadata/src/functions.ts
git commit -m "chore: update metadata for merged hooks" && git push origin main
npx tsc --noEmit        # 抓集成问题（重点：barrel export * 的 TS2308 同名类型冲突）
npx vitest run          # 冒烟（见 §5 flake 清单）
```

---

## 5. 已知异常与 flake

| 现象 | 处置 |
| --- | --- |
| git SSL 握手瞬断（schannel EOF） | 重试；顽固时 `git config http.sslBackend openssl` |
| worktree 残留 MERGE_HEAD / 脏暂存 | `update-branch.sh` 已内置 `git merge --abort` + `git reset --hard HEAD`（分支已推送，无数据丢失） |
| lint-staged 静默超时致 commit 失败 | push 前 `git log -1` 确认 |
| gh 内联反引号解析报错（PowerShell） | 用临时 .md + `--body-file` |
| 全套测试并发负载下时序 flake | `useStateThrottledHistory` / `useWebWorker` / `useThrottleFn` burst / `useTimeoutFn`——**单独重跑即过，勿改文件** |
| 重复导出 TS2308 | 同名类型只能一处 export，其他文件 `import type` |

---

## 6. 工具清单

| 工具 | 用途 |
| --- | --- |
| `scripts/update-branch.sh <worktree-dir> <branch>` | 单分支对 main 的合并 + index.ts 冲突解析 + push |
| `scripts/driver-core.sh` | 批量合并驱动（映射表需按批次维护） |
| `scripts/contract-check.ts` | 契约**诊断**（naming / tuple / 注册 / docs / Map from）——辅助参考，非契约本体 |
| `scripts/add-mapfrom.ts` | 批量补 `Map from` JSDoc 行 |
