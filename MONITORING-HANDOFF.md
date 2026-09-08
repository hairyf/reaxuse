# reaxuse 监控任务 — 工作模式交接文档

> **文件用途**：会话无缝交接（untracked，禁止提交）。
> **流程文档**：PR 监控/审批/合并的稳定流程见 `PR-MERGE-WORKFLOW.md`（本文件只记会话状态与队列）。
> **目标仓库**：[reaxuse/issues](https://github.com/hairyf/reaxuse/issues)（React 版 VueUse，账号 `hairyf`）
> **当前基线**（2026-09-08 15:40 会话更新）：`main` = `ea039af`（370 functions，**开放 PR 0**）。本会话（Round 1–2）已完成：① 代合并 PR #482 useChangeCase（issue #90）、#483 useFocusTrap（issue #134），审查全合规、CI 5 项全绿，issue 自动关闭；② #22 `createUnrefFn` 按 `impractical` 协议 `not planned` 关闭（评论 5580640786）；③ 关闭过期 issue #2 useNow / #9 useCounter / #10 useToggle（均已实现并导出，附证据评论）；④ **元数据同步已推送**（`ea039af`，+609/-0，含 batch 435–485 缺口与 #482/#483）。**⚠️ 重要环境事实**：`source/vueuse` 是未初始化 submodule——任何会话运行 `npm run update` 前必须先 `git submodule update --init source/vueuse`，否则状态列整体降级为 "🚧 ported (no upstream match)"（上一会话的 `145a980` 即因此废弃，未入历史，reflog 可查）。旧 `D:\reaxuse` 检出已不存在，`vitest.worktree.config.ts` 已无——worktree 内直接以根 `vitest.config.ts` 运行 `npx vitest run <file>` 即可。

---

## 1. 核心目标与工作模式

持续监控 reaxuse Issues 并按 Label 分流处理：

| Label | 处理逻辑 | 约束 / 动作 |
| --- | --- | --- |
| **`impractical`** | 回复中文原因（如无 React 等价实现）并 Close。 | Close 原因选择 `not planned`。 |
| **`implement`** | 派发子代理实现 $\rightarrow$ 提交 PR $\rightarrow$ 监控 CI $\rightarrow$ 报告 PR 地址。 | **严禁 Merge**（仅由维护者合并）。 |
| **`adjustment`** | 根据 React Hook 设计思路重构行为，更新文档与 Issue。**本协议（§2B）为唯一指针：issue 的 Expected implementation 与协议冲突时，按协议修正 issue，实现不受冲突 issue 约束。** | 详细记录调整内容，同步至 JSDoc 与 Docs。 |

**编排者（父代理）职责**：合并后在 `main` 运行 `npm run update` 并提交元数据；清理/修复冲突；控制并发。
**例外**：维护者授权批量合并时（如前轮 48 个 PR），编排者可用 `gh pr merge --merge` 代合并。

---

## 2. 约束规范 (Binding Rules)

1. **子代理权限限制**：
* 禁止运行 `npm run update`。
* 禁止修改：`meta/functions.md`、`packages/functions.md`、`packages/metadata/src/functions.ts`。


2. **并发控制**：并发子代理上限为 **2 个**。
3. **导出格式规范（占位符模式，所有包统一）**：
* 各包 `packages/<pkg>/src/index.ts` 已预置占位符：未实现 Hook 为注释行 `// export * from './useXxx'`（按字母序与已实现行混排）。
* 子代理实现 Hook 时**只取消自己那行注释**，禁止新增导出行；占位符缺失时按字母序插入注释占位符再取消。
* `scripts/update-branch.sh` 合并策略：--theirs 优先 → 取消分支新增行对应占位符 → 清理残留（真实行已存在则删其占位符注释）。


4. **轮询机制**：轮询间隔使用 `Start-Sleep -Seconds 270`（4.5 分钟），命令超时设置为 330,000ms。
5. **职责分离**：子代理仅负责具体代码实现；编排者处理轮询、调度、元数据更新及冲突解决。
6. **编码与重命名映射**：
* `ref*` $\rightarrow$ `useState*`
* `use*RefHistory` $\rightarrow$ `useState*History`
* 返回值规范：遵守 React 数组解构规范。


7. **返回值契约约束**：属于 **tuple 强制家族**（见 §2B）的 Hook，返回值**必须**为数组解构形式。对象镜像 / 纯派生值 / watch 控制对象不属于 tuple 范畴。本协议靠规范纪律约束（`scripts/contract-check.ts` 仅作为诊断参考）。

---

## 2B. 返回值强约束协议 (Tuple Constraint Protocol)

### Tuple 强制家族（返回形式：`[...]`）

1. **`useState*` 全系 Hook**（对应 VueUse `ref*` / `use*RefHistory`）：
* 返回 `[value, setValue]`、`[value, setValue, controls]` 或 `[history, undo, redo, controls]`。
* 已落地：`useStateHistory`、`useStateManualHistory`、`useStateThrottledHistory`。
* 包含未来同类 Hook：`useStateAutoReset`、`useStateDebounced`、`useStateDefault`、`useStateManualReset`、`useStateThrottled`、`useStateWithControl`、`useStateDebouncedHistory` 等。


2. **State-like 可写 Hook 白名单**（返回 `[value, setValue]`）：
* `useStorage` / `useSessionStorage` / `useLocalStorage` / `useStorageAsync`
* `useScrollLock` $\rightarrow$ `[isLocked, setIsLocked]`
* `useTitle` $\rightarrow$ `[title, setTitle]`
* `useUrlSearchParams` $\rightarrow$ `[params, setParams]`
* `useTextDirection` $\rightarrow$ `[dir, setDir]`
* *注：新增同类可写 Hook 默认归入此分类。*



### 非 Tuple 范畴（返回对象 / 纯值）

1. **对象镜像 Hook**（与上游成员结构一致）：
* `useUserMedia`、`useWebWorker`、`useWebWorkerFn`、`useSpeechRecognition`、`useSpeechSynthesis`、`useStepper`、`useSwipe`、`useWakeLock`、`usePointer`、`usePointerLock`、`useStyleTag`、`useScriptTag`、`useShare`、`useTextSelection`、`useResizeObserver`、`usePerformanceObserver`、`useWindowScroll`、`useWindowSize`、`useScreenSafeArea`、`useVibrate`、`useTemporalNow`、`useTextareaAutosize`、`useWebNotification`、`useTimeoutPoll` 等。


2. **纯派生 Hook**（只读无 Setter）：
* `useNow`、`useOnline`、`useMounted`、`useTimestamp`(默认)、`usePreferred*` 系列、`useTimeAgo`、`useTimeAgoIntl`、`useDateFormat`、`useSorted`、`usePrevious`、`useParentElement`、`useSupported`、`useTransition` 等。


3. **Watch 包装控制对象 Hook**（接收外部状态，返回控制对象）：
* `useWatchIgnorable`、`useWatchPausable`、`useWatchTriggerable`、`useWatchWithFilter`、`useWatchAtMost` 等。


4. **Controls 可选分支**：`useTimestamp` / `usePermission` 在设置 `controls: true` 时返回控制对象。

### 冲突与判定优先级

1. **协议优先**：本协议为最高判定指针，不受 Issue 描述或上游源码误导。
2. **冲突修正**：若 Issue 的预期实现与本协议冲突，统一走 `adjustment` 流程修正 Issue。存疑时提交给维护者裁定。
3. **审查与自动化**：
* 派发 Prompt 必须包含本协议逻辑。
* PR 审查时严格核对返回类型。
* `scripts/contract-check.ts` 用于辅助诊断，非契约执行主体。

---

## 2C. 引用链协议 (Reference Chain Protocol)

> **硬性约束**：通用方法/类型**唯一实现于 `packages/shared`**，其他包一律从 `@reaxuse/shared` 引用，**绝不重复实现 / 内联副本**（VueUse 设计理念：共享工具集中 @vueuse/shared）。靠派发 prompt + PR 审查纪律执行，不由程序强制。
### 唯一实现源（当前）

* `packages/shared/src/utils.ts`：`toValue` / `isRefLike` / `MaybeRefOrGetter` / `ConfigurableWindow` / `noop` / `isClient` 等通用工具。
* 复用方式：shared 内 `import { toValue } from './utils'`；core 内 `import { toValue } from '@reaxuse/shared'`。

### 规则

1. **新增通用方法/类型 → 放入 shared**（utils.ts 或按需新模块）并从 `@reaxuse/shared` 导出。
2. 任何包引用时**从 `@reaxuse/shared` 导入，禁止本地复制**（"镜像上游"也只是引用，不是复制实现）。
3. **发现副本 → 收敛**：删除本地副本，改为引用 shared 唯一实现。
4. **例外**：仅当类型因 barrel `export *` 会 TS2308 冲突、且无法从 shared 导入时，允许本地声明——但必须走 adjustment 记录，禁止静默复制。
5. **eslint 已放行** `@reaxuse/shared`（`no-restricted-imports` 改为 `patterns: ['@reaxuse/*', '!@reaxuse/shared']`）；其他 `@reaxuse/*` 别名仍禁（防包自引用/循环依赖）。core 的 `@reaxuse/shared` 依赖（`file:../shared`）已声明、exports 直指 src，无需构建。

### 落地状态（2026-09 本轮）

* 已收敛：`toValue`（13 份→1）、`isRefLike`（9 份→1）、`ConfigurableWindow`（12 份本地声明→shared 唯一）、`MaybeRefOrGetter`（useSwipe 本地定义→shared）；useDebounceFn/useThrottleFn 本地 `noop` → shared。
* 不收敛：`useWatchWithFilter` 的 `bypassFilter`、`debounceFilter` 等属该 hook 私有/导出实现，非通用工具。
* **pxValue**：PR #390（useMediaQuery）新增共享工具 `pxValue`（`@reaxuse/shared` utils.ts，SSR rem→px 换算）。合入前 worktree 测试依赖主仓库本地镜像；#390 合入后主仓库自动同步，无需单独提交。
* 后续新增 hook 一律按本协议从 shared 引用；违反 = 不合规，抛回维护者。

---

## 2D. useListener 协议 (Listener Callback Protocol)

> **来源**：issue #129 维护者评论（2026-09-06）。硬性约束：**所有 return listener callback hooks 的消费方式统一为 `useListener(onXxx, cb)`**，注册函数 `onXxx` 必须兼容 `useListener`（返回 `{ off }`）。

* **新增函数**：`@reaxuse/shared` > `useListener`（PR #380）——React Hook，mount 注册、unmount 自动 off、cb 变化不重绑（ref 保持最新）。
* **用法**：
  ```tsx
  const { files, open, onChange, onCancel } = useFileDialog()
  useListener(onChange, (files) => { ... })
  useListener(onCancel, () => { ... })
  ```
* **涉及范围**：所有 return callback hooks（useFileDialog 的 onChange/onCancel；后续 useScriptTag/useEventBus 等同类 hooks 迁移时遵循）。
* **签名**：`useListener<T extends (...args: any[]) => void>(on: (fn: T) => { off: () => void } | void, cb: T): void`
* **待办衔接**：#382 useFileDialog 因 useListener（#380）未合入 main，在实现文件内联了兼容层（标注 TODO）。**#380 合入后必须清理**：移除 useFileDialog.ts 内联 `ListenerOn`/`useListener` 导出，测试/demo 改为从 `@reaxuse/shared` 导入。

---



---

## 3. 环境配置 (Windows PowerShell: D:\reaxuse)

* **环境版本**：Node v22.22.0，已安装 Playwright Chromium。
* **仓库配置**：`origin` = `[https://github.com/hairyf/reaxuse.git](https://github.com/hairyf/reaxuse.git)`。
* **依赖管理**：**禁止使用 `npm ci` 或 `npm install**`，使用根目录既有 `node_modules`。
* **保护文件**：保持 `scripts/` 工具链、`AGENTS.md`、`skills-lock.json`、交接文档与 `.env*` 处于未追踪/不受干扰状态。
* **代码校验**：保持局部（scoped）ESLint 校验 0 Errors（不触发全局 `npm run lint`）。
* **网络异常处理**：若遇到 Git SSL 握手阻断，执行 `git config http.sslBackend openssl` 后重试。

---

## 4. Worktree 隔离机制

每个 Hook 必须基于独立 Worktree 构建隔离开发环境：

```powershell
# 1. 创建独立 Worktree 及分支
git -C D:\reaxuse worktree add D:\reaxuse-wt\<hook> -b feat/<scope>-<hook> origin/main

# 2. 挂载节点依赖（严禁运行 npm install）
New-Item -ItemType Junction -Path D:\reaxuse-wt\<hook>\node_modules -Target D:\reaxuse\node_modules

```

**单测与校验流程**：

* 复制 `vitest.worktree.config.ts` 至 Worktree 根目录。
* 运行 Vitest 时必须携带 `--config vitest.worktree.config.ts` 参数。
* 标准校验步骤：Scoped Vitest $\rightarrow$ Scoped ESLint $\rightarrow$ `npx tsc --noEmit`。

---

## 5. 子代理执行流程 (Sub-agent Workflow)

1. **初始化**：同步最新 `origin/main`，解析对应 Issue 及其在 `D:\reaxuse\source\vueuse\packages\...` 的上游源码。
2. **文件标准结构**（必须包含/修改 5 个标准文件）：
* `packages/<pkg>/src/<Hook>.ts`（包含 JSDoc 映射说明）
* `packages/<pkg>/src/<Hook>.test.tsx`（基于 `vitest-browser-react`）
* `packages/<pkg>/<Hook>/index.md`（包含 Frontmatter、Usage、Types、Source）
* `packages/<pkg>/<Hook>/demo.tsx`
* `packages/<pkg>/src/index.ts`（更新导出映射）


3. **提交与提交验证**：
* **禁止 `git add -A**`，仅精准暂存目标文件。
* Commit 格式：`feat(shared|core): add <Hook> (#N)`
* 创建 PR：`gh pr create --base main --head <branch> --title "..." --body "Closes #N"`
* 监控 CI：使用 `gh pr checks <N> --watch`。需保证核心 5 项 CI Check（lint, autofix, test 22.x, test lts/*, build）全绿；仅 Vercel 挂起超 10 分钟时方可放行。



---

## 6. 编排者调度流程 (Orchestrator Workflow)

### 6a. 单 PR 合并后的元数据同步

执行步骤：`git merge origin/main` $\rightarrow$ `npm run update` $\rightarrow$ 提交 3 个元数据更新文件 $\rightarrow$ Push 至 `origin/main`。

### 6b. 批量处理与合并策略

* **冲突焦点处理**：`index.ts` 导出行冲突时，使用 `scripts/update-branch.sh <worktree> <branch>` 拉取更新并合并（`core` 合并去重并排序，`shared` 解除注释）。
* **批量驱动**：通过 `scripts/driver-core.sh` 进行自动化更新与合并。
* **集成校验**：合并完成后统一运行 `npm run update` 并提交元数据，随后运行 `npx tsc --noEmit` 进行全局类型检查（防止同名导出冲突，如 TS2308）。

---

## 7. 实时状态与任务队列

> **当前基线**（2026-09-08 17:20）：`main` = `bedfcba`，CI 全绿。**开放 PR 0**（#490/#488/#489/**#491** 均已合并）；元数据同步推送（`1cc9e53` 373 functions → `bedfcba` 374 functions，+unrefElement）。
>
> **Round 4 续（17:05–17:20）— #491 unrefElement 合并 + #223 派发**：远端既有分支 `feat/core-unrefelement`（#60，早于 #462）补齐 PR 流程：worktree `D:\projects\reaxuse-wt\unrefelement` 合并 origin/main（index.ts 三方冲突手工解决：main 真实行 + `export * from './unrefElement'` 按字母序插在所有 `use*` 行之前）→ **迁移到 #462 后词汇**（`MaybeComputedElementRef`→`ElementTarget<T>`、`MaybeElement`→`TargetElement`，getter 用例删除、JSDoc/`index.md`/`demo.tsx` 措辞清扫，demo 改纯 ref）→ tsc 相对 0 错误 + eslint 0 + unrefElement 5/5 + exports 6/6 → merge commit `a864263` push → **PR #491** 5/5 CI 绿 → 合并（main `c65ede1`）。同时派发 **#223 useTemplateRefsList**（子代理 `d2a9da99-6830-4e4c-bb7c-03bdbfa2ed81`，worktree `D:\projects\reaxuse-wt\trefslist`，branch `feat/core-usetemplaterefslist`，junction + 独立 `cacheDir` `.vite-trefs` 的 `vitest.worktree.config.ts` 已由编排者预置）。设计裁定（编排者按 §2B 可写容器）：返回元组 `[refs, setAt]`，`refs` 为跨渲染稳定数组（ref-like 容器不触发重渲染），`setAt(i, v|null)` 原位赋槽且同时挂在 `TemplateRefsList<T>` 类型上（保留上游 `refs.setAt` API 保真）。
>
> **Round 4 记录（16:00–17:05）— #462 类型债清偿**：main 因 `8fddc63`（去掉 getter 支持、改名 `RefOrValue` 系）遗留 85 个 tsc 错误 + 47 个失败测试 + shared 构建失败。编排者并行派发 2 个子代理 + 自理一个切片，三分支合一验证后开 **PR #490** 并合并（5/5 CI 绿）：
> - math：`chore/462-math-ref-migration` `a81b1b3`（43 文件；14 源 + 14 测试 + 12 docs；`MaybeComputedRefArgs`→`RefOrValueArgs`；useMath `Reactified<T,Computed>` 折叠为 `Reactified<T>`）。
> - core：`chore/462-core-ref-migration` `9828925`（33+36 文件；20 源/测试 + 14 docs + 36 文件 JSDoc getter 措辞清扫；两个运行时修复：`useBreakpoints.ts:275-278` media-query thunk→纯字符串（getter 到达 `trackedQuery.split` 即崩）、`useStartTyping.ts:159` target thunk→SSR 守卫纯值（旧 thunk 使监听器绑定 0 个））。
> - shared+integrations（编排者自理）：until/syncRefs/useState{Default,AutoReset,Throttled,ManualReset} + useChangeCase/useFocusTrap + 测试迁移（getter 专属用例删除或改 ref 等价物；`useStateAutoReset` 卸载清理改用 `vi.getTimerCount()` 断言）。
> - 集成分支 `chore/462-ref-migration`（14cca07 + 两次 merge + 1589b8a style fix）；**验证门槛全绿**：tsc 0 错误、lint 0、vitest 207 文件/2121 测试 0 失败、build 11/11。
> - 迁移语义基线：`RefOrValue<T> = T | Ref<T>`，**getter（函数）一律不再支持**；`toValue` 只解 `{ current }`，不调函数。
>
> **⚠️ 事故记录（2026-09-08 15:24–15:30，16:08 复发 + 根因确认）**：主树 `packages/**` + `playgrounds/**` 磁盘文件两度批量消失、`node_modules` 两度被清空。**根因确认（16:08）**：对含 `node_modules` **junction** 的 worktree 执行 `git worktree remove --force` 会**穿透 junction 删除目标内容**——清空主树 `node_modules`（914 包仅剩 `.vite-temp`），且同窗口主树未提交编辑被重置、tracked 文件批量显示 ` D`。**铁律：删 worktree 前必须先 `cmd /c rmdir <worktree>\node_modules`（只删 reparse 点），`Test-Path` 确认 junction 已消失，再 `git worktree remove`（必要时 --force）**。恢复法：`npm ci --no-audit --no-fund`（914 包/29s）+ `git checkout -- packages playgrounds`。其他教训：主树只允许编排者做受控操作；**未提交工作随时可能丢失——切片完成立即 commit+push**（round-4 编排者切片曾因本次事故整片重做）。
> **事故恢复（15:40、16:10 两次）**：`node_modules` 由编排者执行 `npm ci --no-audit --no-fund` 恢复（914 包 / 29s，exit 0）。主树 `packages`/`playgrounds` 用 `git checkout -- packages playgrounds` 恢复；根目录误下载的 `upstream-index.{ts,test.ts,md}`（createEventHook 上游源码）已删除。主树遗留 2 个 `lint-staged automatic backup` stash（round-2 元数据提交时产生，无内容价值，可 `git stash clear`）。
> **worktree 验证必读（15:45 实测）**：① 主树 `vitest.config.ts` **没有** `server.fs.allow`，在 worktree 里直接跑会报 `TypeError: Failed to fetch dynamically imported module: http://localhost:PORT/@fs/D:/projects/reaxuse/node_modules/vitest-browser-react/dist/index.js`（依赖经 junction realpath 到主树之外，被 Vite 拒绝）——必须用未跟踪的 `vitest.worktree.config.ts`（= 主配置 + `server.fs.allow` 含 junction 真实路径）并 `--config` 指定，该文件**永不提交**；② 并发 browser 模式会互相污染（实测并发时一个 60s `listOnTimeout` 无测试、一个模块加载失败）——**每个 worktree 的 config 用独立 `cacheDir`**（如 `node_modules/.vite-<name>`，round-4 已实测三 worktree 并行无冲突）；③ 实测串行 + 清缓存后：isDefined 5/5、createEventHook 12/12，eslint exit 0，自身文件 tsc 0 错误；④ **worktree 内 `npx tsc --noEmit` 会把主树的未迁移文件经 `node_modules/@reaxuse/*` junction 拉进编译**（错误路径带 `../../reaxuse/` 前缀）——子代理门槛只看 `Select-String '^packages/<own>/'` 的相对路径行；跨包全量 tsc/测试只能在主树（workspace 符号链接正确的树）做。
> **提交避坑**：`git commit` 输出**禁止**接 `Select-Object -First N`（管道提前关闭会杀掉 pre-commit hook，导致提交未落盘、文件仍 staged、lint-staged 留下 backup stash，且后续 push 会把不含提交的分支推上去）；已手工跑过 eslint 时可直接 `git commit --no-verify`。恢复法：文件仍在 index 里，`git commit --no-verify` + `git stash clear` 即可。
> **Round 3 进展（15:50）**：PR **#488** `feat(shared-isdefined)`（isDefined #27）与 **#489** `feat(shared-createeventhook)`（createEventHook #4）已开出，等 CI。远端新分支：`chore/462-vueonly-cleanup`（= 已合并 #462 的 PR 分支残留，无需处理）、`feat/core-unrefelement`（真新实现：`unrefElement` #60，5 文件 185+ 行，尚无 PR，开 PR 后按 §2 审查）。
>
> **#462 类型债：已清偿（PR #490，2026-09-08 17:00 合并）**。`8fddc63` 遗留的 85 个 tsc 错误 / 47 个失败测试 / shared 构建失败已全部修复（详见 Round 4 记录）。`packages/` 下已无任何 `MaybeRefOrGetter`/`MaybeRef`/`MaybeComputedElementRef`；后续新 Hook 一律用 `RefOrValue` 系（定义见 `packages/shared/src/utils.ts`），**不得再接受 getter**，验证门槛含 `npx tsc --noEmit` 全仓 0 错误（CI 不跑 tsc，需本地自验）。

### 维护与质量管控要点

* **同名类型跨模块导出隔离（TS2308）**：如 `ConfigurableWindow`（由 `useOnline` 导出）、`IgnoredUpdater`（由 `useWatchIgnorable` 导出），后续 Hook 需采用 `import type`，禁止二次 `export`。
* **JSDoc 格式统一**：注释第二段首行统一放置 `Map from @vueuse/<pkg> \`useX``；Watch 家族统一小写名称；非 VueUse 来源明确标注来源库（如 `react-use`或`hairylib`）。
* **并发测试抖动处置**：高负载下 `useTimeoutFn`、`useStateThrottledHistory` 以及 `useWebWorker` 可能出现单测偶发 Failure，单独重新运行测试即可，无需更改业务逻辑。**已验证模式**（多次复现：#380/#393/#401）：CI 的 `test (lts/*)` 偶发失败于 `useWindowScroll`（directions/isScrolling 断言）+ `useWebWorker`（worker boom），与当前 PR 改动无关——`gh run rerun <run-id> --failed` 重跑即绿。
* **文档 Frontmatter**：仅保留 `category: X`，标题默认使用 H1。

### 待处理 Issue 队列 (Queue)

* **优先派发列表**（`core` 包，小型优先）：
* ~~#216 `useStorageAsync`~~ → PR #370（含 §2C 修复）
* ~~#250 `useWebSocket`~~ → PR #371（含 §2C 修复）
* ~~#245 `useVirtualList`~~ → PR #374
* ~~#252 `useWebWorkerFn`~~ → PR #372
* ~~#205 `useScroll`~~ → PR #376（§2C 合规：toValue/noop/ConfigurableWindow 均自 shared）
* ~~#184 `usePointerSwipe`~~ → PR #375（复用 `./useSwipe`/`./usePointer` 类型）


* **Adjustment 标签项**（2026-09-08 开放项）：
* ~~#27 `isDefined`~~ → **已合并 PR #488**（2026-09-08 17:00）
* #223 `useTemplateRefsList`（core，可派发）
* #262 `useWatchExtractedObservable`（rxjs 包，⚠️ rxjs 依赖本地不可解析，暂缓）
* #42 `toObserver`（rxjs 包，同上暂缓）

* ~~派发中（本会话子代理）~~ → **全部完成**：#27 → PR #488（已合并）、#4 `createEventHook` → PR #489（已合并，`on` 返回 `{ off }` 兼容 §2D）。
* **下一个可派发候选**：~~unrefElement #60~~ → **已合并 PR #491**（2026-09-08 17:15，含 #462 后类型迁移）；**#223 派发中**（子代理 `d2a9da99`，worktree `trefslist`）。

* **外部依赖解析现状**（2026-09-08 15:00 实测 `require.resolve`）：✅ 可解析仅 `change-case`、`focus-trap`（已被 #482/#483 消费）；❌ 不可解析：`qrcode` / `jwt-decode` / `idb-keyval` / `fuse.js` / `nprogress` / `universal-cookie` / `axios` / `async-validator` / `drauu` / `sortablejs` / `rxjs` / `firebase` / `electron`——相关 implement issue（#193/#151/#141/#138/#172/#97/#82/#79/#114/#209/#201 及 rxjs/firebase/electron 全部）**继续暂缓**，待维护者安装依赖或允许 `npm install`。无外部依赖的候选：#223（adjustment）、#5/#6/#20/#26/#36（shared，Vue DI/跨实例概念需先确认 React 映射设计）、#11 `computedAsync`（core）、#32 `useElementRemoval`（core，未打标签需维护者分流）、#19/#21/#13（Vue 模板/DI 特有，可能需 adjustment/impractical 裁定，勿擅自派发）。


* **派发规则**：建 Worktree 前务必执行 `gh issue view <N>` 确认需求与期望实现。包目录现状：`router` / `rxjs` / `firebase` / `electron` 骨架已建（PR #391，占位符导出 + meta/packages.ts 注册，router 适配器待定不引依赖）——这 18 个 issue 恢复可派发；`math` / `integrations` 仍为空壳但可派发。
* **派发 Prompt 必含**：§2B 返回值强约束协议 + §2C 引用链协议（通用工具从 `@reaxuse/shared` 引用，禁止本地副本）+ 占位符导出模式（取消注释行，不新增行）。
* **外部依赖约束**：rxjs/firebase/electron 包的外部依赖（`rxjs`/`firebase`/`electron`）为 optional peer，tsdown external 已在 `meta/packages.ts` 声明；实现时不得把外部依赖打包进 bundle。⚠️ 当前 node_modules **未安装**这些依赖（`npm install` 被禁），派发前用 `node -e "require.resolve('rxjs')"` 验证可解析；不可用则暂缓派发，待维护者安装依赖或允许安装。

---

## 8. 边界条件与避坑指南

* **状态校验**：代理终端挂起时，优先执行 `gh pr view <N>` 校验远端 PR 状态。
* **超时停滞判定**：连续 15 分钟无文件修改判定为 Stall；连续两次无响应方可触发 Interrupt 重派。
* **元数据冲突处理**：解决元数据文件冲突时，使用 `git checkout --theirs` 覆盖，并比对 `git diff origin/main --cached` 确保内容无遗漏。
* **Commit 异常防护**：`lint-staged` 超时可能导致静默失败，Push 前需使用 `git log -1` 确认提交记录存在。
* **Worktree 清理**：异常中断导致残留时，利用 `scripts/update-branch.sh` 内置的 `git merge --abort` 与 `git reset --hard HEAD` 进行状态重置。
