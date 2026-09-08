# reaxuse 监控任务 — 工作模式交接文档

> **文件用途**：会话无缝交接（untracked，禁止提交）。
> **流程文档**：PR 监控/审批/合并的稳定流程见 `PR-MERGE-WORKFLOW.md`（本文件只记会话状态与队列）。
> **目标仓库**：[reaxuse/issues](https://github.com/hairyf/reaxuse/issues)（React 版 VueUse，账号 `hairyf`）
> **历史基线**（2026-09-08 15:40 会话更新）：`main` = `ea039af`（370 functions，**开放 PR 0**）。本会话（Round 1–2）已完成：① 代合并 PR #482 useChangeCase（issue #90）、#483 useFocusTrap（issue #134），审查全合规、CI 5 项全绿，issue 自动关闭；② #22 `createUnrefFn` 按 `impractical` 协议 `not planned` 关闭（评论 5580640786）；③ 关闭过期 issue #2 useNow / #9 useCounter / #10 useToggle（均已实现并导出，附证据评论）；④ **元数据同步已推送**（`ea039af`，+609/-0，含 batch 435–485 缺口与 #482/#483）。**⚠️ 重要环境事实**：`source/vueuse` 现已初始化（`97fd09c3`，v14.3.0-78-g97fd09c3，Round 7 复核）；运行 `npm run update` 前仍应先 `git submodule update --init source/vueuse`，否则状态列整体降级为 "🚧 ported (no upstream match)"（上一会话的 `145a980` 即因此废弃，未入历史，reflog 可查）。`D:\projects\reaxuse` 检出已不存在；本会话运行在 `D:\reaxuse`（主检出），worktree 位于 `D:\reaxuse-wt\*`。`vitest.worktree.config.ts` 不在版本库内（`.git/info/exclude:8` 忽略），新建 worktree 时必须自行创建，内容见 §4。**Round 7（2026-09-08 18:5x）**：本地 `main` 已 `--ff-only` 至 `0b22ca5`（370 functions，开放 PR 0，40 open issues）；主树 `node_modules/@reaxuse/*` junction 污染已修复并复验（事故与恢复法见 §8）；已派发 #5 与 #16+#17（见 §7 Round 7）。

> **⚠️ 当前基线（2026-09-08 18:5x，本会话 Round 1）**：`main` = `0b22ca5`（**376 functions**，**开放 PR 0**，**开放 issue 40**；`scripts/update.ts` 为权威计数源，`packages/metadata/src/functions.ts` 内 `name:` 条目数 = 376、去重后 258 个唯一函数名，同名跨包重复）。本轮动作：① 本地检出落后 154 提交 → `git merge --ff-only origin/main` 同步至 `0b22ca5`；② **发现并修复主树 node_modules 污染**：`node_modules/@reaxuse/*` 7 个 junction 全指向陈旧 worktree `D:\reaxuse-wt\issue462`（8fddc63，缺 `createEventHook`/`isDefined`/`syncRef`/`syncRefs`/`until`/`useState{AutoReset,Default,ManualReset,Throttled}`）——已全部重指向 `D:\reaxuse\packages\*`、`D:\reaxuse\playgrounds\*`（见 §8）；③ 健康基线复验：`npx tsc --noEmit` = **0**、`npx vitest run --project exports` = **11/11 pass**；④ 派发 2 个子代理（并发 2）：**#16+#17** → 子代理 `f9fd492a-07fe-4e06-8872-192521511691`（worktree `D:\reaxuse-wt\projection`、分支 `feat/math-createprojection`）、**#5 `createGlobalState`** → 子代理 `45a1c666-ffeb-4cbf-823f-6999bd7e5a06`（worktree `D:\reaxuse-wt\createglobalstate`、分支 `feat/shared-createglobalstate`）。

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

* `packages/shared/src/utils.ts`：`toValue` / `isRefLike` / `RefOrValue<T> = T | Ref<T>` / `noop` / `isClient` / `promiseTimeout` / `toArray` / `pxValue` 等通用工具。**⚠️ `MaybeRef`/`MaybeRefOrGetter`/`MaybeComputedElementRef` 已由 #462 + #490 全部删除，新代码一律用 `RefOrValue` 系且不得接受 getter（`toValue` 只解 `{ current }`）。**
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

**一键建 worktree（推荐，编排者脚本，未跟踪）**：

```powershell
pwsh -File D:\reaxuse\.agents\new-worktree.ps1 -Name <hook> -Branch feat/<scope>-<hook>
```

脚本 `D:\reaxuse\.agents\new-worktree.ps1`（未跟踪，勿提交）等价于上面 3 步 + 写 `vitest.worktree.config.ts`：先 `cmd /c rmdir` 清 junction（防 `worktree remove --force` 穿透）、`git fetch origin main`、删同名旧分支、`worktree add`、挂 junction、写 config（`cacheDir .vite-cache-<Name>`），最后打印 worktree/branch/junction 三行供核对。2026-09-08 Round 7 实测通过（`useidbkeyval`/`usecookies`）。

**单测与校验流程**：

* `vitest.worktree.config.ts` 不在版本库内，每个新 worktree 必须自行创建（`cacheDir` 每个 worktree 唯一，避免并发 browser 测试互相污染）：

```ts
import { resolve } from 'node:path'
import { mergeConfig } from 'vitest/config'
import base from './vitest.config'

export default mergeConfig(base, {
  cacheDir: resolve(import.meta.dirname, '.vite-cache-<unique>'),
  server: { fs: { allow: [resolve(import.meta.dirname), 'D:/reaxuse'] } },
})
```

* 运行 Vitest 时必须携带 `--config vitest.worktree.config.ts` 参数。
* 标准校验步骤：Scoped Vitest $\rightarrow$ Scoped ESLint $\rightarrow$ `npx tsc --noEmit`。
* **demo 导入**：worktree 内 `@reaxuse/<pkg>` 经 node_modules junction 解析到主树包，新 hook 尚未合入时 demo 必须走相对导入 `../src/<hook>` + 一行注释（先例 `packages/shared/isDefined/demo.tsx:1-3`、`packages/integrations/useChangeCase/demo.tsx:1-3`）。
* **删除 worktree 前**：必须先 `cmd /c rmdir <wt>\node_modules`（只删 reparse 点），确认 junction 消失后再 `git worktree remove`（见 §8 事故铁律）。

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

> **当前基线**（2026-09-08 18:20）：`main` = `0884955`，CI 全绿。**开放 PR 0**（#490/#488/#489/#491/#492/#493 均已合并）；元数据同步推送（`6693b5c` 375 → `0884955` 376 functions，+computedAsync）。
>
> **Round 7（18:45–，本会话，`D:\reaxuse` 检出）— 基线同步 + 主树 node_modules 修复 + 2 项派发**：① 检出同步：本地 `main` 落后 154 提交（`8c54810`）→ `git merge --ff-only origin/main` → `0b22ca5`；② **主树污染修复**：`node_modules/@reaxuse/*` 7 个 junction 指向陈旧 worktree `issue462`（8fddc63）→ 全部重指向主树 `packages|playgrounds`（根因/恢复法见 §8）；修复后复验 `npx tsc --noEmit` = **0**、`npx vitest run --project exports` = **11/11**；③ 派发（并发 2，零外部依赖 + `implement` 标签 + 从未有 PR）：**#16 `createGenericProjection` + #17 `createProjection`** → 子代理 `f9fd492a-07fe-4e06-8872-192521511691`（worktree `D:\reaxuse-wt\projection`、分支 `feat/math-createprojection`；**一个 PR 关闭两 issue**，#17 委托 #16 故不可拆）；**#5 `createGlobalState`** → 子代理 `45a1c666-ffeb-4cbf-823f-6999bd7e5a06`（worktree `D:\reaxuse-wt\createglobalstate`、分支 `feat/shared-createglobalstate`）。
>
> **#5 设计裁定（编排者，写入子代理 prompt）**：issue 的 Expected 片段把 `useState` 写进 factory = Rules-of-Hooks 违规（首次渲染后 hook 数 1→0，React 抛 "Rendered fewer hooks than expected"），React 也无 `effectScope`/响应式 ref。故实现为**模块级外部 store + `useSyncExternalStore`**，返回 §2B state-like 元组 `[state, setState]`（setter 支持值/函数式更新，`useCallback` 稳定），store 永不 dispose（对齐上游 detached `effectScope(true)` 的 unmount 存活语义），factory 仅首次调用并接收首次调用参数（上游 parity）；deviation 写入 JSDoc + docs + PR body。
> **#16/#17 设计裁定**：`ProjectorFunction` 已由 `packages/math/src/useProjection.ts:8` 导出 → `createGenericProjection.ts` 只 `import type { ProjectorFunction } from './useProjection'`，**禁止再导出**（防 math barrel TS2308）；`createProjection.ts` 按上游自带私有 `defaultNumericProjector` 并委托 `createGenericProjection`；`RefOrValue`/`toValue` 自 `@reaxuse/shared`；两文件均带 `@__NO_SIDE_EFFECTS__`；测试为 `.test.tsx`（browser project 只收 `.tsx`）。
> **#6 `createInjectionState` 设计裁定（编排者预先裁定，worktree 已就绪，等待空槽派发）**：worktree `D:\reaxuse-wt\injectionstate`、分支 `feat/shared-createinjectionstate`（基于 `151831b`）、junction + `vitest.worktree.config.ts`（cacheDir `.vite-cache-cis`）已由编排者建好。**关键事实**：`createContext` 在本仓库**尚无先例**（`packages/*/src` 全量 grep 为 0），本 PR 将确立 Context 系首个范式。**裁定**：① React 无 provide/inject，Provider 侧必须成为**组件**（issue 的 Expected 片段已如此写：`const [CounterStoreProvider, useCounterStore] = createInjectionState(...)`、`<CounterStoreProvider initialValue={0}>…</CounterStoreProvider>`）；② 因 JSX 只能传 props 对象、无法展开可变参数，**factory 签名改为单一 props 对象** `(props: Props) => Return`（issue 片段里的 `(initialValue: number)` 属示意，需按 adjustment 记录改写为 `({ initialValue }: { initialValue: number })`）；③ 返回 `readonly [Provider, useInjectedState]`，顺序与上游 `[useProvidingState, useInjectedState]` 一致（槽位 0 = 提供侧、槽位 1 = 注入侧）；④ `defaultValue` 用 `createContext(defaultValue)` 原生实现，重载保持上游语义（有 `defaultValue` → `Return`，无 → `Return | undefined`）；⑤ **`injectionKey` 选项删除**（React Context 以对象身份为键，无字符串 key 概念）——属 deviation，必须写入 JSDoc + docs + PR body；⑥ 实现文件用 `createElement(Context.Provider, { value: state }, children)`（文件为 `.ts` 不引入 JSX）；`Provider.displayName = composable.name ? \`${composable.name}Provider\` : 'InjectionStateProvider'`；⑦ `children` 为保留 prop（`const { children, ...rest } = props` 后 `composable(rest)`）。**测试镜像范围**：上游 5 个用例中「custom key」「useProvidingState + injectLocal 同组件」**无 React 等价物，删除并记录**；保留「嵌套 Provider/Consumer」「defaultValue 兜底」「无 provider 无 defaultValue → undefined」，新增「嵌套 Provider 覆盖外层」「消费端随状态更新重渲染」。**测试写法**：`import { render, renderHook } from 'vitest-browser-react'` + `const screen = await render(<Comp />)` + `await expect.element(screen.getByText('...')).toBeVisible()`（先例 `packages/shared/src/useCounter.test.tsx:1-25`）。导出占位符：仅取消 `packages/shared/src/index.ts:16`。docs：`packages/shared/createInjectionState/index.md` + `demo.tsx`（相对导入 `../src/createInjectionState`）。
> **Round 7 派发结果（进行中）**：**PR #494** `feat(shared): add createGlobalState (#5)` 已开（分支 `feat/shared-createglobalstate`，提交 `3144273`，5 文件 +340；worktree `D:\reaxuse-wt\createglobalstate`）——https://github.com/hairyf/reaxuse/pull/494 。编排者独立复核通过：`createGlobalState.ts` 用 `useSyncExternalStore(subscribe, getSnapshot, getSnapshot)` + 模块级 `Set` 监听器，`initialized` 显式标志（非 `state ??=`，故 factory 返回 `undefined` 也只跑一次）、`useCallback([])` 稳定 setter、返回 `[state, setState]`（§2B）、带 `@__NO_SIDE_EFFECTS__` 与 `Map from @vueuse/shared \`createGlobalState\``、仅取消 `packages/shared/src/index.ts:13` 占位符、demo 相对导入 + 注释、docs 记录两条 deviation 并引用上游 source+tests、7 个测试（含 unmount 存活 / 稳定 setter / factory 仅一次 / 函数式更新）。**已知可接受偏差**：factory 在 `getSnapshot` 内惰性初始化（渲染期副作用，但 `initialized` 保证仅一次且 `state` 引用稳定，不会触发 useSyncExternalStore 的 infinite-loop 警告）。CI 5 项**全部通过**（autofix 59s / build 1m1s / lint 1m4s / test 22.x 1m41s / test lts/* 1m32s，首轮无 flake，autofix 未产生追加提交），PR 状态 OPEN / MERGEABLE / CLEAN，等维护者合并。
> **PR #495** `feat(math): add createGenericProjection + createProjection (#16, #17)` 已开（分支 `feat/math-createprojection`，提交 `01f0878`，9 文件 +397/-2；worktree `D:\reaxuse-wt\projection`）——https://github.com/hairyf/reaxuse/pull/495 。编排者独立复核通过：`createGenericProjection.ts` 只 `import type { ProjectorFunction } from './useProjection'` 且不重导出（`useProjection.ts` 仅导出 `ProjectorFunction`，无 `UseProjection` → 无 TS2308）、新 `export type UseProjection<F, T> = (input: RefOrValue<F>) => T`、`createProjection.ts` 私有 `defaultNumericProjector` + 可选第三参 `projector`（与上游 `source/vueuse/packages/math/createProjection/index.ts:10-16` 一致）、两文件带 `@__NO_SIDE_EFFECTS__` 与 `Map from @vueuse/math \`createX\``、index.ts 仅取消 2 行占位符、未触碰任何 meta 文件、测试镜像上游数值（0→50 / 10→100 / 5→75 / 1→55 / fromEnd 20→52.5 / toRange [80,120]→82）、编排者手跑 scoped eslint 6 文件 = exit 0。CI 5 项**全部通过**（autofix 53s / build 58s / lint 1m14s / test 22.x 1m25s / test lts/* 1m34s，首轮无 flake，head 仍为 `01f0878`，autofix 未产生追加提交），PR 状态 OPEN / MERGEABLE / CLEAN，等维护者合并。
> **#6 已派发**：子代理 `da3238ff-db83-4126-b1ab-37ef0299af0d`（worktree `D:\reaxuse-wt\injectionstate`、分支 `feat/shared-createinjectionstate`），prompt 内含上条全部裁定 + 测试镜像范围 + 禁令清单；等待其 PR。
> **元数据管线复验（编排者，Round 2–3）**：`npm run update`（= `tsx scripts/update.ts`）在 `main` 上**幂等** —— 输出 `wrote meta/functions.md / packages/metadata/src/functions.ts / packages/functions.md (376 functions)`，之后 `git status --short` 无改动、`git diff --stat` 为空。结论：junction 修复未破坏元数据生成；任一 PR 合并后可直接跑该命令并只提交这 3 个文件。
> **#495 子代理 DONE**（`f9fd492a`）：CI 5/5 首轮通过；唯一 deviation `index.md` frontmatter `category: '@Math'` 经编排者核验**批准**（`packages/math/*/index.md` 现有 16 个文档全部为 `@Math`，issue #16/#17 的 Category 字段亦为 `@Math`），无需改动。
> **PR #496** `feat(shared): add createInjectionState (#6)` 已开（分支 `feat/shared-createinjectionstate`，提交 `cd5fc77`，5 文件 +386/-1；worktree `D:\reaxuse-wt\injectionstate`）——https://github.com/hairyf/reaxuse/pull/496 ，body 含 `Closes #6`。编排者独立复核通过：`createContext(options?.defaultValue)` + `useContext` 注入、Provider 用 `createElement(Context.Provider, { value: state }, children)`、`const { children, ...rest } = props` 后 `composable(rest as Props)`（`children` 保留）、`Provider.displayName` 经 cast 赋值、两处 deviation（`injectionKey` 删除 / 提供侧为组件 / factory 收单一 props 对象）写入 JSDoc + index.md + PR body、仅取消 `packages/shared/src/index.ts:16` 占位符、无 meta 文件改动。CI 5/5 首轮通过（lint 1m48s / autofix 1m46s / build 1m32s / test 22.x 2m0s / test lts/* 2m14s），MERGEABLE / CLEAN，等维护者合并。**子代理额外调整（已批准）**：`CreateInjectionStateReturn` 第 2 类型参数改为 provider 渲染输出 `ProvideReturn = ReactNode`（原样保留会触发 `unused-imports/no-unused-vars`）。
> **🔑 维护者授权（2026-09-08 Round 3，已澄清并执行完毕）**：维护者选择 **“授权安装缺失依赖（axios/qrcode/rxjs 等）”**；追问后确认附加注意事项 = **“主树 junction 污染风险（推荐）”**，安装范围 = **“全部缺失依赖（含 electron）”**。**执行结果见下条**。仍未获授权：18 个未打标签 issue（#13/#19/#20/#21/#24/#26/#32/#36/#80/#125/#131/#174/#199/#200/#210/#218/#219/#226）依旧**不派发**。
> **本轮剩余队列（40 open issues 拆解）**：`implement` 且零外部依赖仅 4 个（#5/#6/#16/#17），已派 3 个，**#6 `createInjectionState` 为下一轮首选**（需 React Context 设计裁定：`useProvidingState` 是 hook 无法 render Provider，API 需调整）；其余 **36 个**：16 个 `implement` 但缺外部依赖（#79/#82/#97/#114/#138/#141/#148/#149/#150/#151/#172/#193/#201/#209/#256/#257）、18 个未打标签需维护者分流（#13/#19/#20/#21/#24/#26/#32/#36/#80/#125/#131/#174/#199/#200/#210/#218/#219/#226）、2 个 `adjustment` 且 rxjs 阻塞（#42/#262）。
> **未打标签 issue 分流建议（编排者，待维护者裁定；未获标签前不派发）**：
> - 可直接 `implement`（零外部依赖 + React 映射明确）：**#32 `useElementRemoval`**（`useEffect` + `MutationObserver`，返回 stop 句柄，上游 `onElementRemoval` 已按 AGENTS.md 改名为 `use*`）、**#20 `createSharedComposable`**（模块级单例 + 引用计数，与 `createGlobalState` 同范式；deviation：无 `effectScope` 销毁）、**#226 `useSSRWidth`**（Context Provider + hook，同 #6 范式）、**#13 `computedInject`**（`useMemo` + `useContext`，参数由 injection key 改为 Context 对象）。
> - 建议 `adjustment`（React 无对应概念，API 需重构）：**#19 `createReusableTemplate`**（改为 Define/Reuse 组件对）、**#21 `createTemplatePromise`**（改为 `[PromiseComponent, open]` 或 hook 返回 promise）、**#26 `injectLocal` / #36 `provideLocal`**（组件外无法 provide，React 下只能是 Context + 组件、与 #6 重叠 → 亦可判 `impractical`）。
> - 仍阻塞（缺依赖）：rxjs（#24/#125/#174/#218/#219）、firebase（#80/#131）、router（#199/#200/#210）。
>
> **📦 依赖安装完成（Round 7，commit `cc21269`，主树 only）**：**只在主树 `D:\reaxuse` 根目录**执行 `npm install --save-dev`（worktree 内严禁，见 §8）。先试过 `-w packages/<pkg>` 工作区安装：`drauu` / `universal-cookie` 被 **nest 到 `packages/integrations/node_modules/`**（根目录不可解析 → worktree 里也解析不到），故 **回滚 4 个工作区 package.json 的 devDependencies，改为根级 devDependencies 安装**（根级必然 hoist）。最终 16 个包全在 `D:\reaxuse\node_modules`：`@types/nprogress ^0.2.3`、`@types/qrcode ^1.5.6`、`@types/sortablejs ^1.15.9`、`async-validator ^4.2.5`、`axios ^1.20.0`、`drauu ^1.0.0`、`electron ^13.6.9`、`firebase ^12.18.0`、`fuse.js ^7.5.0`、`idb-keyval ^6.3.0`、`jwt-decode ^4.0.0`、`nprogress ^0.2.0`、`qrcode ^1.5.4`、`rxjs ^6.6.7`、`sortablejs ^1.15.7`、`universal-cookie ^8.1.2`（版本取自上游 `source/vueuse/pnpm-workspace.yaml` catalogs）。同时给 4 个包补 **peerDependencies**（对齐上游消费者契约）：`integrations` 12 个库全部 `optional: true`（`async-validator ^4`/`axios ^1`/`change-case ^5`/`drauu ^1||^0.4`/`focus-trap ^7||^8`/`fuse.js ^7`/`idb-keyval ^6`/`jwt-decode ^4`/`nprogress ^0.2`/`qrcode ^1.5`/`sortablejs ^1`/`universal-cookie ^7||^8`）、`rxjs >=6.0.0`、`firebase >=9.0.0`、`electron >=9.0.0`（三者非 optional，与上游一致）。**复验全绿**：`npm install` exit 0；junction 现为 **11 个**（core/electron/firebase/integrations/math/metadata/playground-next/playground-vite/router/rxjs/shared）全部指向主树；`npx tsc --noEmit` = 0；`npx vitest run --project exports` = 11/11；从 worktree `D:\reaxuse-wt\projection\packages\integrations\src` 实测 10 个库 `require.resolve` **WT-OK** + `rxjs`/`firebase/app`/`electron` **WT-ESM-OK**。改动文件：`package.json`、`package-lock.json`、`packages/{integrations,rxjs,firebase,electron}/package.json`（+2623/−115；lock 仅额外移除 2 个陈旧条目 `node_modules/@vueuse/core`、`node_modules/@vueuse/integrations`）。npm audit 报 9 漏洞（5 moderate / 4 high），来源为旧 `electron@13`。`react-router-dom` **仍未安装**（router 适配器待定）。
> **🔓 队列解锁**：安装后 `implement` 标签且依赖已就绪 = **15 个**：integrations 10 个（#79 `useAsyncValidator`、#82 `useAxios`、#97 `useCookies`、#114 `useDrauu`、#138 `useFuse`、#141 `useIDBKeyval`、#151 `useJwt`、#172 `useNProgress`、#193 `useQRCode`、#209 `useSortable`）+ electron 5 个（#148/#149/#150/#256/#257，需 electron 运行时，测试难，暂缓）。rxjs 系 issue（#24/#125/#174/#218/#219）与 firebase 系（#80/#131）依赖已就绪但**仍未打标签**，不派发。
> **Round 7 第二批派发（依赖解锁后，并发 2）**：**#151 `useJwt`** → 子代理 `d02d6f9c-d0eb-4381-95dd-ad1a8ec4427d`（worktree `D:\reaxuse-wt\usejwt`、分支 `feat/integrations-usejwt`、`cacheDir .vite-cache-usejwt`）；**#138 `useFuse`** → 子代理 `9681baf3-c754-41a8-937e-d7cd8cf5c0ab`（worktree `D:\reaxuse-wt\usefuse`、分支 `feat/integrations-usefuse`、`cacheDir .vite-cache-usefuse`）。两 worktree 均基于 `cc21269`（已含依赖）。
> **#151 `useJwt` 设计裁定**：① 返回**对象非元组** `{ header, payload }`（issue 的 Expected 即 `const { header, payload } = useJwt(...)`，两字段类型异构且具名；对象返回有先例 `packages/core/src/useBattery.ts:145`、`packages/core/src/useClipboard.ts:248`——§2B 的元组约束针对「ref 对象式返回」，不适用于具名异构字段）；② 值为**纯值**（上游 `ComputedRef` → `Header | Fallback` / `Payload | Fallback`），`useMemo` 以解析后的 token 字符串为依赖；③ `onError` 存 `useRef` 取最新值，避免内联箭头函数污染 memo 依赖；④ 签名 `useJwt<Payload extends object = JwtPayload, Header extends object = JwtHeader, Fallback = null>(encodedJwt: RefOrValue<string>, options: UseJwtOptions<Fallback> = {}): UseJwtReturn<Payload, Header, Fallback>`；⑤ 记录 deviation：StrictMode dev 双渲染下坏 token 可能触发 `onError` 两次；⑥ 占位符仅 `packages/integrations/src/index.ts:17`。
> **#138 `useFuse` 设计裁定**：① 返回**对象** `{ fuse, results }`（`fuse: Fuse<DataItem>`、`results: FuseResult<DataItem>[]`，无 `.value`）；② `useMemo` 重建 Fuse 实例，依赖 `[dataValue, optionsValue?.fuseOptions]`；**放弃上游 deep watch**，因 React 无深度依赖追踪，序列化 options 会破坏 `sortFn`/`getFn` 等函数选项 → 文档要求调用方传入 memo 化的 `fuseOptions`（正确性不受影响，仅重建开销）；③ `results` 用 `useMemo`：`matchAllWhenSearchEmpty && !search` → `data.map((item, index) => ({ item, refIndex: index }))`，否则 `fuse.search(search, resultLimit ? { limit } : undefined)`；④ 签名 `useFuse<DataItem>(search: RefOrValue<string>, data: RefOrValue<DataItem[]>, options?: RefOrValue<UseFuseOptions<DataItem>>): UseFuseReturn<DataItem>`；⑤ 占位符仅 `packages/integrations/src/index.ts:15`；⑥ 测试用 `renderHook` + `rerender` 镜像上游「data 变更」「搜索新数据」两例，另补 `resultLimit` 与 issue 的模糊排序例。
> **PR #497** `feat(integrations): add useJwt (#151)`（分支 `feat/integrations-usejwt`，提交 `93740d3`，5 文件 +311/−1）——https://github.com/hairyf/reaxuse/pull/497 。编排者复核：`index.ts` 仅 1 行（`// export * from './useJwt'` → 真实行）、无 meta 文件改动、`useJwt.ts` 用 `RefOrValue<string>`+`toValue`、`useMemo([token, fallbackValue])`、`onError` 存 `useRef`、对象返回 `{ header, payload }`、6 测试（含 `rerender` 响应性 + ref-like 输入 + `fallbackValue`）。CI 5/5（lint 1m14s / autofix 1m2s / build 51s / test 22.x 1m22s（**1 次重跑**：首轮仅挂已知抖动 `packages/core/src/useWindowScroll.test.tsx:117` directions 断言，`gh run rerun --failed` 即绿）/ test lts/* 1m38s），CLEAN/MERGEABLE，未合并。
> **PR #498** `feat(integrations): add useFuse (#138)`（分支 `feat/integrations-usefuse`，提交 `c0549c1`，5 文件 +472/−1）——https://github.com/hairyf/reaxuse/pull/498 。编排者复核：`index.ts` 仅 1 行、无 meta 改动、对象返回 `{ fuse, results }`、`useMemo([dataValue, optionsValue?.fuseOptions])`、type-only fuse.js 导入（`turbo build --filter=@reaxuse/integrations` 的 `dist/index.d.ts` 无 `MISSING_EXPORT`）、5 测试。CI 5/5 **首轮零重跑**（autofix 55s / build 55s / lint 1m2s / test 22.x 1m20s / test lts/* 1m29s），CLEAN/MERGEABLE，未合并。**子代理发现（重要，写文档备查）**：`fuse.js@7.5.0` 的 `search()` 对空/空白查询短路（`node_modules/fuse.js/dist/fuse.mjs:1383` `if (isString(query) && !query.trim())` → 按原序返回全部文档并遵守 `limit`），故上游 `matchAllWhenSearchEmpty` 分支在本版本近乎冗余；实现保留上游分支原样（空搜索路径忽略 `resultLimit`，与 fuse 自身路径不同），该边界未测（版本相关）。另：issue 的模糊排序 `'Jhon D'` → `['John Doe','John Smith','Jane Doe']`（refIndex `[1,0,2]`）实测与上游文档完全一致。
> **🔒 维护者裁定（未打标签 issue，原始回答）**：就 18 个未打标签 issue 的分流提问，维护者答 **“不允许打，这些没打标签是因为我没想好”** → **禁止自行打标签、禁止派发未打标签 issue**；已把该约束写入本文件，队列只做已打标签项。依赖已装好也不改变此约束。
> **Round 7 第三批派发（依赖解锁后第二批，并发 2）**：**#172 `useNProgress`** → 子代理 `6e676e2a-3c62-4b7d-80ae-e799b0dca19e`（worktree `D:\reaxuse-wt\usenprogress`、分支 `feat/integrations-usenprogress`、`cacheDir .vite-cache-usenprogress`）；**#193 `useQRCode`** → 子代理 `3479e751-0757-4fd5-b414-7bc5658b5f02`（worktree `D:\reaxuse-wt\useqrcode`、分支 `feat/integrations-useqrcode`、`cacheDir .vite-cache-useqrcode`）。两 worktree 基于 `78fd7a8`。
> **⏭ 下一批预裁定（#172/#193 已派发，其余待用）**：
> - **#172 `useNProgress`**（上游 `source/vueuse/packages/integrations/useNProgress/index.ts`，**上游无 `index.test.ts`，测试需自撰**）：返回**对象** `{ isLoading: boolean; progress: number | null | undefined; setIsLoading: (load: boolean) => void; setProgress: (n: number) => void; start: () => NProgress; done: (force?: boolean) => NProgress; remove: () => void }`（上游 `isLoading` 是可写 computed → React 拆成值 + setter）。**禁止 monkeypatch 全局 `nprogress.set`**（上游那样做是全局污染）→ 自有 `setProgress` 同时写 state 与调 `nprogress.set(n)`；`options` 存在时在挂载 effect 里 `nprogress.configure(options)` 一次；`useEffect(() => () => nprogress.remove(), [])` 对齐 `tryOnScopeDispose`；`isClient` 自 `@reaxuse/shared`；占位符 `packages/integrations/src/index.ts:18`；测试避免计时断言（断言 `start()` → `isLoading` true、`done()` → false、`remove()` → 清空 `#nprogress`）。
> - **#193 `useQRCode`**（上游 `source/vueuse/packages/integrations/useQRCode/index.ts`，**无上游测试**）：上游返回 `shallowRef<string>`（dataURL）→ React 返回**纯值** `string`（§2B 非元组范畴）。签名 `useQRCode(text: RefOrValue<string>, options?: QRCode.QRCodeToDataURLOptions): string`；`useState('')` + `useEffect` 内 `QRCode.toDataURL(value, options)`（`isClient` 守卫 + `cancelled` 标志防卸载后 setState）；`options` 需调用方 memo 化（同 #138 理由，写入 JSDoc）；占位符 `packages/integrations/src/index.ts:19`；测试用 `expect.poll`/`vi.waitFor` 等 dataURL 前缀 `data:image/png;base64,`。
> - **#141 `useIDBKeyval`（上游已读，待空槽）**：上游 `source/vueuse/packages/integrations/useIDBKeyval/index.ts` 返回 `{ data: RemovableRef<T>; isFinished: ShallowRef<boolean>; isSupported: ComputedRef<boolean>; set: (value: T) => Promise<void> }`（另有 `index.test.ts` + `index.browser.test.ts` 可镜像）。**§2B 判定**：属「State-like 可写 Hook」→ 默认元组；因 `isFinished`/`isSupported` 不可丢，采用 §2B 已确立的第三槽形式 `[data, setData, controls]`（先例 `useStateWithControl` 的 `[value, setValue, controls]`），`data: T | null`、`setData(value: T | null) => Promise<void>`（`null` → `del(key)`）、`controls = { isFinished: boolean; isSupported: boolean }`。其余映射：`useSupported` → 直接算 `typeof window !== 'undefined' && 'BroadcastChannel' in window`；`watchPausable(data, write, { flush, deep })` → React 无深度侦听，改为**显式 `setData` 写库**（自动写只保留浅层 `useEffect` 可选，需在 JSDoc 说明差异）；BroadcastChannel 名 `vueuse-idb-${JSON.stringify(key)}` 保留（跨标签页同步），卸载 `channel.close()`；`serializer.read/write`、`onError` 默认 `console.error`、`writeDefaults` 语义照搬。**注意**：上游 `index.browser.test.ts` 依赖真实 IndexedDB（浏览器 project 有），测试须清理库。
> - **#97 `useCookies`（上游已读，待空槽）**：上游 `source/vueuse/packages/integrations/useCookies/index.ts` 返回**方法对象** `{ get, getAll, set, remove, addChangeListener, removeChangeListener }` + `createCookies(req?)`（SSR 用 `req.headers.cookie`）。**§2B 判定**：非可写 state-like（返回的是方法对象，不是 ref）→ 走「对象镜像 Hook」保持对象返回。React 映射：`touches` 计数器 → `useState` 计数 + `cookies.addChangeListener(onChange)` 触发重渲染（`shouldUpdate(dependencies, new, old)` 逻辑照搬），卸载时 `removeChangeListener`；`get`/`getAll` 每次渲染重新读 cookie（不再是 Vue 响应式 getter）；`createCookies(req?: { headers?: { cookie?: string | null } })` 参数类型改为结构化对象（避免 `node:http` 依赖），并接受 `string` cookie 头。
> **Round 6（17:45–18:20）— #493 computedAsync 合并**：派发 #11 `computedAsync`（size:L，子代理 `ede64efa`，worktree `computedasync`，branch `feat/core-computedasync`）。中途 15 分钟无文件写入判定疑似 stall，`send_message` 状态探针后恢复（实为长读上游/前例阶段）——**探针优于中断**。commit `cc0fe33`：12/12 browser 测试、tsc 0、eslint 0 → §2 审查通过 → 5/5 CI 绿 → 合并。**设计（编排者裁定，纯派生值 → 非 §2B 元组）**：`computedAsync<T>(evaluationCallback, initialState: RefOrValue<T>, options?: AsyncComputedOptions): T`；`AsyncComputedOptions = { deps?: unknown[]; onEvaluating?: (v: boolean) => void; lazy?: boolean; onError?: (e) => void }`——React 无响应式图，`deps` 数组替代上游自动依赖追踪（默认 `[]` = 仅挂载求值）；上游 `evaluating` ref → `onEvaluating` 回调（每次求值 false 至多一次：被淘汰的求值在 invalidation 时 settle，不在其被抛弃的 Promise 迟到时重复 settle；卸载后不调用）；counter 陈旧保护 + `hasFinished` 取消注册表 + 卸载丢弃，均为上游 parity；上游被拒/取消的求值仍进 `onError`（传自定义 `onError` 静音 AbortError）；`shallow`/ref-overload 不可移植已折叠；`asyncComputed` 别名不移植；`Fn` 本地定义（shared 未导出，前例 `packages/shared/src/useIntervalFn.ts:3`）；`defaultOnError` 注意 `globalThis.reportError(e)` 必须以 globalThis 为 receiver（否则 Chromium "Illegal invocation"）。
>
> **Round 5（17:20–17:45）— #492 useRefsList 合并 + 维护者更名指令**：子代理 `d2a9da99` 完成 useTemplateRefsList（#223）→ PR #492（commit `c9ac91a`，9/9 测试，tsc/eslint 0）。§2 审查通过（元组协议/稳定身份/`refs.setAt === setAt`/`T | null` 卸载语义/分歧映射 JSDoc/仅取消自己占位符行）；CI `test (lts/*)` 首轮失败 = 已知抖动（useRafFn once 断言 + useWindowScroll directions + worker boom），重跑即绿。**维护者指令：reaxuse 侧更名 `useTemplateRefsList` → `useRefsList`**——在分支上执行 `git mv`×3 + 内容改名 + index.ts 旧行删除、新行按字母序插回（`useSpeechSynthesis` 与 `useSSRWidth` 之间，`user` < `uses`）→ commit `cc7dfa0` `refactor(core)!: rename useTemplateRefsList to useRefsList` → 9/9 + tsc 0 + eslint 0 → 5/5 CI 绿 → 合并（main `8a1c321`）。**AGENTS.md 落地要点：上游源名 `useTemplateRefsList` 保留在 Map from JSDoc 与上游链接/路径中**（批量改名后须人工恢复这些行）；`useRefsList` 无预置占位符 → 按 AGENTS.md 罕见情形规则直接插入真实行。设计最终态：`useRefsList<T>(): [TemplateRefsList<T>, setAt]`，`TemplateRefsList<T> = T[] & { setAt: (index, value: T | null) => void }`（函数属性形式，因 `ts/method-signature-style` 禁 shorthand），refs 惰性 `useRef` 单次创建、身份跨渲染稳定、变更不触发重渲染。
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
* ~~#223 `useTemplateRefsList`~~ → **已合并 PR #492**（2026-09-08 17:40，reaxuse 侧更名为 `useRefsList`，维护者指令）
* ~~#11 `computedAsync`~~ → **已合并 PR #493**（2026-09-08 18:10，deps/onEvaluating React 映射，见 Round 6 记录）
* #262 `useWatchExtractedObservable`（rxjs 包，⚠️ rxjs 依赖本地不可解析，暂缓）
* #42 `toObserver`（rxjs 包，同上暂缓）

* ~~派发中（本会话子代理）~~ → **全部完成**：#27 → PR #488（已合并）、#4 `createEventHook` → PR #489（已合并，`on` 返回 `{ off }` 兼容 §2D）、#223 → PR #492（已合并，更名 `useRefsList`）。
* **下一个可派发候选**：~~unrefElement #60~~ → **已合并 PR #491**（2026-09-08 17:15，含 #462 后类型迁移）；~~#223~~ → **已合并 PR #492**。剩余候选见外部依赖解析现状（#5/#6/#20/#26/#36 shared 设计确认、#11 `computedAsync`、#32 `useElementRemoval` 需维护者分流等）。

* **外部依赖解析现状**（2026-09-08 Round 7 更新，`cc21269` 之后）：✅ **全部已解析**——`change-case`/`focus-trap`（#482/#483）+ 新增 16 个根级 devDependencies（见 §7「依赖安装完成」条）：`async-validator`/`axios`/`drauu`/`fuse.js`/`idb-keyval`/`jwt-decode`/`nprogress`/`qrcode`/`sortablejs`/`universal-cookie`/`rxjs`/`firebase`/`electron` + 3 个 `@types`。因此 integrations 的 10 个 `implement` issue 与 electron 的 5 个均已解锁；rxjs/firebase 系 issue 依赖就绪但**未打标签**（#24/#125/#174/#218/#219、#80/#131）仍不派发；`react-router-dom` 未安装（router 适配器待定，#199/#200/#210 仍阻塞）。**注意**：`npm install` 仅允许在**主树**执行（§8），worktree 内禁止。


* **派发规则**：建 Worktree 前务必执行 `gh issue view <N>` 确认需求与期望实现。包目录现状：`router` / `rxjs` / `firebase` / `electron` 骨架已建（PR #391，占位符导出 + meta/packages.ts 注册，router 适配器待定不引依赖）——这 18 个 issue 恢复可派发；`math` / `integrations` 仍为空壳但可派发。
* **派发 Prompt 必含**：§2B 返回值强约束协议 + §2C 引用链协议（通用工具从 `@reaxuse/shared` 引用，禁止本地副本）+ 占位符导出模式（取消注释行，不新增行）。
* **外部依赖约束**：rxjs/firebase/electron 包的外部依赖（`rxjs`/`firebase`/`electron`）为 optional peer，tsdown external 已在 `meta/packages.ts` 声明；实现时不得把外部依赖打包进 bundle。✅ **依赖已安装**（2026-09-08 Round 7，主树根级 devDependencies，commit `cc21269`）；派发前仍建议 `node -e "require.resolve('rxjs')"` 快速自检，若失效先查 §8 junction 污染。

---

## 8. 边界条件与避坑指南

* **状态校验**：代理终端挂起时，优先执行 `gh pr view <N>` 校验远端 PR 状态。
* **超时停滞判定**：连续 15 分钟无文件修改判定为 Stall；连续两次无响应方可触发 Interrupt 重派。
* **元数据冲突处理**：解决元数据文件冲突时，使用 `git checkout --theirs` 覆盖，并比对 `git diff origin/main --cached` 确保内容无遗漏。
* **Commit 异常防护**：`lint-staged` 超时可能导致静默失败，Push 前需使用 `git log -1` 确认提交记录存在。
* **Worktree 清理**：异常中断导致残留时，利用 `scripts/update-branch.sh` 内置的 `git merge --abort` 与 `git reset --hard HEAD` 进行状态重置。
* **🔴 node_modules junction 污染（2026-09-08 Round 7 实测事故，铁律）**：主树 `D:\reaxuse\node_modules\@reaxuse\{core,integrations,math,metadata,shared,playground-next,playground-vite}` 是 **junction**；worktree 的 `node_modules` 又是指向 `D:\reaxuse\node_modules` 的 junction，因此在 worktree 内跑 `npm install` / `npm ci` **会重写主树的链接**，把 7 个包全部指向该 worktree 自己的 `packages/*`（本次指向陈旧 `D:\reaxuse-wt\issue462`，commit `8fddc63`，缺失 `createEventHook.ts`/`isDefined.ts`/`syncRef.ts`/`syncRefs.ts`/`until.ts`/`useStateAutoReset.ts`/`useStateDefault.ts`/`useStateManualReset.ts`/`useStateThrottled.ts`）。**后果**：`npx tsc --noEmit` 仍可能 exit 0（陈旧链接被静默容忍），但主树实际编译/测试的是旧代码，判断全部失真。
  * **自查**：`Get-ChildItem D:\reaxuse\node_modules -Recurse -Depth 1 -Directory | ? LinkType`，任何 `@reaxuse\*` 的 `Target` 不在 `D:\reaxuse\packages|playgrounds` 下即为污染。
  * **恢复**：逐个 `cmd /c rmdir D:\reaxuse\node_modules\@reaxuse\<k>`（只删 reparse 点，勿用 `Remove-Item -Recurse`）后 `New-Item -ItemType Junction -Path <link> -Target D:\reaxuse\<packages|playgrounds>\<dir>`。
  * **预防**：worktree 内**永不**执行 `npm install` / `npm ci`（本仓库本就用 junction 共享依赖）；删除 worktree 前先 `cmd /c rmdir <wt>\node_modules`。
  * **复验基线**（修复后实测）：`npx tsc --noEmit` = 0；`npx vitest run --project exports` = 2 files / 11 tests passed。
* **📦 新增外部依赖的正确流程（2026-09-08 Round 7 实测，主树 only）**：① 在**主树根目录**执行 `npm install --save-dev <pkgs>`（**不要**用 `npm install -w packages/<pkg>`：实测 `drauu`/`universal-cookie` 会被 nest 到 `packages/integrations/node_modules/`，根目录不可解析 → 所有 worktree 都解析不到）；② 装完立即复验 junction（上条自查），npm 会顺带创建/修复 `@reaxuse/*` 链接；③ **从 worktree 实测解析**：`cd D:\reaxuse-wt\<x>\packages\<pkg>\src; node -e "require.resolve('lib')"`（CJS 库）+ `node --input-type=module -e "await import('lib')"`（ESM 库；`firebase` 根入口 `require.resolve` 必然失败，须用子路径 `firebase/app`）；④ 健康复验 `npx tsc --noEmit` + `npx vitest run --project exports`；⑤ 版本取自上游 `source/vueuse/pnpm-workspace.yaml` 的 catalogs，并在对应 `packages/<pkg>/package.json` 补 `peerDependencies`（integrations 全部 `optional: true` + `peerDependenciesMeta`）；⑥ 提交信息 `chore(deps): ...`，只提交 `package.json`/`package-lock.json`/相关包 `package.json`。
