import { useCached } from '@reause/core'
import { useState } from 'react'

interface Value {
  value: number
  extra: number
}

function comparator(newSourceValue: Value, cachedValue: Value) {
  return newSourceValue.value === cachedValue.value
}

export default function UseCachedDemo() {
  const [value, setValue] = useState<Value>({ value: 42, extra: 0 })
  const cachedValue = useCached(value, comparator)

  const [inputValue, setInputValue] = useState(value.value)
  const [inputExtra, setInputExtra] = useState(value.extra)

  function onSyncClick() {
    setValue({ value: inputValue, extra: inputExtra })
  }

  return (
    <div>
      <div>
        <div>
          Value:
          {value.value}
        </div>
        <div>
          Extra:
          {value.extra}
        </div>
        <div>
          Cached Value:
          {cachedValue.value}
        </div>
        <div>
          Cached Extra:
          {cachedValue.extra}
        </div>

        <div>
          <label htmlFor="localValue">Temp Value: </label>
          <input
            id="localValue"
            type="number"
            value={inputValue}
            onChange={event => setInputValue(Number(event.target.value))}
          />
        </div>
        <div>
          <label htmlFor="localExtra">Local Extra: </label>
          <input
            id="localExtra"
            type="number"
            value={inputExtra}
            onChange={event => setInputExtra(Number(event.target.value))}
          />
        </div>
        <div>
          <button onClick={onSyncClick}>
            Sync
          </button>
        </div>
      </div>
    </div>
  )
}
