import type { BrowserWindow } from 'electron'
import { existsSync } from 'fs'
import { IPC } from '../shared/types'
import type { LaunchProgressEvent, LaunchResult, LauncherSettings } from '../shared/types'
import { isProcessRunning, launchExecutable } from './processUtils'

const T7_CONFIRM_TIMEOUT_MS = 30_000
const T7_POLL_INTERVAL_MS = 500

let launchInProgress = false

function emit(window: BrowserWindow, event: LaunchProgressEvent): void {
  window.webContents.send(IPC.LaunchProgress, event)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function runLaunchSequence(
  window: BrowserWindow,
  settings: LauncherSettings
): Promise<LaunchResult> {
  if (launchInProgress) {
    return { success: false, message: 'A launch is already in progress.' }
  }

  if (!settings.t7PatchPath || !existsSync(settings.t7PatchPath)) {
    return { success: false, message: 'Set a valid T7 patch executable first.' }
  }
  if (!settings.bo3Path || !existsSync(settings.bo3Path)) {
    return { success: false, message: 'Set a valid Black Ops 3 executable first.' }
  }

  launchInProgress = true
  try {
    // Never spawn a second copy of the T7 patch — if it's already up, just
    // confirm that and move straight on to BO3.
    const alreadyRunning = await isProcessRunning(settings.t7PatchPath)

    if (alreadyRunning) {
      emit(window, {
        step: 't7-already-running',
        message: 'T7 patch is already running — skipping duplicate launch.'
      })
    } else {
      emit(window, { step: 'launching-t7', message: 'Launching T7 patch...' })
      launchExecutable(settings.t7PatchPath)
    }

    emit(window, {
      step: 'waiting-t7',
      message: 'Confirming the T7 patch process is running...',
      elapsedSeconds: 0
    })

    const startTime = Date.now()
    const deadline = startTime + T7_CONFIRM_TIMEOUT_MS
    let confirmed = alreadyRunning

    while (!confirmed && Date.now() < deadline) {
      await sleep(T7_POLL_INTERVAL_MS)
      confirmed = await isProcessRunning(settings.t7PatchPath)
      emit(window, {
        step: 'waiting-t7',
        message: 'Confirming the T7 patch process is running...',
        elapsedSeconds: Math.round((Date.now() - startTime) / 1000)
      })
    }

    if (!confirmed) {
      const message = 'T7 patch process was not detected in time. Black Ops 3 was not launched.'
      emit(window, { step: 'error', message })
      return { success: false, message }
    }

    emit(window, { step: 't7-confirmed', message: 'T7 patch confirmed running.' })
    emit(window, { step: 'launching-bo3', message: 'Launching Black Ops 3...' })
    launchExecutable(settings.bo3Path)

    const message = 'Black Ops 3 launched. Have fun out there.'
    emit(window, { step: 'done', message })
    return { success: true, message }
  } finally {
    launchInProgress = false
  }
}
