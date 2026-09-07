# reaxuse 监控任务 — 工作模式交接文档

> **文件用途**：会话无缝交接（untracked，禁止提交）。
> **流程文档**：PR 监控/审批/合并的稳定流程见 `PR-MERGE-WORKFLOW.md`（本文件只记会话状态与队列）。
> **目标仓库**：[reaxuse/issues](https://github.com/hairyf/reaxuse/issues)（React 版 VueUse，账号 `hairyf`）
> **当前基线**：`main` = `2fc976a`（**242 functions**；#391 子包骨架已合入）。2026-09-06 批量合并会话（编排者代合并授权）：30 个 PR 全部合并（#371–#399 除 #374，#400–#405），元数据已同步（`9f09c60` + `2fc976a`），`npx tsc --noEmit` 全绿。**#374 useVirtualList §2C 违规已修复**（分支 `c654b3f`：toValue/MaybeRef 改从 `@reaxuse/shared` 导入，删除本地副本），CI 全绿，待维护者合并——这是当前唯一开放 PR。useListener 协议（§2D）完成闭环：#380 合入后 #382 内联兼容层已清理再合并。跨包同名类型 TS2308 已收敛：UseMouseSourceType/UseMouseCoordType 唯一导出于 useMouse.ts，useMousePressed/useMouseInElement 改 `import type`。

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

> **当前基线**：`main` = `b770b26`（**192 functions**）。占位符导出模式已落地；开放 PR 17 个：#371/#372/#374/#377/#378/#379/#380/#381/#382/#383/#384/#385/#386/#387/#388/#389/#390（均 CI 全绿，待维护者合并）。useListener 协议（§2D）已落地（PR #380）。

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


* **Adjustment 标签项**：
* #192 `useProjection`
* #185 `usePrecision`


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
