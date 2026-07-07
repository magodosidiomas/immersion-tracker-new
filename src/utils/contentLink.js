// Link detection helpers, ported from the old app's content-form.js.
// Kept framework-free (no React) so they're easy to unit-reason-about
// and reusable outside the hook if needed later.

export function isYouTubeUrl(url) {
  try {
    const h = new URL(url.trim()).hostname
    return h === 'youtu.be' || h.includes('youtube.com')
  } catch {
    return false
  }
}

export function isSpotifyUrl(url) {
  try {
    return new URL(url.trim()).hostname.includes('spotify.com')
  } catch {
    return false
  }
}

export function extractYouTubeId(url) {
  try {
    const u = new URL(url.trim())
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0]
    if (!u.hostname.includes('youtube.com') && !u.hostname.includes('music.youtube.com')) return null
    const shorts = u.pathname.match(/\/shorts\/([^/?]+)/)
    if (shorts) return shorts[1]
    return u.searchParams.get('v')
  } catch {
    return null
  }
}

// Returns 'youtube' | 'spotify' | null — used to pick the oEmbed
// endpoint and to auto-select the matching category chip.
export function detectLinkSource(url) {
  if (!url || !url.trim()) return null
  if (isYouTubeUrl(url)) return 'youtube'
  if (isSpotifyUrl(url)) return 'spotify'
  return null
}

const OEMBED_ENDPOINTS = {
  youtube: (url) => `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
  spotify: (url) => `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
}

// Fetches { title, thumbnail } via oEmbed for a detected source.
// Throws on network/parse failure or AbortError — caller decides how
// to handle (the hook swallows AbortError, surfaces the rest as null).
export async function fetchOEmbed(url, source, signal) {
  const buildUrl = OEMBED_ENDPOINTS[source]
  if (!buildUrl) return null
  const res = await fetch(buildUrl(url), { signal })
  if (!res.ok) throw new Error('oEmbed request failed')
  const data = await res.json()
  return {
    title: data.title || null,
    thumbnail: data.thumbnail_url || null,
  }
}
