import { execFile } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

const BO3_FOLDER_NAME = 'Call of Duty Black Ops III'
const BO3_EXE_NAME = 'BlackOps3.exe'

const REGISTRY_CANDIDATES: Array<{ key: string; value: string }> = [
  { key: 'HKCU\\Software\\Valve\\Steam', value: 'SteamPath' },
  { key: 'HKLM\\SOFTWARE\\WOW6432Node\\Valve\\Steam', value: 'InstallPath' },
  { key: 'HKLM\\SOFTWARE\\Valve\\Steam', value: 'InstallPath' }
]

async function readRegistryValue(key: string, value: string): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync('reg', ['query', key, '/v', value])
    const match = stdout.match(/REG_SZ\s+(.+)\r?$/m)
    return match ? match[1].trim() : null
  } catch {
    return null
  }
}

async function findSteamInstallPath(): Promise<string | null> {
  for (const candidate of REGISTRY_CANDIDATES) {
    const path = await readRegistryValue(candidate.key, candidate.value)
    if (path && existsSync(path)) {
      return path
    }
  }
  return null
}

/** Parses `libraryfolders.vdf` for every Steam library root, main install included. */
function getLibraryRoots(steamPath: string): string[] {
  const roots = new Set<string>([steamPath])
  const vdfPath = join(steamPath, 'steamapps', 'libraryfolders.vdf')

  if (existsSync(vdfPath)) {
    try {
      const contents = readFileSync(vdfPath, 'utf-8')
      const pathMatches = contents.matchAll(/"path"\s+"([^"]+)"/g)
      for (const match of pathMatches) {
        roots.add(match[1].replace(/\\\\/g, '\\'))
      }
    } catch {
      // Ignore unreadable/malformed VDF; fall back to the main Steam path only.
    }
  }

  return Array.from(roots)
}

/**
 * Attempts to locate BlackOps3.exe by reading Steam's install location from the
 * registry, then checking every Steam library for the game's install folder.
 * Returns null if Steam or the game can't be found — the caller should then
 * prompt the user to browse for it manually.
 */
export async function detectBlackOps3Path(): Promise<string | null> {
  const steamPath = await findSteamInstallPath()
  if (!steamPath) return null

  for (const libraryRoot of getLibraryRoots(steamPath)) {
    const candidate = join(libraryRoot, 'steamapps', 'common', BO3_FOLDER_NAME, BO3_EXE_NAME)
    if (existsSync(candidate)) {
      return candidate
    }
  }

  return null
}
