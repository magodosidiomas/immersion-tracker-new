import { useEffect } from 'react'

// `100dvh` is supposed to track the real visible height, but it
// under-reports on some mobile browsers (observed on Samsung
// Internet) — screens sized off it end up shorter than the actual
// viewport, leaving a gap below anything pinned to their bottom edge
// (like BottomNav). `visualViewport.height` reads the real rendered
// pixel height directly, sidestepping whatever each browser's dvh
// implementation gets wrong. Written to a CSS var so screens can use
// `var(--app-height, 100dvh)` — dvh only stays relevant as the
// fallback for the first paint, before this effect has run.
export function useViewportHeight() {
  useEffect(() => {
    const setHeight = () => {
      const height = window.visualViewport?.height ?? window.innerHeight
      document.documentElement.style.setProperty('--app-height', `${height}px`)
    }
    setHeight()
    window.visualViewport?.addEventListener('resize', setHeight)
    window.addEventListener('resize', setHeight)
    return () => {
      window.visualViewport?.removeEventListener('resize', setHeight)
      window.removeEventListener('resize', setHeight)
    }
  }, [])
}
