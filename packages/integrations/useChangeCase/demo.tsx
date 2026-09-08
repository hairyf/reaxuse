// Relative (not `@reaxuse/integrations`): until this PR is merged the package
// name resolves through the worktree node_modules junction to the main repo's
// still-empty integrations package.
import type { ChangeCaseType } from '../src/useChangeCase'
import * as ChangeCase from 'change-case'
import { useState } from 'react'
import { useChangeCase } from '../src/useChangeCase'

const transforms = Object.keys(ChangeCase).filter(v => v.endsWith('Case'))

export default function UseChangeCaseDemo() {
  const [inputValue, setInputValue] = useState('helloWorld')
  const [type, setType] = useState<ChangeCaseType>(transforms[0] as ChangeCaseType)
  // ref-like wrapper mirrors the upstream demo's `shallowRef` input — the hook
  // re-syncs whenever the resolved value changes
  const input = { current: inputValue }
  const [changeCase] = useChangeCase(input, type)

  return (
    <div>
      <div>
        {transforms.map(item => (
          <label key={item} className="radio">
            <input
              type="radio"
              checked={type === item}
              onChange={() => setType(item as ChangeCaseType)}
            >
            </input>
            <span>{item}</span>
          </label>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={event => setInputValue(event.target.value)}
      >
      </input>
      <pre>{changeCase}</pre>
    </div>
  )
}
