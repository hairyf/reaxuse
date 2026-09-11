import { useInterval } from '@reause/shared'

export default function UseIntervalDemo() {
  const { counter, isActive, pause, resume, reset } = useInterval(1000, { controls: true })

  return (
    <div>
      <p>
        Counter:
        {' '}
        {counter}
      </p>
      <button onClick={() => (isActive ? pause() : resume())}>{isActive ? 'Pause' : 'Resume'}</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}
