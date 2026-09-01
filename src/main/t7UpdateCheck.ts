import { stat } from 'fs/promises'

const LATEST_RELEASE_URL = 'https://api.github.com/repos/Scroptss/T7Patch/releases/latest'
const LATEST_COMMIT_URL = 'https://api.github.com/repos/Scroptss/T7Patch/commits?per_page=1'

interface GitHubRelease {
  tag_name: string
  published_at: string
}

interface GitHubCommit {
  sha: string
  commit: { author: { date: string } }
}

/**
 * Compares the T7 patch executable's modification time against the T7Patch
 * repo's most recent release (or, if it has no releases, its most recent
 * commit) to guess whether a newer build is available. This is a heuristic,
 * not an exact version comparison: the installed exe has no reliable
 * version metadata we can read, so "newer than what you downloaded" is the
 * best signal available.
 */
export async function checkT7Update(
  t7PatchPath: string
): Promise<{ updateAvailable: boolean; latestLabel: string | null; releaseUrl: string }> {
  const releaseUrl = 'https://github.com/Scroptss/T7Patch/releases'

  let localModifiedAt: Date
  try {
    const stats = await stat(t7PatchPath)
    localModifiedAt = stats.mtime
  } catch {
    return { updateAvailable: false, latestLabel: null, releaseUrl }
  }

  const release = await fetchLatestRelease()
  if (release) {
    const publishedAt = new Date(release.published_at)
    return {
      updateAvailable: publishedAt.getTime() > localModifiedAt.getTime(),
      latestLabel: release.tag_name,
      releaseUrl
    }
  }

  const commit = await fetchLatestCommit()
  if (commit) {
    const commitDate = new Date(commit.commit.author.date)
    return {
      updateAvailable: commitDate.getTime() > localModifiedAt.getTime(),
      latestLabel: commit.sha.slice(0, 7),
      releaseUrl: 'https://github.com/Scroptss/T7Patch'
    }
  }

  return { updateAvailable: false, latestLabel: null, releaseUrl }
}

async function fetchLatestRelease(): Promise<GitHubRelease | null> {
  try {
    const response = await fetch(LATEST_RELEASE_URL, {
      headers: { Accept: 'application/vnd.github+json' }
    })
    if (!response.ok) return null
    return (await response.json()) as GitHubRelease
  } catch {
    return null
  }
}

async function fetchLatestCommit(): Promise<GitHubCommit | null> {
  try {
    const response = await fetch(LATEST_COMMIT_URL, {
      headers: { Accept: 'application/vnd.github+json' }
    })
    if (!response.ok) return null
    const commits = (await response.json()) as GitHubCommit[]
    return commits[0] ?? null
  } catch {
    return null
  }
}
