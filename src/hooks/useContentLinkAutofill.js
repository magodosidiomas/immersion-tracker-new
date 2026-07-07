import { useEffect, useMemo, useRef, useState } from 'react'
import { detectLinkSource, fetchOEmbed } from '../utils/contentLink'

// Watches a link value and auto-fetches title + thumbnail via oEmbed
// when it's a YouTube or Spotify URL. Mirrors the old app's behavior:
// only fills the title if the user hasn't typed one already, and
// aborts the in-flight request whenever the link changes again.
//
// Usage:
//   const { source, thumbnail, loading, showManualHint } = useContentLinkAutofill(link, {
//     hasTitle: title.trim().length > 0,
//     onTitle: (t) => setTitle(t),
//   })
export function useContentLinkAutofill(link, { hasTitle = false, onTitle } = {}) {
  const [fetchedThumbnail, setFetchedThumbnail] = useState('')
  const [loading, setLoading] = useState(false)
  const controllerRef = useRef(null)
  const onTitleRef = useRef(onTitle)

  useEffect(() => {
    onTitleRef.current = onTitle
  }, [onTitle])

  const url = (link || '').trim()
  const source = useMemo(() => detectLinkSource(url), [url])

  useEffect(() => {
    if (controllerRef.current) controllerRef.current.abort()
    if (!source) return undefined

    const controller = new AbortController()
    controllerRef.current = controller
    // Fetch-on-dependency-change pattern: setting loading/reset state
    // here is intentional, not a render-derivable value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setFetchedThumbnail('')

    fetchOEmbed(url, source, controller.signal)
      .then((result) => {
        if (!result) return
        if (result.title && !hasTitle) onTitleRef.current?.(result.title)
        if (result.thumbnail) setFetchedThumbnail(result.thumbnail)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setFetchedThumbnail('')
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, source])

  const showManualHint = Boolean(url) && !source
  const thumbnail = source ? fetchedThumbnail : ''

  return { source, thumbnail, loading: source ? loading : false, showManualHint }
}
