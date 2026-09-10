import { SSRWidthProvider, useSSRWidth } from '@reaxuse/core'
import { useState } from 'react'

function WidthReader() {
  const [width, setWidth] = useSSRWidth()

  return (
    <div>
      <p>
        Read width:
        {' '}
        <b>{width ?? 'not provided'}</b>
      </p>
      <button type="button" onClick={() => setWidth(1024)}>
        Set 1024
      </button>
      <button type="button" onClick={() => setWidth(null)}>
        Clear
      </button>
    </div>
  )
}

export default function UseSSRWidthDemo() {
  const [providerWidth, setProviderWidth] = useState<number | null>(500)

  return (
    <div>
      <p>
        Provider width:
        {' '}
        <input
          type="number"
          value={providerWidth ?? ''}
          onChange={(event) => {
            const next = event.target.value
            setProviderWidth(next === '' ? null : Number(next))
          }}
        />
      </p>
      <SSRWidthProvider width={providerWidth}>
        <WidthReader />
      </SSRWidthProvider>
    </div>
  )
}
