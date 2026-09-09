---
category: '@Integrations'
---

# useAsyncValidator

Wrapper for [`async-validator`](https://github.com/yiminghe/async-validator)

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

## Value sources

`value` and `rules` are the hook's **read-only value sources** and take plain values
(`Record<string, any>` and `Rules`; upstream: `MaybeRefOrGetter`). The object is validated as-is, so a
form field literally named `value` is not special.

## Adjustment for React (no deep watch)

Upstream re-runs the validation from `watch([valueRef, validator], execute, { immediate, deep: true })`.
React has no deep observation, so this port re-runs it from an effect that compares the **identity**
of `value` / `rules` and skips the automatic run entirely when `manual` is `true`:

- mutating the **same** object in place does **not** re-trigger validation — pass a new object (or new
  `rules`) or call `execute()` yourself;
- the validated `value` must keep a stable identity across renders. An object literal created inline
  in the render body (`useAsyncValidator({ name }, rules)`) is a new identity on every render, so it
  re-validates on every render — hold it in `useState`/`useRef`/`useMemo` instead;
- the initial validation fires from a mount effect (upstream fires it during setup). In React
  StrictMode dev builds that effect is double-invoked, so the first validation may run twice; the
  extra run is idempotent;
- `errors` and `errorFields` are derived during render from `errorInfo` (upstream computes them with
  `computed`), and `execute` is stable and ignores results that arrive after unmount.
