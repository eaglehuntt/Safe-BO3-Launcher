import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/types'
import type {
  LaunchProgressEvent,
  LaunchResult,
  LauncherSettings,
  UpdateStatus
} from '../shared/types'

const api = {
  getSettings: (): Promise<LauncherSettings> => ipcRenderer.invoke(IPC.GetSettings),

  saveSettings: (settings: LauncherSettings): Promise<LauncherSettings> =>
    ipcRenderer.invoke(IPC.SaveSettings, settings),

  browseForExe: (title: string): Promise<string | null> =>
    ipcRenderer.invoke(IPC.BrowseExe, title),

  detectBlackOps3: (): Promise<string | null> => ipcRenderer.invoke(IPC.DetectBo3),

  startLaunch: (): Promise<LaunchResult> => ipcRenderer.invoke(IPC.StartLaunch),

  openExternal: (url: string): Promise<void> => ipcRenderer.invoke(IPC.OpenExternal, url),

  getAppVersion: (): Promise<string> => ipcRenderer.invoke(IPC.GetAppVersion),

  checkT7Update: (): Promise<UpdateStatus> => ipcRenderer.invoke(IPC.CheckT7Update),

  checkAppUpdate: (): Promise<UpdateStatus> => ipcRenderer.invoke(IPC.CheckAppUpdate),

  onLaunchProgress: (callback: (event: LaunchProgressEvent) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: LaunchProgressEvent): void =>
      callback(payload)
    ipcRenderer.on(IPC.LaunchProgress, listener)
    return () => ipcRenderer.removeListener(IPC.LaunchProgress, listener)
  }
}

export type LauncherApi = typeof api

contextBridge.exposeInMainWorld('api', api)
