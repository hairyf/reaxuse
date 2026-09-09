// Relative (not `@reaxuse/electron`): until this PR is merged the package name
// resolves through the worktree node_modules junction to the main repo's
// still-empty electron package.
import type { IpcRenderer, IpcRendererEvent } from 'electron'
import { useCallback, useMemo, useState } from 'react'
import { useIpcRendererOn } from '../src/useIpcRendererOn'

interface DemoIpcRenderer extends IpcRenderer {
  dispatch: (channel: string, ...args: any[]) => void
}

/**
 * demo-only stub: a browser demo has no Electron runtime. In a real renderer
 * pass `window.require('electron').ipcRenderer` or enable nodeIntegration.
 */
function createDemoIpcRenderer(): DemoIpcRenderer {
  const listeners = new Map<string, ((event: IpcRendererEvent, ...args: any[]) => void)[]>()

  return {
    on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => {
      listeners.set(channel, [...(listeners.get(channel) ?? []), listener])
      return undefined
    },
    removeListener: (channel: string, listener: (...args: any[]) => void) => {
      listeners.set(channel, (listeners.get(channel) ?? []).filter(item => item !== listener))
      return undefined
    },
    dispatch: (channel: string, ...args: any[]) => {
      (listeners.get(channel) ?? []).forEach(listener => listener({ senderId: 0 } as IpcRendererEvent, ...args))
    },
  } as unknown as DemoIpcRenderer
}

export default function UseIpcRendererOnDemo() {
  const demo = useMemo(() => createDemoIpcRenderer(), [])
  const [received, setReceived] = useState<string[]>([])

  // stable identity: a new listener would re-register (remove + add)
  const listener = useCallback((_event: IpcRendererEvent, ...args: any[]) => {
    setReceived(items => [...items, JSON.stringify(args)])
  }, [])

  // registers on mount, removes the same listener identity on unmount
  useIpcRendererOn(demo, 'custom-event', listener)

  return (
    <div>
      <button onClick={() => demo.dispatch('custom-event', 'hello', 42)}>Emit custom-event</button>
      <button onClick={() => setReceived([])}>Clear</button>
      <ul>
        {received.map((line, index) => <li key={index}>{line}</li>)}
      </ul>
    </div>
  )
}
