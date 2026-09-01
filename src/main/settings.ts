import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

export interface LauncherSettings {
  t7PatchPath: string
  bo3Path: string
}

const DEFAULT_SETTINGS: LauncherSettings = {
  t7PatchPath: '',
  bo3Path: ''
}

function getConfigPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

export function loadSettings(): LauncherSettings {
  const configPath = getConfigPath()
  if (!existsSync(configPath)) {
    return { ...DEFAULT_SETTINGS }
  }
  try {
    const raw = readFileSync(configPath, 'utf-8')
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: LauncherSettings): LauncherSettings {
  writeFileSync(getConfigPath(), JSON.stringify(settings, null, 2), 'utf-8')
  return settings
}
