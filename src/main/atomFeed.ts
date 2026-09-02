export interface AtomFeedEntry {
  title: string
  updated: string
  url: string
}

/** Fetches a GitHub `.atom` feed URL and returns its first (most recent) entry, if any. */
export async function fetchFirstAtomEntry(url: string): Promise<AtomFeedEntry | null> {
  try {
    const response = await fetch(url, { headers: { Accept: 'application/atom+xml' } })
    if (!response.ok) return null
    const xml = await response.text()
    return parseFirstEntry(xml)
  } catch {
    return null
  }
}

function parseFirstEntry(xml: string): AtomFeedEntry | null {
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
