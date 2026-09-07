export interface LibraryEntry {
  gameId: string
  gamePath: string
  toolPath?: string
  addedAt: string
  /** When the user last browsed to/confirmed toolPath, used as the update-check baseline since file mtimes aren't reliable. */
  toolPathUpdatedAt?: string
}

/** Which top-level screen the user was last looking at, so we can reopen it there. */
export type AppView = 'play' | 'info'

export interface LauncherSettings {
  library: LibraryEntry[]
  lastView?: AppView
}

export interface AtomFeedEntry {
  title: string
  updated: string
  url: string
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
  ResetSettings: 'settings:reset',
  BrowseExe: 'dialog:browseExe',
  DetectGameInstall: 'steam:detectGameInstall',
  StartLaunch: 'launch:start',
  LaunchProgress: 'launch:progress',
  OpenExternal: 'shell:openExternal',
  GetAppVersion: 'app:getVersion',
  CheckToolUpdate: 'update:checkTool',
  CheckAppUpdate: 'update:checkApp',
  IsProcessRunning: 'process:isRunning',
  FetchFeed: 'feed:fetch'
} as const
