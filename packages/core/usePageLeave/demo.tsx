import { usePageLeave } from '@reaxuse/core'

export default function UsePageLeaveDemo() {
  const isLeft = usePageLeave()

  return (
    <div>
      <p>Move the mouse outside of the window to see the state change.</p>
      <pre lang="json">{JSON.stringify({ isLeft }, null, 2)}</pre>
    </div>
  )
}
