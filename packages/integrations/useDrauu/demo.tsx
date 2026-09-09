// Relative (not `@reaxuse/integrations`): the package name resolves through
// the worktree node_modules junction to the main repo's integrations package,
// which does not export `useDrauu` until this PR is merged.
import type { Brush, DrawingMode } from 'drauu'
import { useRef, useState } from 'react'
import { useDrauu } from '../useDrauu'

const colors = ['black', '#ef4444', '#22c55e', '#3b82f6']

const modes: Array<{ mode: DrawingMode, label: string }> = [
  { mode: 'draw', label: 'Pen' },
  { mode: 'line', label: 'Line' },
  { mode: 'rectangle', label: 'Rect' },
  { mode: 'ellipse', label: 'Ellipse' },
]

export default function UseDrauuDemo() {
  const target = useRef<SVGSVGElement>(null)
  const { undo, redo, clear, canUndo, canRedo, brush, setBrush } = useDrauu(target, {
    brush: {
      color: 'black',
      size: 3,
    },
  })
  const [size, setSize] = useState(3)

  // `setBrush` writes the returned value AND the mounted instance, mirroring
  // the upstream writable `brush` ref (`toRefs(brush)` in the Vue demo).
  const updateBrush = (patch: Partial<Brush>) => {
    setBrush({ ...brush, ...patch })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
        {colors.map(color => (
          <button
            key={color}
            type="button"
            aria-label={`color ${color}`}
            onClick={() => updateBrush({ color })}
            style={{
              width: '1.75rem',
              height: '1.75rem',
              borderRadius: '9999px',
              background: color,
              border: brush.color === color ? '3px solid #3fb983' : '2px solid #ccc',
              cursor: 'pointer',
            }}
          />
        ))}

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          size
          <input
            type="range"
            min={1}
            max={10}
            value={size}
            onChange={(event) => {
              const next = Number(event.target.value)
              setSize(next)
              updateBrush({ size: next })
            }}
          />
        </label>

        {modes.map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            onClick={() => updateBrush({ mode })}
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              background: brush.mode === mode ? '#3fb983' : 'transparent',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}

        <button type="button" disabled={!canUndo} onClick={() => undo()}>
          Undo
        </button>
        <button type="button" disabled={!canRedo} onClick={() => redo()}>
          Redo
        </button>
        <button type="button" onClick={() => clear()}>
          Clear
        </button>
      </div>

      {/* drauu draws through pointer events on the target <svg> element */}
      <svg
        ref={target}
        width="100%"
        height="320"
        style={{
          display: 'block',
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '8px',
          touchAction: 'none',
        }}
      />
    </div>
  )
}
