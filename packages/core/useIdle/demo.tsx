import { useIdle, useNow } from '@reaxuse/core'

function BooleanDisplay({ value }: { value: boolean }) {
  return (
    <strong>
      {value ? 'true' : 'false'}
    </strong>
  )
}

export default function UseIdleDemo() {
  const { idle, lastActive } = useIdle(5000)
  const now = useNow(1000)
  const idledFor = Math.max(0, Math.floor((now - lastActive) / 1000))

  return (
    <div>
      <p>
        For demonstration purpose, the idle timeout is set to
        {' '}
        <b>5s</b>
        {' '}
        in this demo (default 1min).
      </p>
      <div>
        Idle:
        {' '}
        <BooleanDisplay value={idle} />
      </div>
      <div>
        Inactive:
        {' '}
        <b>
          {idledFor}
          s
        </b>
      </div>
    </div>
  )
}
