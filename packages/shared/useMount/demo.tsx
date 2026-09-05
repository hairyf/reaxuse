import { useMount } from '@reaxuse/shared'

export default function UseMountDemo() {
  const mounted = useMount()

  return (
    <div>
      <p>
        mounted:
        {' '}
        <strong>{String(mounted)}</strong>
      </p>
    </div>
  )
}
