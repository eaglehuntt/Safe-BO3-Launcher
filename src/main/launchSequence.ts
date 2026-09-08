import type { BrowserWindow } from 'electron'
import { existsSync } from 'fs'
import { IPC } from '../shared/types'
import type { LaunchProgressEvent, LaunchResult } from '../shared/types'
import type { GameDefinition } from '../shared/gameDefinitions'
import { isProcessRunning, launchExecutable } from './processUtils'

const TOOL_CONFIRM_TIMEOUT_MS = 30_000
const TOOL_POLL_INTERVAL_MS = 500

let launchInProgress = false

function emit(window: BrowserWindow, event: LaunchProgressEvent): void {
  window.webContents.send(IPC.LaunchProgress, event)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Runs a game's launch sequence. Games with a `safetyTool` (e.g. BO3's T7
 * patch) get the "launch tool, confirm it's running, then launch the game"
 * flow; games without one just launch directly. Each game can plug in its
 * own safety tool this way without touching this orchestration logic.
 */
export async function runLaunchSequence(
  window: BrowserWindow,
  game: GameDefinition,
  gamePath: string,
  toolPath?: string
): Promise<LaunchResult> {
  if (launchInProgress) {
    return { success: false, message: 'A launch is already in progress.' }
  }

  if (!gamePath || !existsSync(gamePath)) {
    return { success: false, message: `Set a valid ${game.name} executable first.` }
  }
  if (game.safetyTool && (!toolPath || !existsSync(toolPath))) {
    return { success: false, message: `Set a valid ${game.safetyTool.label} executable first.` }
  }

  launchInProgress = true
  try {
    if (game.safetyTool && toolPath) {
      const confirmed = await runSafetyTool(window, game.safetyTool.label, toolPath)
      if (!confirmed) {
        const message = `${game.safetyTool.label} process was not detected in time. ${game.name} was not launched.`
        emit(window, { step: 'error', message })
        return { success: false, message }
      }
    }

    emit(window, { step: 'launching-game', message: `Launching ${game.name}...` })
    launchExecutable(gamePath)

    const message = `${game.name} launched. Have fun out there.`
    emit(window, { step: 'done', message })
    return { success: true, message }
  } finally {
    launchInProgress = false
  }
}

/** Launches (or confirms) the safety tool, polling until it's running. Returns whether it's confirmed. */
async function runSafetyTool(window: BrowserWindow, toolLabel: string, toolPath: string): Promise<boolean> {
  // Never spawn a second copy of the tool — if it's already up, just confirm that.
  const alreadyRunning = await isProcessRunning(toolPath)

  if (alreadyRunning) {
    emit(window, {
      step: 'tool-already-running',
      message: `${toolLabel} is already running, skipping duplicate launch.`
    })
  } else {
    emit(window, { step: 'launching-tool', message: `Launching ${toolLabel}...` })
    launchExecutable(toolPath)
  }

  emit(window, {
    step: 'waiting-tool',
    message: `Confirming ${toolLabel} is running...`,
    elapsedSeconds: 0
  })

  const startTime = Date.now()
  const deadline = startTime + TOOL_CONFIRM_TIMEOUT_MS
  let confirmed = alreadyRunning

  while (!confirmed && Date.now() < deadline) {
    await sleep(TOOL_POLL_INTERVAL_MS)
    confirmed = await isProcessRunning(toolPath)
    emit(window, {
      step: 'waiting-tool',
      message: `Confirming ${toolLabel} is running...`,
      elapsedSeconds: Math.round((Date.now() - startTime) / 1000)
    })
  }

  if (confirmed) {
    emit(window, { step: 'tool-confirmed', message: `${toolLabel} confirmed running.` })
  }

  return confirmed
}
