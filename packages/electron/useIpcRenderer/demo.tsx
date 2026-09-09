// Relative (not `@reaxuse/electron`): until this PR is merged the package name
// resolves through the worktree node_modules junction to the main repo's
// still-empty electron package.
import type { IpcRenderer, IpcRendererEvent } from 'electron'
import { useCallback, useMemo, useState } from 'react'
import { useIpcRenderer } from '../useIpcRenderer'

interface DemoIpcRenderer extends IpcRenderer {
  dispatch: (channel: string, ...args: any[]) => void
  calls: string[]
}

/**
 * demo-only stub: a browser demo has no Electron runtime. In a real renderer
 * pass `window.require('electron').ipcRenderer` or enable nodeIntegration.
 */
function createDemoIpcRenderer(): DemoIpcRenderer {
  const listeners = new Map<string, ((event: IpcRendererEvent, ...args: any[]) => void)[]>()

  const api = {
    on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => {
      listeners.set(channel, [...(listeners.get(channel) ?? []), listener])
      return api
    },
    once: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => api.on(channel, listener),
    removeListener: (channel: string, listener: (...args: any[]) => void) => {
      listeners.set(channel, (listeners.get(channel) ?? []).filter(item => item !== listener))
      return api
    },
    removeAllListeners: (channel: string) => {
      listeners.delete(channel)
      return api
    },
    send: (channel: string, ...args: any[]) => {
      api.calls.push(`send(${channel}, ${JSON.stringify(args)})`)
    },
    invoke: (channel: string, ...args: any[]) => {
      api.calls.push(`invoke(${channel}, ${JSON.stringify(args)})`)
      return Promise.resolve({ channel, args, msg: 'pong' })
    },
    sendSync: (channel: string, ...args: any[]) => {
      api.calls.push(`sendSync(${channel}, ${JSON.stringify(args)})`)
      return { channel, args, msg: 'sync-pong' }
    },
    postMessage: (channel: string, message: any) => {
      api.calls.push(`postMessage(${channel}, ${JSON.stringify(message)})`)
    },
    sendTo: (webContentsId: number, channel: string, ...args: any[]) => {
      api.calls.push(`sendTo(${webContentsId}, ${channel}, ${JSON.stringify(args)})`)
    },
    sendToHost: (channel: string, ...args: any[]) => {
      api.calls.push(`sendToHost(${channel}, ${JSON.stringify(args)})`)
    },
    dispatch: (channel: string, ...args: any[]) => {
      (listeners.get(channel) ?? []).forEach(listener => listener({ senderId: 0 } as IpcRendererEvent, ...args))
    },
    calls: [] as string[],
  }

  return api as unknown as DemoIpcRenderer
}

export default function UseIpcRendererDemo() {
  const demo = useMemo(() => createDemoIpcRenderer(), [])
  const [logs, setLogs] = useState<string[]>([])
  const [invoked, setInvoked] = useState('—')
  const [registered, setRegistered] = useState(false)

  const log = useCallback((line: string) => setLogs(lines => [...lines, line]), [])

  // stable listener identity — the tracked registration is removed on unmount
  const onCustomEvent = useCallback((_event: IpcRendererEvent, ...args: any[]) => {
    log(`custom-event → ${JSON.stringify(args)}`)
  }, [log])

  const ipcRenderer = useIpcRenderer(demo)

  return (
    <div>
      <button
        disabled={registered}
        onClick={() => {
          // guard against double registration — clicking twice must not stack
          // two listeners for the same channel
          if (!registered) {
            ipcRenderer.on('custom-event', onCustomEvent)
            setRegistered(true)
            log('registered custom-event listener (auto-removed on unmount)')
          }
        }}
      >
        Register listener
      </button>
      <button onClick={() => demo.dispatch('custom-event', 'hello', 42)}>Emit custom-event</button>
      <button onClick={() => ipcRenderer.send('custom-channel', 'some data')}>Send</button>
      <button
        onClick={() => {
          ipcRenderer.invoke<{ msg: string }>('custom-channel', 'some data').then(response => setInvoked(response.msg))
        }}
      >
        Invoke
      </button>
      <button
        onClick={() => {
          const response = ipcRenderer.sendSync<{ msg: string }>('custom-channel', 'some data')
          setInvoked(response.msg)
        }}
      >
        Send sync
      </button>
      <p>
        invoke / sendSync response:
        {' '}
        <strong>{invoked}</strong>
      </p>
      <ul>
        {logs.map((line, index) => <li key={index}>{line}</li>)}
      </ul>
      <ul>
        {demo.calls.map((line, index) => <li key={index}>{line}</li>)}
      </ul>
    </div>
  )
}
