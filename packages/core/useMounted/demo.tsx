import { useMounted } from '@reaxuse/core'

export default function UseMountedDemo() {
  const isMounted = useMounted()

  return (
    <div>
      <p>
        {'component is '}
        <strong>{isMounted ? 'mounted' : 'unmounted'}</strong>
      </p>
    </div>
  )
}
