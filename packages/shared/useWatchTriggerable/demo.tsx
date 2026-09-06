import { useWatchTriggerable } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseWatchTriggerableDemo() {
  const [source, setSource] = useState(0)
  const [log, setLog] = useState('')

  const { trigger, ignoreUpdates } = useWatchTriggerable(
    source,
    async (value, _, onCleanup) => {
      let canceled = false
      onCleanup(() => {
        canceled = true
      })
      await new Promise(resolve => setTimeout(resolve, 500))
      if (canceled)
        return

      setLog(text => `${text}The value is "${value}"\n`)
    },
  )

  function clear() {
    ignoreUpdates(() => {
      setSource(0)
      setLog('')
    })
  }

  function update() {
    setSource(value => value + 1)
  }

  return (
    <div>
      <p>
        Value:
        {' '}
        {source}
      </p>
      <button onClick={update}>Update</button>
      <button onClick={() => trigger()}>Manual Trigger</button>
      <button onClick={clear}>Reset</button>

      <p>
        Log (500 ms delay)
      </p>

      <pre>{log}</pre>
    </div>
  )
}
