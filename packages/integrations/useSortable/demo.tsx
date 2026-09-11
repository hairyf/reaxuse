import { useSortable } from '@reause/integrations'
import { useRef, useState } from 'react'

interface Item {
  id: number
  name: string
}

export default function UseSortableDemo() {
  const el = useRef<HTMLDivElement>(null)
  const [list, setList] = useState<Item[]>([
    { id: 1, name: 'a' },
    { id: 2, name: 'b' },
    { id: 3, name: 'c' },
  ])

  const { option } = useSortable<Item>(el, list, {
    animation: 150,
    onUpdate: (newList) => {
      setList(newList)
    },
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => option('animation', 150)}>
          on animation
        </button>
        <button onClick={() => option('animation', 0)}>
          off animation
        </button>
      </div>
      <div
        ref={el}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '300px',
          padding: '1rem',
          background: 'rgba(128, 128, 128, 0.05)',
          borderRadius: '8px',
        }}
      >
        {list.map(item => (
          <div
            key={item.id}
            style={{ padding: '0.75rem', background: 'rgba(128, 128, 128, 0.05)', borderRadius: '8px' }}
          >
            {item.name}
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center' }}>
        {JSON.stringify(list)}
      </div>
    </div>
  )
}
