// Link detection + metadata-fetch helpers. YouTube/Spotify parsing is
// ported from the old app's content-form.js; website preview uses
// Microlink (api.microlink.io), a free, keyless, CORS-enabled metadata
// API — no cost, no account, matches the R$0 constraint.

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

export function isHttpUrl(url) {
  try {
    return ['http:', 'https:'].includes(new URL(url.trim()).protocol)
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

export function isYouTubeMusicUrl(url) {
  try {
    return new URL(url.trim()).hostname === 'music.youtube.com'
  } catch {
    return false
  }
}

export function isYouTubePlaylistUrl(url) {
  try {
    const u = new URL(url.trim())
    if (u.pathname.includes('/playlist')) return true
    return u.searchParams.has('list') && !u.searchParams.get('v')
  } catch {
    return false
  }
}

export function isYouTubeChannelUrl(url) {
  try {
    return new URL(url.trim()).pathname.includes('/channel/')
  } catch {
    return false
  }
}

export function isSpotifyPlaylistUrl(url) {
  try {
    return new URL(url.trim()).pathname.includes('/playlist/')
  } catch {
    return false
  }
}

export function isSpotifyProfileUrl(url) {
  try {
    const path = new URL(url.trim()).pathname
    return path.includes('/artist/') || path.includes('/show/') || path.includes('/user/')
  } catch {
    return false
  }
}

// Given the form's selected category (not sniffed from the URL — the
// person already picked the chip) and the link typed, decides which
// metadata source (if any) applies:
//   - youtube: only a real YouTube URL triggers a fetch
//   - podcast: Spotify (oEmbed) or YouTube Music (reuses the YouTube
//     oEmbed endpoint) links trigger a fetch
//   - website: any http(s) link triggers a Microlink fetch
export function sourceForType(type, url) {
  if (!url || !url.trim()) return null
  if (type === 'youtube') {
    return isYouTubeUrl(url) && extractYouTubeId(url) ? 'youtube' : null
  }
  if (type === 'podcast') {
    if (isSpotifyUrl(url)) {
      return !isSpotifyPlaylistUrl(url) && !isSpotifyProfileUrl(url) ? 'spotify' : null
    }
    if (isYouTubeMusicUrl(url)) {
      return !isYouTubePlaylistUrl(url) && !isYouTubeChannelUrl(url) && extractYouTubeId(url) ? 'youtube' : null
    }
    return null
  }
  if (type === 'website') return isHttpUrl(url) ? 'website' : null
  return null
}

const OEMBED_ENDPOINTS = {
  youtube: (url) => `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
  spotify: (url) => `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
}

// Fetches { title, thumbnail } for a detected source. Throws on
// network/parse failure or AbortError — the caller (the hook) swallows
// AbortError and surfaces the rest as "no metadata found".
export async function fetchLinkMetadata(url, source, signal) {
  if (source === 'website') {
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`, { signal })
    if (!res.ok) throw new Error('Microlink request failed')
    const { data } = await res.json()
    return {
      title: data?.title || null,
      thumbnail: data?.image?.url || null,
    }
  }

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
