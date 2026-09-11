import { useMounted } from '@reause/core'

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
