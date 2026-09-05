import { useInterval } from '@reaxuse/shared'

export default function UseIntervalDemo() {
  const { counter, isActive, pause, resume } = useInterval(1000, { controls: true })

  return (
    <div>
      <p>
        Counter:
        {' '}
        {counter}
      </p>
      <button onClick={() => (isActive ? pause() : resume())}>{isActive ? 'Pause' : 'Resume'}</button>
    </div>
  )
}
