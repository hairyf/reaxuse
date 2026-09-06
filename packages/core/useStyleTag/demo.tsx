import type { ChangeEvent } from 'react'
import { useStyleTag } from '@reaxuse/core'
import { useState } from 'react'

const initialCSS = `
.react-demo { background: #ad4c2e50; }
.react-demo textarea { background: lightyellow; }
`.trim()

export default function UseStyleTagDemo() {
  const [value, setValue] = useState(initialCSS)
  const { id, css, load, unload, isLoaded } = useStyleTag(initialCSS)

  const updateCss = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value)
    css(event.target.value)
  }

  return (
    <div>
      <div>
        Edit CSS:
        <textarea value={value} rows={2} className="w-full" onChange={updateCss} />
      </div>
      <button disabled={isLoaded} onClick={load}>
        Load
      </button>
      <button className="orange" disabled={!isLoaded} onClick={unload}>
        Unload
      </button>
      <div className="usestyle-demo">
        <p>
          ID:
          {' '}
          <code>{id}</code>
        </p>
        <p>
          Loaded:
          {' '}
          <code>{String(isLoaded)}</code>
        </p>
      </div>
    </div>
  )
}
