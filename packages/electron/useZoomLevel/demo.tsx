import type { WebFrame } from 'electron'
import { useMemo } from 'react'
// Relative import (not `@reaxuse/electron`): this worktree's node_modules is junctioned to the main checkout, so the package alias would resolve to the main tree's src.
import { useZoomLevel } from '../src/useZoomLevel'

export default function UseZoomLevelDemo() {
  // demo-only stub: a browser page has no Electron runtime, so `webFrame` is faked
  const webFrame = useMemo<WebFrame>(() => {
    let level = 0
    return {
      getZoomLevel: () => level,
      setZoomLevel: (value: number) => {
        level = value
      },
    } as unknown as WebFrame
  }, [])

  const [level, setLevel] = useZoomLevel(webFrame)

  return (
    <div>
      <p>
        {'Zoom level: '}
        {level}
      </p>
      <button onClick={() => setLevel(level + 1)}>Zoom in</button>
      <button onClick={() => setLevel(level - 1)}>Zoom out</button>
    </div>
  )
}
