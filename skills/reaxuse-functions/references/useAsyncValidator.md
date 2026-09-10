---
category: '@Integrations'
---

# useAsyncValidator

Wrapper for [`async-validator`](https://github.com/yiminghe/async-validator).

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

## Value sources

`value` and `rules` are the hook's **read-only value sources** and take plain values
(`Record<string, any>` and `Rules`; upstream: `MaybeRefOrGetter`). The object is validated as-is, so a
form field literally named `value` is not special.

## Type Declarations

```ts
export type AsyncValidatorError = Error & {
  errors: ValidateError[]
  fields: Record<string, ValidateError[]>
}
export interface UseAsyncValidatorExecuteReturn {
  pass: boolean
  errors: ValidateError[]
  errorInfo: AsyncValidatorError | null
  errorFields: Record<string, ValidateError[]>
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
  /**
   * @see https://github.com/yiminghe/async-validator#options
   */
  validateOption?: ValidateOption
  /**
   * The validation will be triggered right away for the first time.
   * Only works when `manual` is not set to true.
   *
   * @default true
   */
  immediate?: boolean
  /**
   * If set to true, the validation will not be triggered automatically.
   */
  manual?: boolean
}
/**
 * React port of VueUse's `useAsyncValidator` — a wrapper around
 * [`async-validator`](https://github.com/yiminghe/async-validator).
 *
 * Map from @vueuse/integrations `useAsyncValidator`
 * (`source/vueuse/packages/integrations/useAsyncValidator/`). The upstream
 * object return is preserved (`{ pass, isFinished, errors, errorInfo,
 * errorFields, execute }`) with the refs unwrapped: every member is a plain
 * value (no `.value`), `pass` starts as `!immediate || manual`, `execute()`
 * flips `isFinished` to `false`, awaits
 * `validator.validate(value, validateOption)` and settles with
 * `pass`, `errorInfo`, `errors` and `errorFields`; `errors` is
 * `errorInfo?.errors || []` and `errorFields` is `errorInfo?.fields || {}`.
 * `value` and `rules` are the hook's **read-only value sources** and take
 * plain values (`Record<string, any>` and `Rules`; upstream:
 * `MaybeRefOrGetter`); the returned
 * object is promise-like (`await useAsyncValidator(...)` resolves with the
 * current snapshot), mirroring `useAsyncState`.
 *
 * Adjustment for React:
 * - upstream re-runs validation from
 *   `watch([valueRef, validator], execute, { immediate, deep: true })`. React
 *   has no deep observation, so this port re-runs from an effect keyed on the
 *   identity of `value` / `rules` and skips it entirely when
 *   `manual` is `true`. Consequence: mutating the SAME object in place does NOT
 *   re-trigger validation — pass a new object (or new `rules`) or call
 *   `execute()` yourself. In React StrictMode dev builds the initial
 *   validation may run twice (the effect is double-invoked); the extra run is
 *   idempotent.
 * - `errors` and `errorFields` are derived during render from `errorInfo`
 *   (upstream uses `computed`); `execute` is stable and ignores results that
 *   arrive after unmount.
 *
 * @__NO_SIDE_EFFECTS__
 * @example
 * const { pass, isFinished, errors, errorFields, execute } = useAsyncValidator(
 *   form,
 *   { name: { type: 'string', min: 5, max: 20 }, age: { type: 'number' } },
 * )
 * // `pass` becomes true once the initial validation resolves
 *
 * @see https://vueuse.org/useAsyncValidator
 * @see https://github.com/yiminghe/async-validator
 */
export declare function useAsyncValidator(
  value: Record<string, any>,
  rules: Rules,
  options?: UseAsyncValidatorOptions,
): UseAsyncValidatorReturn & PromiseLike<UseAsyncValidatorReturn>
```
