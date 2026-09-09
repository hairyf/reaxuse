---
category: '@Integrations'
---

# useAsyncValidator

Wrapper for [`async-validator`](https://github.com/yiminghe/async-validator) — React port of
VueUse's [`useAsyncValidator`](https://vueuse.org/integrations/useAsyncValidator/). Validates a form
object against a rule descriptor and exposes the result as plain values.

**Mapping:** upstream returns refs (`pass`, `isFinished`, `errors`, `errorInfo`, `errorFields`) plus
`execute`, and is promise-like (`then`). The React port keeps the same object shape with the refs
unwrapped — every member is a plain value (no `.value`) — and keeps the promise-like contract, so
`await useAsyncValidator(...)` resolves with the current snapshot. `pass` starts as
`!immediate || manual`; `execute()` sets `isFinished` to `false`, awaits
`validator.validate(toValue(value), validateOption)`, then settles with `pass`, `errorInfo`,
`errors` (`errorInfo?.errors || []`) and `errorFields` (`errorInfo?.fields || {}`). `value` and
`rules` accept plain values, ref-like `{ current }` objects or getters, resolved with `toValue` from
`@reaxuse/shared`.

## Install

```bash
npm i async-validator@^4
```

## Usage

```tsx
import type { Rules } from 'async-validator'
import { useAsyncValidator } from '@reaxuse/integrations'
import { useState } from 'react'

const rules: Rules = {
  name: { type: 'string', min: 5, max: 20, required: true },
  age: { type: 'number', required: true },
  email: [{ type: 'email', required: true }],
}

function Demo() {
  const [form, setForm] = useState({ name: '', age: '', email: '' })
  // pass a STABLE object (state/ref/memo) — see the note below
  const { pass, isFinished, errorFields } = useAsyncValidator(form, rules)

  return (
    <form>
      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      {errorFields.name?.length ? <div>{errorFields.name[0].message}</div> : null}
      <button disabled={!pass}>Submit</button>
      {isFinished ? null : <span>validating…</span>}
    </form>
  )
}
```

Await the result when you need the finished snapshot:

```tsx
const { pass, errors } = await useAsyncValidator(form, rules)
```

Trigger the validation manually:

```tsx
const { pass, errors, execute } = useAsyncValidator(form, rules, { manual: true })

const { pass: ok, errorFields } = await execute()
```

## Adjustment for React (no deep watch)

Upstream re-runs the validation from `watch([valueRef, validator], execute, { immediate, deep: true })`.
React has no deep observation, so this port re-runs it from an effect that compares the **identity**
of `toValue(value)` / `toValue(rules)` and skips the automatic run entirely when `manual` is `true`:

- mutating the **same** object in place does **not** re-trigger validation — pass a new object (or new
  `rules`), update a ref-like `{ current }` input, or call `execute()` yourself;
- the validated `value` must keep a stable identity across renders. An object literal created inline
  in the render body (`useAsyncValidator({ name }, rules)`) is a new identity on every render, so it
  re-validates on every render — hold it in `useState`/`useRef`/`useMemo` instead;
- the initial validation fires from a mount effect (upstream fires it during setup). In React
  StrictMode dev builds that effect is double-invoked, so the first validation may run twice; the
  extra run is idempotent;
- `errors` and `errorFields` are derived during render from `errorInfo` (upstream computes them with
  `computed`), and `execute` is stable and ignores results that arrive after unmount.

## Type Declarations

```ts
export type AsyncValidatorError = Error & {
  errors: ValidateError[]
  fields: Record<string, ValidateError[]>
}

export interface UseAsyncValidatorExecuteReturn {
  pass: boolean
  errors: ValidateError[] | undefined
  errorInfo: AsyncValidatorError | null
  errorFields: Record<string, ValidateError[]> | undefined
}

export interface UseAsyncValidatorReturn {
  pass: boolean
  isFinished: boolean
  errors: ValidateError[]
  errorInfo: AsyncValidatorError | null
  errorFields: Record<string, ValidateError[]>
  execute: () => Promise<UseAsyncValidatorExecuteReturn>
}

export interface UseAsyncValidatorOptions {
  validateOption?: ValidateOption
  immediate?: boolean // default true
  manual?: boolean
}

export function useAsyncValidator(
  value: RefOrValue<Record<string, any>>,
  rules: RefOrValue<Rules>,
  options?: UseAsyncValidatorOptions,
): UseAsyncValidatorReturn & PromiseLike<UseAsyncValidatorReturn>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/integrations/useAsyncValidator/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useAsyncValidator/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useAsyncValidator/index.test.ts) (mirrored in `useAsyncValidator.test.tsx`),
  [`demo.client.vue`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useAsyncValidator/demo.client.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/integrations/src/useAsyncValidator.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/integrations/src/useAsyncValidator.ts), docs + demo co-located in `packages/integrations/useAsyncValidator/`

<DemoContainer name="useAsyncValidator" />

<Contributors name="useAsyncValidator" />
