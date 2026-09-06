import { useTextSelection } from '@reaxuse/core'

export default function UseTextSelectionDemo() {
  const { text, rects } = useTextSelection()

  return (
    <div>
      <p>
        You can select any text on the page.
      </p>
      <p>
        <strong>Selected Text:</strong>
        {' '}
        <em
          style={{ color: text ? 'var(--vp-c-brand-1)' : 'var(--vp-c-text-3)' }}
        >
          {text || 'No selected'}
        </em>
      </p>
      <p>
        <strong>Selected rects:</strong>
      </p>
      {/* DOMRect fields live on the prototype, so stringify them explicitly */}
      <pre lang="json">{JSON.stringify(rects.map(rect => ({ x: rect.x, y: rect.y, width: rect.width, height: rect.height })), null, 2)}</pre>
    </div>
  )
}
