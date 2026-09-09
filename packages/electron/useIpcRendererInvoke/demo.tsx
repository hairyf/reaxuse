// Relative (not `@reaxuse/electron`): until this PR is merged the package name
// resolves through the worktree node_modules junction to the main repo's
// still-empty electron package.
import type { IpcRenderer } from 'electron'
import { useMemo, useState } from 'react'
import { useIpcRendererInvoke } from '../src/useIpcRendererInvoke'

interface DemoResponse {
  channel: string
  args: any[]
  msg: string
}

/**
 * demo-only stub: a browser demo has no Electron runtime. In a real renderer
 * pass `window.require('electron').ipcRenderer` or enable nodeIntegration.
 */
function createDemoIpcRenderer(): IpcRenderer {
  return {
    invoke: (channel: string, ...args: any[]) =>
      new Promise(resolve => setTimeout(resolve, 300, { channel, args, msg: 'pong' })),
  } as unknown as IpcRenderer
}

export default function UseIpcRendererInvokeDemo() {
  const ipcRenderer = useMemo(() => createDemoIpcRenderer(), [])
  const [payload, setPayload] = useState('some data')

  // changing `payload` re-invokes and re-renders with the new response
  const result = useIpcRendererInvoke<DemoResponse>(ipcRenderer, 'custom-channel', payload)

  return (
    <div>
      <input value={payload} onChange={event => setPayload(event.target.value)} />
      <p>
        {result ? `response: ${JSON.stringify(result)}` : 'waiting for the response…'}
      </p>
    </div>
  )
}
