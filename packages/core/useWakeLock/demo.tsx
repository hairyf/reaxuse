import { useWakeLock } from '@reaxuse/core'

export default function UseWakeLockDemo() {
  const { isSupported, isActive, request, release } = useWakeLock()

  return (
    <div>
      <p>
        Is Supported:
        {' '}
        <strong>{String(isSupported)}</strong>
      </p>
      <p>
        Is Active:
        {' '}
        <strong>{String(isActive)}</strong>
      </p>
      <button type="button" onClick={() => { void (isActive ? release() : request('screen')) }}>
        {isActive ? 'OFF' : 'ON'}
      </button>
    </div>
  )
}
