import { useTimeout } from '@reaxuse/shared'

export default function UseTimeoutDemo() {
  const { ready, start } = useTimeout(1000, { controls: true })

  return (
    <div>
      <p>
        Ready:
        {' '}
        {ready ? 'yes' : 'no'}
      </p>
      <button disabled={!ready} onClick={() => start()}>Start Again</button>
    </div>
  )
}
