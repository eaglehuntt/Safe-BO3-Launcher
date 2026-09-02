import { stat } from 'fs/promises'
import { fetchFirstAtomEntry } from './atomFeed'

const RELEASES_ATOM_URL = 'https://github.com/Scroptss/T7Patch/releases.atom'
const COMMITS_ATOM_URL = 'https://github.com/Scroptss/T7Patch/commits.atom'
const RELEASES_PAGE_URL = 'https://github.com/Scroptss/T7Patch/releases'

/**
 * Compares the T7 patch executable's modification time against the T7Patch
 * repo's most recent release (or, if it has no releases, its most recent
 * commit) to guess whether a newer build is available. Reading the repo's
 * Atom feed (github.com/.../releases.atom) avoids the GitHub REST API's
 * stricter unauthenticated rate limits. This is a heuristic, not an exact
 * version comparison: the installed exe has no reliable version metadata
 * we can read, so "newer than what you downloaded" is the best signal
 * available.
 */
export async function checkT7Update(
  t7PatchPath: string
): Promise<{ updateAvailable: boolean; latestLabel: string | null; releaseUrl: string }> {
  let localModifiedAt: Date
  try {
    const stats = await stat(t7PatchPath)
    localModifiedAt = stats.mtime
  } catch {
    return { updateAvailable: false, latestLabel: null, releaseUrl: RELEASES_PAGE_URL }
  }

  const latestEntry = (await fetchFirstAtomEntry(RELEASES_ATOM_URL)) ?? (await fetchFirstAtomEntry(COMMITS_ATOM_URL))

  if (!latestEntry) {
    return { updateAvailable: false, latestLabel: null, releaseUrl: RELEASES_PAGE_URL }
  }

  const updatedAt = new Date(latestEntry.updated)
  return {
    updateAvailable: updatedAt.getTime() > localModifiedAt.getTime(),
    latestLabel: latestEntry.title,
    releaseUrl: latestEntry.url || RELEASES_PAGE_URL
  }
}
