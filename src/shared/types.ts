export interface LibraryEntry {
  gameId: string
  gamePath: string
  toolPath?: string
  addedAt: string
}

export interface LauncherSettings {
  library: LibraryEntry[]
}

export type LaunchStep =
  | 'launching-tool'
  | 'tool-already-running'
  | 'waiting-tool'
  | 'tool-confirmed'
  | 'launching-game'
  | 'done'
  | 'error'

export interface LaunchProgressEvent {
  step: LaunchStep
  message: string
  elapsedSeconds?: number
}

export interface LaunchResult {
  success: boolean
  message: string
}

export interface UpdateStatus {
  updateAvailable: boolean
  latestLabel: string | null
  releaseUrl: string
}

export const IPC = {
  GetSettings: 'settings:get',
  SaveSettings: 'settings:save',
  BrowseExe: 'dialog:browseExe',
  DetectGameInstall: 'steam:detectGameInstall',
  StartLaunch: 'launch:start',
  LaunchProgress: 'launch:progress',
  OpenExternal: 'shell:openExternal',
  GetAppVersion: 'app:getVersion',
  CheckToolUpdate: 'update:checkTool',
  CheckAppUpdate: 'update:checkApp',
  IsProcessRunning: 'process:isRunning'
} as const
