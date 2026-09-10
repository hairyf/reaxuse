# 上游监控（source/*）

> 编排入口与轮询频率见 [orchestration.md](orchestration.md)。

## 1. 监控对象

- 上游仓库以 git submodule 挂载于根目录 `source/` 下（清单见 [.gitmodules](../.gitmodules)），当前为 `source/vueuse`（VueUse）。
- 新增上游（如 react-use）时以同一模式加入 `source/*`。
- 监控内容：对应上游仓库 `main` 分支的 Merged PR，判断改动是否适用于 reaxuse。

## 2. 轮询频率（指数退避）

- **起始间隔**：30 分钟。
- **封顶**：1 天。
- **退避规则**：每次轮询未发现新 Merged PR，间隔翻倍（30 分钟 → 1 小时 → 2 小时 → … → 1 天封顶）；一旦发现新 PR 或相关状态变化，立即重置回 30 分钟。

## 3. 处理流程

1. 在对应 `source/<repo>` submodule 内执行 `git fetch origin main`，对比 `origin/main` 的最近 Merged PR。
2. 判定改动是否适用于 reaxuse（涉及已镜像或待镜像的 Hook / 共享工具函数）。
3. 若适用：创建「合并更新 Issue」（见 [issues-monitoring.md](issues-monitoring.md)）；若不适用，跳过并在下次轮询继续。
