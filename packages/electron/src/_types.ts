import type { IpcRendererEvent } from 'electron'

/**
 * An `ipcRenderer` message listener — `listener(event, ...args)`.
 *
 * Mirrors upstream `source/vueuse/packages/electron/_types.ts`.
 */
export type IpcRendererListener = (event: IpcRendererEvent, ...args: any[]) => void
