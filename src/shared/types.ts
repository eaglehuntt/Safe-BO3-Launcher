export interface LauncherSettings {
  t7PatchPath: string
  bo3Path: string
}

export type LaunchStep =
  | 'launching-t7'
  | 't7-already-running'
  | 'waiting-t7'
  | 't7-confirmed'
  | 'launching-bo3'
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
  DetectBo3: 'steam:detectBo3',
  StartLaunch: 'launch:start',
  LaunchProgress: 'launch:progress',
  OpenExternal: 'shell:openExternal',
  GetAppVersion: 'app:getVersion',
  CheckT7Update: 'update:checkT7',
  CheckAppUpdate: 'update:checkApp'
} as const
