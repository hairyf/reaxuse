import { useTitle } from '@reaxuse/core'

export default function UseTitleDemo() {
  const [title, setTitle] = useTitle(null)

  return (
    <div>
      <p>
        {'Title: '}
        <input
          type="text"
          value={title ?? ''}
          onChange={event => setTitle(event.target.value)}
        />
      </p>
    </div>
  )
}
