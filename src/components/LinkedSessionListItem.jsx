import { useEffect, useRef, useState } from 'react'
import './LinkedSessionListItem.css'
import SelectableListItem from './SelectableListItem'
import BottomSheet from './BottomSheet'
import { MoreVert, ChevronRight, Visibility, LinkOff } from '@nine-thirty-five/material-symbols-react/outlined'

// Popup-shape decision only (mouse+keyboard vs touch), same reasoning
// and same 768px cutoff as SearchCreateField's own dropdown-vs-overlay
// split — not worth sharing a hook for two callers.
const DESKTOP_QUERY = '(min-width: 768px)'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches,
  )
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY)
    const handleChange = (event) => setIsDesktop(event.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])
  return isDesktop
}

// Row for a linked session inside a content's "Sessões vinculadas" card
// (ContentForm, EpisodeDetail). Replaces the old always-visible delete
// icon: actions now live behind a menu with two choices, "Ver sessão"
// and "Desvincular". Desktop shows a "more" icon button that opens a
// small dropdown anchored under it (closes on outside click, mirrors
// Sidebar's language switcher menu); mobile makes the whole row tappable
// (chevron affordance) and opens the same two actions in a BottomSheet
// instead, since a tiny anchored popup doesn't suit touch.
function LinkedSessionListItem({ label, description, onView, onUnlink, divider = false }) {
  const isDesktop = useIsDesktop()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open || !isDesktop) return
    function handlePointerDown(event) {
      if (menuRef.current?.contains(event.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open, isDesktop])

  function handleView() {
    setOpen(false)
    onView?.()
  }

  function handleUnlink() {
    setOpen(false)
    onUnlink?.()
  }

  const text = (
    <span className="linked-session-item-text">
      <span className="linked-session-item-label">{label}</span>
      {description && <span className="linked-session-item-description">{description}</span>}
    </span>
  )

  return (
    <div className="linked-session-item" data-divider={divider}>
      {isDesktop ? (
        <>
          <span className="linked-session-item-main">{text}</span>
          <div className="linked-session-item-menu" ref={menuRef}>
            <button
              type="button"
              className="linked-session-item-trigger"
              onClick={() => setOpen((value) => !value)}
              aria-label="Mais opções"
            >
              <MoreVert />
            </button>
            {open && (
              <div className="linked-session-item-dropdown">
                <SelectableListItem
                  label="Ver sessão"
                  leadingIcon={<Visibility />}
                  position="first"
                  onClick={handleView}
                />
                <SelectableListItem
                  label="Desvincular"
                  leadingIcon={<LinkOff />}
                  position="last"
                  divider
                  danger
                  onClick={handleUnlink}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <button type="button" className="linked-session-item-main" onClick={() => setOpen(true)}>
            {text}
          </button>
          <span className="linked-session-item-chevron">
            <ChevronRight />
          </span>
          <BottomSheet open={open} onClose={() => setOpen(false)}>
            <SelectableListItem
              label="Ver sessão"
              leadingIcon={<Visibility />}
              position="first"
              onClick={handleView}
            />
            <SelectableListItem
              label="Desvincular deste conteúdo"
              leadingIcon={<LinkOff />}
              position="last"
              divider
              danger
              onClick={handleUnlink}
            />
          </BottomSheet>
        </>
      )}
    </div>
  )
}

export default LinkedSessionListItem
