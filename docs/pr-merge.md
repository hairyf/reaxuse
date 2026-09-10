# PR 合并与收尾

> 编排入口与轮询频率见 [orchestration.md](orchestration.md)。

## 1. 触发条件

- 子代理提交 PR 且 **CI 完成**（`gh pr checks` 全绿）后进入合并流程。
- 被 review 指出问题时：重新指派原子代理在原分支追加提交，严禁主动执行 merge 或 close 操作（复派流程见 [issues-monitoring.md](issues-monitoring.md) §3）。

## 2. 状态监控

通过 `gh pr list --repo hairyf/reaxuse --state open --json number,title,headRefName,mergeable,mergeStateStatus` 查看状态：

- `CLEAN` / `UNSTABLE`：允许直接合并。
- `CONFLICTING` / `DIRTY`：按 §4 进行冲突解析。
- `UNKNOWN`：执行 `git merge-tree --write-tree main <branch>`（exit 0 即无冲突），不直接改动代码。

## 3. 审批检查清单

- **来源校验与命名**：
  - VueUse 来源：检查 `ref*` → `useState*` 映射，JSDoc 包含 `Map from @vueuse/...`。
  - react-use 来源：检查是否保持原 API 命名，JSDoc 包含 `Mirrored from react-use/...`。
- **返回值结构**：VueUse 转换类检查强制 tuple/对象规则；react-use 类核对上游 API 签名（对照 [AGENTS.md](../AGENTS.md) 绑定标准）。
- **共享引用**：通用工具函数必须统一从 `@reaxuse/shared` 导入，严禁本地副本。
- **SSR 安全**：渲染阶段禁止直接访问 `window`/`document` 等 DOM API。
- **占位符**：仅取消本 Hook 对应行的 `// export *` 注释。
- **协议合规**：对照 [subagent-execution.md](subagent-execution.md) §3 核心协议逐项核验。

## 4. 合并与冲突处理

- **合并命令**：执行 `gh pr merge <N> --repo hairyf/reaxuse --merge --delete-branch=false`（使用 merge commit，禁止 squash）。
- **冲突解析策略**：
  - core 包：对两侧 export 行取并集（union）并按 ASCII 排序。
  - shared 包：以 main 为准，仅取消当前分支对应 Hook 的注释。
  - 其他包：调用 `.agents/update-branch-any.ps1 -Worktree <wt> -Branch <branch>`。

## 5. 合并后收尾（元数据更新）

每次 PR 批量合并完成后，按顺序执行以下维护指令：

```bash
git fetch origin main && git checkout main && git reset --hard origin/main
npm run update                  # 重新生成元数据文件
git add meta/functions.md packages/functions.md packages/metadata/src/functions.ts
git commit -m "chore: update metadata for merged hooks" && git push origin main

npx tsc --noEmit                # 检查同名导出冲突 (TS2308)
npx vitest run                  # 全局冒烟测试
```
