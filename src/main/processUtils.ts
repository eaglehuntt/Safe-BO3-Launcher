import { execFile, spawn } from 'child_process'
import { basename, dirname } from 'path'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

/**
 * Checks whether a process with the given executable's filename is currently
 * running, using Windows' built-in `tasklist`. Avoids native dependencies so
 * the app stays a plain, easily-auditable Electron build.
 */
export async function isProcessRunning(exePath: string): Promise<boolean> {
  const imageName = basename(exePath)
  try {
    const { stdout } = await execFileAsync('tasklist', [
      '/FI',
      `IMAGENAME eq ${imageName}`,
      '/FO',
      'CSV',
      '/NH'
    ])
    return stdout.toLowerCase().includes(imageName.toLowerCase())
  } catch {
    return false
  }
}

/** Spawns an executable detached from this app, so it survives our process exiting. */
export function launchExecutable(exePath: string): void {
  const child = spawn(exePath, [], {
    cwd: dirname(exePath),
    detached: true,
    stdio: 'ignore'
  })
  child.unref()
}
