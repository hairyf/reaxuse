# Nightly Release

> 编排入口与轮询频率见 [orchestration.md](orchestration.md)。

## 1. 触发时机

- **频率**：每天晚上（每日一次）。
- **条件**：自上次发布以来存在**新增/更改内容**（有新 Hook 合入或代码变更，即 [pr-merge.md](pr-merge.md) §5 的元数据更新产生变更）；无变更则跳过本次发布。

## 2. 流程

1. 确认当天有合并的 Hook PR，且合并后收尾（元数据更新）已完成（见 [pr-merge.md](pr-merge.md) §5）。
2. 执行 `pnpm run release`（`bumpp --pr`），创建 `release/*` PR。
3. 合并 `release/*` PR（merge commit，禁止 squash）→ 触发 [.github/workflows/publish.yml](../.github/workflows/publish.yml)：对 merge commit 打 tag 并发布到 npm。
4. 验证发布结果（npm 包版本、GitHub Release 状态）。

## 3. 注意事项

- 发布依赖 merge commit 携带版本号，**禁止 squash**。
- 发布走 npm **Trusted Publishing（OIDC，无长期 token）**：首次发布前需在 npmjs.com 为每个 `@reaxuse/*` 包配置 Trusted Publisher（repository `hairyf/reaxuse`，workflow `publish.yml`），否则 `publish.yml` 会认证失败。
- 构建发生在打包阶段（每个包的 `prepack` 脚本），发布前由 `update:full` 重新生成 metadata、类型声明与 agent skill。
- 若 `release/*` PR 出现冲突，参照 [pr-merge.md](pr-merge.md) §4 处理。
- 若当晚无新增/更改内容，直接跳过，不创建 `release/*` PR。
