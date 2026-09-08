import { fetchFirstAtomEntry } from './atomFeed'

/**
 * Compares when the user pointed the launcher at this safety tool's
 * executable against its GitHub repo's most recent release (or, if it has
 * no releases, its most recent commit) to guess whether a newer build is
 * available. Reading the repo's Atom feed (github.com/.../releases.atom)
 * avoids the GitHub REST API's stricter unauthenticated rate limits.
 *
 * This used to compare the exe's filesystem modification time instead, but
 * that's unreliable: extracting or copying the file resets its mtime to
 * "now", which is always newer than any past release and made the check
 * permanently report "up to date" regardless of the actual version
 * installed. The launcher-recorded timestamp (set when the user last
 * browsed to or confirmed this path) is the best signal available, since
 * the exe itself carries no reliable version metadata we can read.
 */
export async function checkToolUpdate(
  installedAt: string | undefined,
  repoUrl: string
): Promise<{ updateAvailable: boolean; latestLabel: string | null; releaseUrl: string }> {
  const releasesPageUrl = `${repoUrl.replace(/\/$/, '')}/releases`

  if (!installedAt) {
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
  const installedAtDate = new Date(installedAt)
  return {
    updateAvailable: updatedAt.getTime() > installedAtDate.getTime(),
    latestLabel: latestEntry.title,
    releaseUrl: latestEntry.url || releasesPageUrl
  }
}
