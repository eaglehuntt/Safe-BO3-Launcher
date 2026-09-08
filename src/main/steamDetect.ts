import { execFile } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

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

/** Reads a Steam library's appmanifest for a given app ID to get its actual install folder name. */
function readInstallDir(libraryRoot: string, steamAppId: number): string | null {
  const manifestPath = join(libraryRoot, 'steamapps', `appmanifest_${steamAppId}.acf`)
  if (!existsSync(manifestPath)) return null
  try {
    const contents = readFileSync(manifestPath, 'utf-8')
    const match = contents.match(/"installdir"\s+"([^"]+)"/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/**
 * Locates an installed Steam game's executable by app ID: reads Steam's
 * install location from the registry, checks every library for that app's
 * manifest to get its real install folder name (rather than guessing it
 * from the game's display name), then confirms the expected exe exists
 * there. Returns null if Steam, the game, or the exe can't be found, the
 * caller should then prompt the user to browse for it manually.
 */
export async function detectGameInstallPath(
  steamAppId: number,
  exeFileName: string
): Promise<string | null> {
  const steamPath = await findSteamInstallPath()
  if (!steamPath) return null

  for (const libraryRoot of getLibraryRoots(steamPath)) {
    const installDir = readInstallDir(libraryRoot, steamAppId)
    if (!installDir) continue

    const candidate = join(libraryRoot, 'steamapps', 'common', installDir, exeFileName)
    if (existsSync(candidate)) {
      return candidate
    }
  }

  return null
}
