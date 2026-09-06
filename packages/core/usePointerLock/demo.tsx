import type { CSSProperties, MouseEvent } from 'react'
import { usePointerLock } from '@reaxuse/core'
import { useState } from 'react'

const faceBase: CSSProperties = {
  position: 'absolute',
  inset: 0,
  border: '1px solid rgba(16, 185, 129, 0.6)',
  background: 'rgba(16, 185, 129, 0.2)',
  backfaceVisibility: 'hidden',
}

const faceTransforms = [
  'rotateX(90deg) translateZ(50px)',
  'rotateX(-90deg) translateZ(50px)',
  'rotateY(0deg) translateZ(50px)',
  'rotateY(90deg) translateZ(50px)',
  'rotateY(180deg) translateZ(50px)',
  'rotateY(270deg) translateZ(50px)',
]

export default function UsePointerLockDemo() {
  const { element, lock, unlock } = usePointerLock()
  const [rotation, setRotation] = useState({ x: 0, y: -45 })

  // upstream demo rotates via useMouse movement deltas while locked; the
  // movementX/movementY deltas off the native event play the same role here
  const rotate = (event: MouseEvent<HTMLDivElement>) => {
    if (!element)
      return
    setRotation(current => ({
      x: current.x - event.nativeEvent.movementY / 2,
      y: current.y + event.nativeEvent.movementX / 2,
    }))
  }

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', padding: 12, perspective: 300 }}
      onMouseMove={rotate}
    >
      <div
        style={{
          width: 100,
          height: 100,
          position: 'relative',
          cursor: 'all-scroll',
          transformStyle: 'preserve-3d',
          transform: `rotateY(${rotation.y}deg) rotateX(${rotation.x}deg)`,
        }}
        onMouseDownCapture={lock}
        onMouseUp={unlock}
      >
        {faceTransforms.map(transform => (
          <span key={transform} style={{ ...faceBase, transform }} />
        ))}
      </div>
    </div>
  )
}
