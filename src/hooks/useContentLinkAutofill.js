import { useEffect, useMemo, useRef, useState } from 'react'
import { sourceForType, fetchLinkMetadata } from '../utils/contentLink'

// Watches a link value (given the form's already-selected content
// type) and auto-fetches title + thumbnail when it matches that type's
// expected source — YouTube for type=youtube, Spotify/YouTube Music
// for type=podcast, any http(s) link for type=website. Only fills the
// title if the user hasn't typed one already, and aborts the
// in-flight request whenever the link or type changes again.
//
// Usage:
//   const { source, thumbnail, loading, showManualHint } = useContentLinkAutofill(link, type, {
//     hasTitle: title.trim().length > 0,
//     onTitle: (t) => setTitle(t),
//   })
export function useContentLinkAutofill(link, type, { hasTitle = false, onTitle } = {}) {
  const [fetchedThumbnail, setFetchedThumbnail] = useState('')
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const controllerRef = useRef(null)
  const onTitleRef = useRef(onTitle)

  useEffect(() => {
    onTitleRef.current = onTitle
  }, [onTitle])

  const url = (link || '').trim()
  const source = useMemo(() => sourceForType(type, url), [type, url])

  useEffect(() => {
    if (controllerRef.current) controllerRef.current.abort()
    if (!source) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFetchedThumbnail('')
      setNotFound(false)
      return undefined
    }

    const controller = new AbortController()
    controllerRef.current = controller
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setFetchedThumbnail('')
    setNotFound(false)

    fetchLinkMetadata(url, source, controller.signal)
      .then((result) => {
        if (!result) {
          if (!hasTitle) setNotFound(true)
          return
        }
        if (result.title && !hasTitle) onTitleRef.current?.(result.title)
        else if (!result.title && !hasTitle) setNotFound(true)
        if (result.thumbnail) setFetchedThumbnail(result.thumbnail)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setFetchedThumbnail('')
          if (!hasTitle) setNotFound(true)
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, source])

  const showManualHint = Boolean(url) && !source
  const thumbnail = source ? fetchedThumbnail : ''

  return { source, thumbnail, loading: source ? loading : false, notFound: source ? notFound : false, showManualHint }
}
