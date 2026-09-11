# 上游监控（source/*）

> 编排入口与轮询频率见 [orchestration.md](orchestration.md)。

## 1. 监控对象

- 上游仓库以 git submodule 挂载于根目录 `source/` 下（清单见 [.gitmodules](../.gitmodules)），当前为 `source/vueuse`（VueUse）与 `source/react-use`（react-use）。
- **首次轮询某个上游前先初始化对应 submodule**：`git submodule update --init source/react-use`（未初始化时 `git submodule status` 会在该条目行首输出 `-`）。
- 新增上游时以同一模式加入 `source/*`。
- 监控内容：对应上游仓库**默认分支**的 Merged PR，判断改动是否适用于 reause。默认分支按上游而异：`source/vueuse` 为 `main`，`source/react-use` 为 `master`。

## 2. 轮询频率（指数退避）

- **起始间隔**：30 分钟。
- **封顶**：1 天。
- **退避规则**：每次轮询未发现新 Merged PR，间隔翻倍（30 分钟 → 1 小时 → 2 小时 → … → 1 天封顶）；一旦发现新 PR 或相关状态变化，立即重置回 30 分钟。

## 3. 处理流程

1. 在对应 `source/<repo>` submodule 内执行 `git fetch origin`，再对比其**默认分支**（`origin/HEAD`，即 `source/vueuse` 的 `origin/main` / `source/react-use` 的 `origin/master`）的最近 Merged PR。切勿硬编码 `main`：react-use 上 `git fetch origin main` 会以 `fatal: couldn't find remote ref main`（exit 128）失败。
2. 判定改动是否适用于 reause（涉及已镜像或待镜像的 Hook / 共享工具函数）。
3. 若适用：创建「合并更新 Issue」（见 [issues-monitoring.md](issues-monitoring.md)）；若不适用，跳过并在下次轮询继续。

### 3.1 比 submodule pin 更新的上游 Hook

submodule pin 只在挂载时固定过一次、之后长期不推进（当前 pin 用 `git -C source/vueuse rev-parse HEAD` 查看，`git log --oneline -- source/vueuse` 可确认它自初始提交起未再变更，上游默认分支用 `git -C source/vueuse rev-parse origin/main` 查看；撰写本文时为 `97fd09c3` 对 `418c69d3`），因此比该 pin 更新的上游 Hook 源码**不在磁盘上**：

```powershell
Test-Path source/vueuse/packages/core/useWebMCP   # False
```

无需 checkout 或推进 pin，直接从远端 ref 读取即可：

```powershell
git -C source/vueuse show origin/main:packages/core/useWebMCP/index.ts
git -C source/vueuse show origin/main:packages/core/useWebMCP/index.md
```

由此可解释一个看起来像 bug 的产物：`scripts/update.ts` 按冻结的 pin 做映射，从更新提交移植来的 Hook 会在 `meta/functions.md` 中被记为

```text
| `useWebMCP` | — | `packages/core/useWebMCP/index.tsx` | ✅ ported (no upstream match) |
```

其中的 `✅ ported (no upstream match)` 含义是「该 Hook 比当前 pin 更新」，**不是**「上游没有对应实现」——它仍是有效来源，按上述 `git show origin/main:<path>` 取原文比对即可。
