import type { AtomFeedEntry } from '../shared/types'

// The app checks for updates on most navigation clicks (not just at launch),
// so callers can hit the same feed URL many times a minute. Caching here
// means only the first caller after the TTL expires actually reaches
// GitHub; everyone else in that window gets the cached result instantly.
// One shared cache (keyed by URL, holding CACHE_ENTRY_COUNT entries) backs
// every caller regardless of how many entries they individually asked for.
const CACHE_TTL_MS = 3 * 60 * 1000
const CACHE_ENTRY_COUNT = 10

interface CacheRecord {
  entries: AtomFeedEntry[]
  fetchedAt: number
}

const cache = new Map<string, CacheRecord>()
const inFlight = new Map<string, Promise<AtomFeedEntry[]>>()

/** Fetches a GitHub `.atom` feed URL and returns its first (most recent) entry, if any. */
export async function fetchFirstAtomEntry(url: string): Promise<AtomFeedEntry | null> {
  const entries = await fetchAtomEntries(url, 1)
  return entries[0] ?? null
}

/** Fetches a GitHub `.atom` feed URL and returns up to `limit` entries, most recent first. */
export async function fetchAtomEntries(url: string, limit = 5): Promise<AtomFeedEntry[]> {
  const cached = cache.get(url)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.entries.slice(0, limit)
  }

  const pending = inFlight.get(url)
  if (pending) {
    return (await pending).slice(0, limit)
  }

  const request = fetchAndCache(url)
  inFlight.set(url, request)
  try {
    return (await request).slice(0, limit)
  } finally {
    inFlight.delete(url)
  }
}

async function fetchAndCache(url: string): Promise<AtomFeedEntry[]> {
  try {
    const response = await fetch(url, { headers: { Accept: 'application/atom+xml' } })
    if (!response.ok) return cache.get(url)?.entries ?? []
    const xml = await response.text()
    const entries = parseEntries(xml, CACHE_ENTRY_COUNT)
    cache.set(url, { entries, fetchedAt: Date.now() })
    return entries
  } catch {
    return cache.get(url)?.entries ?? []
  }
}

function parseEntries(xml: string, limit: number): AtomFeedEntry[] {
  const entries: AtomFeedEntry[] = []
  const entryPattern = /<entry>([\s\S]*?)<\/entry>/g
  let match: RegExpExecArray | null

  while (entries.length < limit && (match = entryPattern.exec(xml))) {
    const entry = match[1]
    const title = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.trim()
    const updated = entry.match(/<updated>([^<]+)<\/updated>/)?.[1]
    const url = entry.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"/)?.[1]
    if (!title || !updated) continue
    entries.push({ title: decodeXmlEntities(title), updated, url: url ? decodeXmlEntities(url) : '' })
  }

  return entries
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}
