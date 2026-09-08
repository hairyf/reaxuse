import type { WebFrame } from 'electron'

export function resolveWebFrame(webFrame?: WebFrame): WebFrame {
  if (webFrame)
    return webFrame
  const resolved = typeof window !== 'undefined' && typeof (window as any).require === 'function'
    ? (window as any).require('electron')?.webFrame
    : undefined
  if (!resolved)
    throw new Error('provide WebFrame module or enable nodeIntegration')
  return resolved
}
