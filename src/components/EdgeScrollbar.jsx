import { useEffect, useState } from 'react'
import './EdgeScrollbar.css'

const DESKTOP_QUERY = '(min-width: 1280px)'

// The app-shell convention (see imerso guidelines) is exactly one
// scrolling element per screen: nav bars are flex-shrink: 0 siblings,
// and a single flex: 1 child has overflow-y: auto. Walking the DOM to
// find that element — instead of wiring a ref through every screen —
// means no screen file has to change for this to work everywhere.
function findScrollHost(container) {
  if (!container) return null
  const all = container.querySelectorAll('*')
  for (const el of all) {
    const style = getComputedStyle(el)
    if (
      (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
      el.scrollHeight > el.clientHeight
    ) {
      return el
    }
  }
  return null
}

// Renders a thin thumb fixed to the viewport's right edge, mirroring
// whatever element inside `containerRef` is actually scrolling. Native
// scrolling (wheel, touch, keyboard) on that element keeps working —
// this only replaces its visual scrollbar and adds drag support on
// the thumb itself. Desktop-only (>= 1280px, matching Sidebar's own
// breakpoint): mobile keeps its native (already edge-of-screen)
// scrollbar untouched.
export default function EdgeScrollbar({ containerRef }) {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches)
  const [host, setHost] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY)
    const onChange = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Detect (and re-detect, on screen swaps or content changes) which
  // element is currently the scroll host.
  useEffect(() => {
    if (!isDesktop) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHost(null)
      return
    }
    const container = containerRef.current
    if (!container) return

    let current = null
    const attach = (el) => {
      if (current === el) return
      if (current) current.classList.remove('edge-scrollbar-host')
      current = el
      if (el) el.classList.add('edge-scrollbar-host')
      setHost(el)
    }
    const detect = () => attach(findScrollHost(container))

    detect()
    const mo = new MutationObserver(detect)
    mo.observe(container, { childList: true, subtree: true })
    const ro = new ResizeObserver(detect)
    ro.observe(container)

    return () => {
      mo.disconnect()
      ro.disconnect()
      if (current) current.classList.remove('edge-scrollbar-host')
    }
  }, [containerRef, isDesktop])

  // Track the host's geometry/scroll position to compute thumb size.
  useEffect(() => {
    if (!host) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMetrics(null)
      return
    }
    const update = () => {
      const rect = host.getBoundingClientRect()
      setMetrics({
        top: rect.top,
        height: rect.height,
        scrollTop: host.scrollTop,
        scrollHeight: host.scrollHeight,
        clientHeight: host.clientHeight,
      })
    }
    update()
    host.addEventListener('scroll', update)
    const ro = new ResizeObserver(update)
    ro.observe(host)
    window.addEventListener('resize', update)
    return () => {
      host.removeEventListener('scroll', update)
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [host])

  // Drag-to-scroll on the thumb.
  useEffect(() => {
    if (!dragging || !host || !metrics) return
    const thumbHeight = Math.max(24, (metrics.clientHeight / metrics.scrollHeight) * metrics.height)
    const maxThumbTravel = metrics.height - thumbHeight
    const maxScroll = metrics.scrollHeight - metrics.clientHeight

    const onMove = (e) => {
      if (maxThumbTravel <= 0) return
      const y = e.clientY - metrics.top - thumbHeight / 2
      const ratio = Math.min(1, Math.max(0, y / maxThumbTravel))
      host.scrollTop = ratio * maxScroll
    }
    const onUp = () => setDragging(false)

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [dragging, host, metrics])

  if (!isDesktop || !host || !metrics || metrics.scrollHeight <= metrics.clientHeight) {
    return null
  }

  const thumbHeight = Math.max(24, (metrics.clientHeight / metrics.scrollHeight) * metrics.height)
  const maxThumbTravel = metrics.height - thumbHeight
  const maxScroll = metrics.scrollHeight - metrics.clientHeight
  const thumbTop = metrics.top + (maxScroll > 0 ? (metrics.scrollTop / maxScroll) * maxThumbTravel : 0)

  return (
    <div
      className="edge-scrollbar-thumb"
      data-dragging={dragging || undefined}
      style={{ top: thumbTop, height: thumbHeight }}
      onPointerDown={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
    />
  )
}
