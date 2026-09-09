import type { Rules } from 'async-validator'
import { useState } from 'react'
// Relative (not `@reaxuse/integrations`): until this PR is merged the package
// name resolves through the worktree node_modules junction to the main repo's
// still-empty integrations package.
import { useAsyncValidator } from '../src/useAsyncValidator'

const rules: Rules = {
  name: {
    type: 'string',
    min: 5,
    max: 20,
    required: true,
  },
  age: {
    type: 'number',
    required: true,
  },
  email: [
    {
      type: 'email',
      required: true,
    },
  ],
}

const emptyForm = { email: '', name: '', age: '' }

export default function UseAsyncValidatorDemo() {
  // stable identity: the hook re-validates when the `value` identity changes
  const [form, setForm] = useState<Record<string, any>>(emptyForm)
  const { pass, isFinished, errorFields, execute } = useAsyncValidator(form, rules, {
    // start clean and let the button drive the first validation
    manual: true,
    validateOption: { suppressWarning: true },
  })

  function update(field: string, value: string) {
    setForm(current => ({ ...current, [field]: field === 'age' ? Number(value) : value }))
  }

  return (
    <div>
      <div>
        <code>pass:</code>
        {' '}
        <b>{String(pass)}</b>
      </div>
      <div>
        <code>isFinished:</code>
        {' '}
        <b>{String(isFinished)}</b>
      </div>

      <hr />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label>
          Email
          <input
            type="text"
            placeholder="Email"
            value={form.email}
            onChange={event => update('email', event.target.value)}
          />
          {errorFields.email?.length ? <div style={{ color: 'red' }}>{errorFields.email[0].message}</div> : null}
        </label>

        <label>
          Name
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={event => update('name', event.target.value)}
          />
          {errorFields.name?.length ? <div style={{ color: 'red' }}>{errorFields.name[0].message}</div> : null}
        </label>

        <label>
          Age
          <input
            type="number"
            placeholder="Age"
            value={form.age}
            onChange={event => update('age', event.target.value)}
          />
          {errorFields.age?.length ? <div style={{ color: 'red' }}>{errorFields.age[0].message}</div> : null}
        </label>

        <div>
          <button type="button" disabled={!pass}>Submit</button>
          {' '}
          <button type="button" onClick={() => void execute()}>Validate now</button>
        </div>
      </div>
    </div>
  )
}
