import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { LauncherSettings } from '../shared/types'

const DEFAULT_SETTINGS: LauncherSettings = {
  library: []
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
    if (!Array.isArray(parsed.library)) {
      // Older settings shape (pre-library) or corrupt file: start fresh rather than crash.
      return { ...DEFAULT_SETTINGS }
    }
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: LauncherSettings): LauncherSettings {
  writeFileSync(getConfigPath(), JSON.stringify(settings, null, 2), 'utf-8')
  return settings
}
