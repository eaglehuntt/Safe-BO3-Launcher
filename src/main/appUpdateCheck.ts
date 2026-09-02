import { fetchFirstAtomEntry } from './atomFeed'

const RELEASES_ATOM_URL = 'https://github.com/eaglehuntt/Safe-BO3-Launcher/releases.atom'
const RELEASES_PAGE_URL = 'https://github.com/eaglehuntt/Safe-BO3-Launcher/releases'

/**
 * Checks the launcher's own GitHub repo for a newer release than the
 * currently running version, so we (the devs) can ship an update just by
 * publishing a new GitHub release, and installed copies will notice.
 */
export async function checkAppUpdate(
  currentVersion: string
): Promise<{ updateAvailable: boolean; latestLabel: string | null; releaseUrl: string }> {
  const latestEntry = await fetchFirstAtomEntry(RELEASES_ATOM_URL)

  if (!latestEntry) {
    return { updateAvailable: false, latestLabel: null, releaseUrl: RELEASES_PAGE_URL }
  }

  const latestVersion = parseVersion(latestEntry.title)
  const runningVersion = parseVersion(currentVersion)

  if (!latestVersion || !runningVersion) {
    return { updateAvailable: false, latestLabel: latestEntry.title, releaseUrl: RELEASES_PAGE_URL }
  }

  return {
    updateAvailable: compareVersions(latestVersion, runningVersion) > 0,
    latestLabel: latestEntry.title,
    releaseUrl: latestEntry.url || RELEASES_PAGE_URL
  }
}

function parseVersion(raw: string): [number, number, number] | null {
  const match = raw.trim().match(/^v?(\d+)\.(\d+)\.(\d+)/)
  if (!match) return null
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function compareVersions(a: [number, number, number], b: [number, number, number]): number {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i]
  }
  return 0
}
