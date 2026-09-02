import { stat } from 'fs/promises'

const RELEASES_ATOM_URL = 'https://github.com/Scroptss/T7Patch/releases.atom'
const COMMITS_ATOM_URL = 'https://github.com/Scroptss/T7Patch/commits.atom'
const RELEASES_PAGE_URL = 'https://github.com/Scroptss/T7Patch/releases'

interface FeedEntry {
  title: string
  updated: string
  url: string
}

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

async function fetchFirstAtomEntry(url: string): Promise<FeedEntry | null> {
  try {
    const response = await fetch(url, { headers: { Accept: 'application/atom+xml' } })
    if (!response.ok) return null
    const xml = await response.text()
    return parseFirstEntry(xml)
  } catch {
    return null
  }
}

function parseFirstEntry(xml: string): FeedEntry | null {
  const entryMatch = xml.match(/<entry>([\s\S]*?)<\/entry>/)
  if (!entryMatch) return null
  const entry = entryMatch[1]

  const title = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.trim()
  const updated = entry.match(/<updated>([^<]+)<\/updated>/)?.[1]
  const url = entry.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"/)?.[1]

  if (!title || !updated) return null
  return { title: decodeXmlEntities(title), updated, url: url ? decodeXmlEntities(url) : '' }
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}
