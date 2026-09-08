import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/types'
import type {
  AtomFeedEntry,
  LaunchProgressEvent,
  LaunchResult,
  LauncherSettings,
  UpdateStatus
} from '../shared/types'

const api = {
  getSettings: (): Promise<LauncherSettings> => ipcRenderer.invoke(IPC.GetSettings),

  saveSettings: (settings: LauncherSettings): Promise<LauncherSettings> =>
    ipcRenderer.invoke(IPC.SaveSettings, settings),

  resetSettings: (): Promise<LauncherSettings> => ipcRenderer.invoke(IPC.ResetSettings),

  browseForExe: (title: string): Promise<string | null> =>
    ipcRenderer.invoke(IPC.BrowseExe, title),

  detectGameInstall: (steamAppId: number, exeFileName: string): Promise<string | null> =>
    ipcRenderer.invoke(IPC.DetectGameInstall, steamAppId, exeFileName),

  startLaunch: (gameId: string): Promise<LaunchResult> =>
    ipcRenderer.invoke(IPC.StartLaunch, gameId),

  openExternal: (url: string): Promise<void> => ipcRenderer.invoke(IPC.OpenExternal, url),

  getAppVersion: (): Promise<string> => ipcRenderer.invoke(IPC.GetAppVersion),

  checkToolUpdate: (installedAt: string | undefined, repoUrl: string): Promise<UpdateStatus> =>
    ipcRenderer.invoke(IPC.CheckToolUpdate, installedAt, repoUrl),

  checkAppUpdate: (): Promise<UpdateStatus> => ipcRenderer.invoke(IPC.CheckAppUpdate),

  isProcessRunning: (exePath: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC.IsProcessRunning, exePath),

  fetchFeed: (url: string, limit?: number): Promise<AtomFeedEntry[]> =>
    ipcRenderer.invoke(IPC.FetchFeed, url, limit),

  onLaunchProgress: (callback: (event: LaunchProgressEvent) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: LaunchProgressEvent): void =>
      callback(payload)
    ipcRenderer.on(IPC.LaunchProgress, listener)
    return () => ipcRenderer.removeListener(IPC.LaunchProgress, listener)
  }
}

export type LauncherApi = typeof api

contextBridge.exposeInMainWorld('api', api)
