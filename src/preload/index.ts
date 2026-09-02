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

  detectGameInstall: (steamAppId: number, exeFileName: string): Promise<string | null> =>
    ipcRenderer.invoke(IPC.DetectGameInstall, steamAppId, exeFileName),

  startLaunch: (gameId: string): Promise<LaunchResult> =>
    ipcRenderer.invoke(IPC.StartLaunch, gameId),

  openExternal: (url: string): Promise<void> => ipcRenderer.invoke(IPC.OpenExternal, url),

  getAppVersion: (): Promise<string> => ipcRenderer.invoke(IPC.GetAppVersion),

  checkToolUpdate: (toolPath: string, repoUrl: string): Promise<UpdateStatus> =>
    ipcRenderer.invoke(IPC.CheckToolUpdate, toolPath, repoUrl),

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
