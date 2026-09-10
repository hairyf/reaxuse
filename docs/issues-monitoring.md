# Issues 监控

> 编排入口与轮询频率见 [orchestration.md](orchestration.md)。

## 1. 监控对象

- **新增 Hook 请求**：用户直接提出（例如“请添加 react-use 的 `useXXX`”），创建「新增 Hook Issue」。
- **合并更新 Issue**：由上游监控流程创建（见 [upstream-monitoring.md](upstream-monitoring.md)）。
- **PR 评论**：子代理 PR 上的审查意见 / 用户评论。

## 2. 轮询频率（指数退避）

- **起始间隔**：30 分钟。
- **封顶**：1 天。
- **退避规则**：每次轮询无新变化则翻倍递增（30 分钟 → 1 小时 → 2 小时 → … → 1 天封顶）；发现新 Issue、新评论或标签变化后立即重置回 30 分钟。

## 3. 处理流程

1. 轮询仓库 Issues：新请求 → 创建对应 Issue；已有 Issue 状态/标签变化 → 更新记录。
2. **派发前必读评论**：执行 `gh issue view <N> --comments`，读取正文与**全部评论**，以最后一条所有者调整评论为准（优先级见 [orchestration.md](orchestration.md) §5）。命名或返回值不符合 [AGENTS.md](../AGENTS.md) 规范时**抛回父代理**，严禁臆测修改。
3. 确认需求后（Issue 带 `implement` 标签）派发**实现子代理**完成编码并提交 PR（见 [subagent-execution.md](subagent-execution.md)）。
4. 持续监控子代理 PR 的评论：一旦产生评论，**必须重新指派原子代理**在同一个 Worktree 和分支上进行修复与提交，禁止重新创建 PR（合并流程见 [pr-merge.md](pr-merge.md)）。
5. 合并后核对 Issue 是否已随 `Closes #<N>` 自动关闭；对已在 `main` 实现、但 Issue 仍开放的条目，逐项核对实现与最后一条评论后补评论并关闭。
