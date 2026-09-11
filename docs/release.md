# Nightly Release

> 编排入口与轮询频率见 [orchestration.md](orchestration.md)。

## 1. 触发时机

- **频率**：每天晚上（每日一次）。
- **条件**：自上次发布以来存在**新增/更改内容**（有新 Hook 合入或代码变更，即 [pr-merge.md](pr-merge.md) §5 的元数据更新产生变更）；无变更则跳过本次发布。

## 2. 流程

1. 确认当天有合并的 Hook PR，且合并后收尾（元数据更新）已完成（见 [pr-merge.md](pr-merge.md) §5）。
2. 执行 `pnpm run release -- --release patch --yes`（即 `bumpp --pr`；`--release` 指定版本级别、`--yes` 跳过交互确认，**无人值守时必须显式传入**，否则会停在确认提示符），创建 `release/*` PR。
3. 合并 `release/*` PR（merge commit，禁止 squash）→ 触发 [.github/workflows/publish.yml](../.github/workflows/publish.yml)：对 merge commit 打 tag 并发布到 npm。
4. 验证发布结果（npm 包版本、GitHub Release 状态）。注意 npm 的**传播延迟**：`publish.yml` 成功后，单个包的 packument、版本文档甚至不可变 tarball URL 都可能仍返回 404（此时 `dist-tags` / `time.modified` 仍指向上一版本），`@reause/math` 实测数分钟后自行恢复。用第二个镜像交叉验证即可区分「传播延迟」与「真实失败」，避免无意义重发：`https://registry.yarnpkg.com/@reause%2f<name>`。

## 3. 注意事项

- 发布依赖 merge commit 携带版本号，**禁止 squash**。
- 发布走 npm **Trusted Publishing（OIDC，无长期 token）**：首次发布前需在 npmjs.com 为每个 `@reause/*` 包配置 Trusted Publisher（repository `hairyf/reause`，workflow `publish.yml`），否则 `publish.yml` 会认证失败。本仓库已配置完成并生效（v0.1.4 的 `publish.yml` 成功换取 OIDC token 并发布全部九个包）。
- **另一个硬前提：provenance 校验要求 `repository.url`**。待发布包的 `package.json` 必须声明 `repository`（`https://github.com/hairyf/reause`），否则 npm 以 E422 拒绝发布：

  ```text
  [E422] 422 Unprocessable Entity - PUT https://registry.npmjs.org/@reause%2ffirebase
  Error verifying sigstore provenance bundle:
  Failed to validate repository information: package.json: "repository.url" is "",
  expected to match "https://github.com/hairyf/reause" from provenance
  ```

  v0.1.3 的发布正是因此失败（九个包中有八个的 `package.json` 没有 `repository` 字段）。

- `pnpm run publish:ci` 内部执行 `pnpm publish -r`，该命令**遇错即止（fail-fast）**：第一个包失败即中止，不会继续尝试后续包（v0.1.3 的两次失败运行都只尝试了一个包、未发布任何包），因此部分发布的概率很低。
- 构建发生在打包阶段（每个包的 `prepack` 脚本），发布前由 `update:full` 重新生成 metadata、类型声明与 agent skill。
- 若 `release/*` PR 出现冲突，参照 [pr-merge.md](pr-merge.md) §4 处理。
- 若当晚无新增/更改内容，直接跳过，不创建 `release/*` PR。
