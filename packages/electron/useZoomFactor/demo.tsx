import type { WebFrame } from 'electron'
import { useMemo } from 'react'
// Relative import (not `@reaxuse/electron`): this worktree's node_modules is junctioned to the main checkout, so the package alias would resolve to the main tree's src.
import { useZoomFactor } from '../src/useZoomFactor'

export default function UseZoomFactorDemo() {
  // demo-only stub: a browser page has no Electron runtime, so `webFrame` is faked
  const webFrame = useMemo<WebFrame>(() => {
    let factor = 1
    return {
      getZoomFactor: () => factor,
      setZoomFactor: (value: number) => {
        factor = value
      },
    } as unknown as WebFrame
  }, [])

  const [factor, setFactor] = useZoomFactor(webFrame)

  return (
    <div>
      <p>
        {'Zoom factor: '}
        {factor}
      </p>
      <button onClick={() => setFactor(factor + 0.5)}>Zoom in</button>
      <button onClick={() => setFactor(Math.max(factor - 0.5, 0.5))}>Zoom out</button>
    </div>
  )
}
