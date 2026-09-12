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
| `useWebMCP`                       | —                                             | `packages/core/useWebMCP/index.tsx`                       | ✅ ported (not in pinned submodule) |
```

其中的 `✅ ported (not in pinned submodule)` 含义是「该移植声称的上游无法由当前 pin 确认」，**不是**「上游没有对应实现」——它仍是有效来源，按上述 `git show origin/main:<path>` 取原文比对即可。该标签覆盖两种情形：声称的上游比 pin 更新、或上游本就是 Vue 自身 API（`useWebMCP`、`useWatch`），以及该符号是 VueUse 从 `vue` 再导出的（`toValue`）。真正表示「上游既未定义也未再导出该符号」的是第三个标签 `✅ reause-only export`（如 `isRefLike`、`writeState`）。

### 3.2 覆盖度审计

`meta/functions.md` 由 `scripts/update.ts` 生成：`collectFunctions()`（L101-129）先遍历 **reause 自己的导出**（`packages/{core,shared,math,integrations,electron,firebase,rxjs}/*/index.tsx`），`generateFunctionsMD()`（L79-85）再**逐个导出**回查上游 `source/vueuse/packages/<pkg>/<name>/index.ts`。检查方向是 **reause → 上游**：上游有、reause 没有的函数根本不会被遍历，也就不会成为一行，表格照旧满屏 `✅ ported`。所以该表是**移植登记表，不是覆盖度证明**——「全部 ✅ ported」不能当作完整性依据。本节把覆盖度审计并入本监控阶段（不新增流水线阶段），按下列三步独立复核。

**第 1 步：枚举 pin 上的上游函数。** 口径是 `source/vueuse/packages/<pkg>/<dir>/index.ts`，跳过 `_*` 目录（`core/_template`）与没有 `index.ts` 的目录：

```powershell
$pkgs = @('core','shared','math','integrations','electron','firebase','rxjs')
foreach ($p in $pkgs) {
  $c = (Get-ChildItem "source/vueuse/packages/$p" -Directory | Where-Object { -not $_.Name.StartsWith('_') -and (Test-Path "$($_.FullName)\index.ts") }).Count
  "$p $c"
}
```

**第 2 步：按注解匹配。** 每个移植的 JSDoc 都带 `Map from @vueuse/<pkg> \`<上游名>\``，用的是**上游名**而非 reause 名——这正是重命名可解析的原因（`packages/shared/useWatch/index.tsx`标注的是`watch`）。匹配口径是**「严格注解」与「字面路径」两条通道的并集**，且注解通道必须用反引号包裹上游名的严格形式；两条通道必须同时使用，任一偏差都会让残留数算错：

- **只认反引号注解** → 漏掉 3 个只写路径、没写注解的移植（`packages/shared/utils/index.tsx`、`packages/firebase/useAuth/index.tsx`、`packages/firebase/useFirestore/index.tsx`，路径写作 `source/vueuse/packages/<pkg>/<name>`），残留虚增到 38。
- **把无反引号的注解写法也算命中** → 多命中 6 个（`useWatchImmediate` 等 6 个 `useWatch*` 的注解写作 `Map from @vueuse/shared watchImmediate.`，没有反引号），残留少算到 29。

本节的基线用的是「严格注解 ∪ 字面路径」。

```powershell
$corpus = Get-ChildItem packages -Recurse -File -Include index.tsx,index.md | Where-Object { $_.FullName -notmatch 'node_modules|dist|\.vitepress' }
$text = ($corpus | ForEach-Object { Get-Content $_.FullName -Raw }) -join "`n"
```

**第 3 步：分流残留项——未命中不等于缺口。**

- **(a) 重命名移植**：确认 `packages/<pkg>/<新名>/` 目录存在，并**核实该目录的注解确实指向这个上游名**——名字相似不算证据。反例：`packages/shared/useStateWithControl/` 的注解是 `Map from @vueuse/shared \`refWithControl\``，与 `computedWithControl`无关；后者是议题 **#14**，已带`impractical` 关闭（所有者结论：Vue 的 computed/effect 依赖追踪在 React 中没有等价实现）。只按名字相似推断就会把一个未移植的上游函数误判为已移植。
- **(b) barrel 注释占位**：未实现的由 barrel 以 `// export * from './<name>'` 声明，这就是「已声明未移植」的信号（不得删除）：

  ```powershell
  Get-ChildItem packages/*/index.ts | ForEach-Object { Select-String -Path $_.FullName -Pattern '^//\s*export \* from' }
  ```

  当前 5 条：`core` 的 `computedInject` / `createUnrefFn` / `useCurrentElement`，`shared` 的 `injectLocal` / `provideLocal`。

- **(c) 查决策**：其余查已关闭的 `Mapping | <name>` 议题及其决策标签（`impractical` = 已判定不适用于 React，**不得再派发**）：

  ```powershell
  gh issue list --repo hairyf/reause --state all --label impractical --limit 200 --json number,title,state
  ```

**基线（2026-09-12 实测，pin `97fd09c3`）**

| 项                         |    数量 |
| :------------------------- | ------: |
| 上游函数总数（第 1 步）    | **266** |
| 注解 / 路径命中（第 2 步） | **231** |
| 残留（第 3 步分流）        |  **35** |

按包拆分：`core` 147、`shared` 74、`math` 18、`integrations` 12、`rxjs` 7、`electron` 5、`firebase` 3（合计 266）。

残留 35 项 = **8 个重命名移植 + 27 个已判定 impractical**（27 = 带 `impractical` 标签且已关闭的议题数，其中 `core` 5 个、`shared` 22 个）。

**重命名移植（8）**：`watchImmediate` → `useWatchImmediate`、`watchPausable` → `useWatchPausable`、`watchThrottled` → `useWatchThrottled`、`watchTriggerable` → `useWatchTriggerable`、`watchWithFilter` → `useWatchWithFilter`、`watchIgnorable` → `useWatchIgnorable`、`watchArray` → `useWatchArray`、`refThrottled` → `useStateThrottled`。

**已判定 impractical（27，不得再派发）**：

- `@vueuse/core`（5）：`computedInject`、`createUnrefFn`、`useCurrentElement`、`useVModel`、`useVModels`
- `@vueuse/shared`（22）：`computedEager`、`computedWithControl`、`createDisposableDirective`、`createRef`、`extendRef`、`get`、`injectLocal`、`provideLocal`、`reactify`、`reactifyObject`、`reactiveComputed`、`reactiveOmit`、`reactivePick`、`set`、`toReactive`、`toRef`、`toRefs`、`tryOnBeforeMount`、`tryOnBeforeUnmount`、`tryOnMounted`、`tryOnScopeDispose`、`tryOnUnmounted`

**结论**：上游 266 个函数全部有着落，**覆盖度是完整的**；27 个是为 React 主动放弃的 Vue-only `ref` / 响应式 API（含 `computedWithControl`），是决策而非缺口，**不得重新派发**。
