import { stat } from 'fs/promises'
import { fetchFirstAtomEntry } from './atomFeed'

/**
 * Compares a safety tool's executable modification time against its GitHub
 * repo's most recent release (or, if it has no releases, its most recent
 * commit) to guess whether a newer build is available. Reading the repo's
 * Atom feed (github.com/.../releases.atom) avoids the GitHub REST API's
 * stricter unauthenticated rate limits. This is a heuristic, not an exact
 * version comparison: the installed exe has no reliable version metadata
 * we can read, so "newer than what you downloaded" is the best signal
 * available.
 */
export async function checkToolUpdate(
  toolPath: string,
  repoUrl: string
): Promise<{ updateAvailable: boolean; latestLabel: string | null; releaseUrl: string }> {
  const releasesPageUrl = `${repoUrl.replace(/\/$/, '')}/releases`

  let localModifiedAt: Date
  try {
    const stats = await stat(toolPath)
    localModifiedAt = stats.mtime
  } catch {
    return { updateAvailable: false, latestLabel: null, releaseUrl: releasesPageUrl }
  }

  const releasesAtomUrl = `${repoUrl.replace(/\/$/, '')}/releases.atom`
  const commitsAtomUrl = `${repoUrl.replace(/\/$/, '')}/commits.atom`

  const latestEntry =
    (await fetchFirstAtomEntry(releasesAtomUrl)) ?? (await fetchFirstAtomEntry(commitsAtomUrl))

  if (!latestEntry) {
    return { updateAvailable: false, latestLabel: null, releaseUrl: releasesPageUrl }
  }

  const updatedAt = new Date(latestEntry.updated)
  return {
    updateAvailable: updatedAt.getTime() > localModifiedAt.getTime(),
    latestLabel: latestEntry.title,
    releaseUrl: latestEntry.url || releasesPageUrl
  }
}
