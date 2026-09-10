# 编排（Orchestration）

reaxuse 自动化流水线的总入口：定义总体流程、各环节职责与**精准轮询频率**，具体执行细节引用各分文档。

## 1. 总体流水线

```text
[上游变动 / 用户需求]
│
▼

创建 Issue (合并更新 / 新增 Hook)
│
▼

标记 implement 标签
│
▼

派发实现子代理 ───> 遵守核心协议 & 现有架构 ───> 提交 PR
│
▲

监控 PR 评论 ───(有评论)───> 原子代理二次修复
│
▼ (无评论 & CI 通过)

PR 合并与收尾

▼ (每天晚上，有新增/更改内容)

Nightly Release
```

## 2. 环节职责与文档索引

| 环节            | 执行文档                                         | 触发时机                          | 轮询频率                        |
| :-------------- | :----------------------------------------------- | :-------------------------------- | :------------------------------ |
| 上游监控        | [upstream-monitoring.md](upstream-monitoring.md) | 持续                              | 指数退避：30 分钟 → 1 天        |
| Issues 监控     | [issues-monitoring.md](issues-monitoring.md)     | 持续                              | 指数退避：30 分钟 → 1 天        |
| 子代理执行      | [subagent-execution.md](subagent-execution.md)   | Issue 打上 `implement` 标签后派发 | 一次性派发 + 按 review 评论复派 |
| PR 合并         | [pr-merge.md](pr-merge.md)                       | 子代理 PR CI 完成                 | 事件驱动（CI 完成即触发）       |
| Nightly Release | [release.md](release.md)                         | 每天晚上                          | 每日一次，有新增/更改内容才执行 |
| 命名与绑定标准  | 根目录 [AGENTS.md](../AGENTS.md)                 | —                                 | —                               |

## 3. 轮询频率细则

- **指数退避**（上游监控 / Issues 监控通用）：起始间隔 **30 分钟**，每次轮询无新变化则翻倍递增（30 分钟 → 1 小时 → 2 小时 → …），封顶 **1 天**；发现新内容（新 Merged PR、新 Issue、新评论、标签变化）立即重置回 30 分钟。
- **PR CI 监控**：子代理提交 PR 后持续 `gh pr checks --watch` 直至 CI 完成，不适用退避策略。
- **Nightly Release**：固定每日一次，仅在存在新增/更改内容时执行，否则跳过。

## 4. 节点定义

1. **监控上游变动**：见 [upstream-monitoring.md](upstream-monitoring.md)。定期轮询/监控上游库（VueUse / react-use 等）的 Merged PR。若更改适用于 reaxuse，自动创建“合并更新 Issue”。
2. **接收用户需求**：见 [issues-monitoring.md](issues-monitoring.md)。用户提出新增 Hook 请求（例如“请添加 react-use 的 `useXXX`”）时，直接创建对应的“新增 Hook Issue”。
3. **调度实现代理**：监控到 Issue 被打上 `implement` 标签后，系统自动派发**实现子代理**，按照根目录 [AGENTS.md](../AGENTS.md) 与 [subagent-execution.md](subagent-execution.md) 规范完成编码并提交 PR。
4. **处理 PR 审查**：见 [issues-monitoring.md](issues-monitoring.md) §3。持续监控 PR 中的用户评论/审查意见，一旦产生评论，**必须重新指派原子代理**在同一个 Worktree 和分支上进行修复与提交，禁止重新创建 PR。
5. **PR 合并与收尾**：见 [pr-merge.md](pr-merge.md)。子代理 PR CI 完成后审批合并，合并后更新元数据。
6. **Nightly Release**：见 [release.md](release.md)。每天晚上有新增/更改内容时发布，否则跳过。
