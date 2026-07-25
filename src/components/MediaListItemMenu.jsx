import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './MediaListItemMenu.css'
import SelectableListItem from './SelectableListItem'
import BottomSheet from './BottomSheet'
import { MoreVert } from '@nine-thirty-five/material-symbols-react/outlined'

// Same touch-vs-mouse popup-shape decision as LinkedSessionListItem's
// own menu (not shared as a hook there either — see its comment).
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

// "More" trigger + action list for a MediaListItem row (Biblioteca's
// editar/excluir today). Desktop opens a small anchored dropdown;
// mobile opens the same actions in a BottomSheet — identical split to
// LinkedSessionListItem's menu, just generalized to an `items` array
// instead of two hardcoded actions.
function MediaListItemMenu({ items }) {
  const isDesktop = useIsDesktop()
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(null)
  const menuRef = useRef(null)
  const triggerRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!open || !isDesktop) return
    function handlePointerDown(event) {
      if (menuRef.current?.contains(event.target)) return
      if (dropdownRef.current?.contains(event.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open, isDesktop])

  // Dropdown is portaled to <body> so it can escape the list card's
  // overflow:hidden (needed for rounded corners). Position is computed
  // once from the trigger's rect; rather than tracking live scroll
  // repositioning, the menu just closes on scroll/resize.
  useEffect(() => {
    if (!open || !isDesktop) return
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
      setPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    }
    function handleScrollOrResize() {
      setOpen(false)
    }
    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [open, isDesktop])

  function handleItemClick(event, onClick) {
    setOpen(false)
    onClick?.()
  }

  const list = () => (
    <>
      {items.map((item, index) => (
        <SelectableListItem
          key={item.label}
          label={item.label}
          leadingIcon={item.icon}
          position={index === 0 ? 'first' : index === items.length - 1 ? 'last' : 'middle'}
          divider={index < items.length - 1}
          danger={item.danger}
          onClick={(event) => handleItemClick(event, item.onClick)}
        />
      ))}
    </>
  )

  return (
    <div className="media-list-item-menu" ref={menuRef} onClick={(event) => event.stopPropagation()}>
      <button
        ref={triggerRef}
        type="button"
        className="media-list-item-menu-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-label="Mais opções"
      >
        <MoreVert />
      </button>
      {isDesktop ? (
        open &&
        position &&
        createPortal(
          <div
            ref={dropdownRef}
            className="media-list-item-menu-dropdown media-list-item-menu-dropdown-portal"
            style={{ top: position.top, right: position.right }}
          >
            {list()}
          </div>,
          document.body,
        )
      ) : (
        <BottomSheet open={open} onClose={() => setOpen(false)}>
          {list()}
        </BottomSheet>
      )}
    </div>
  )
}

export default MediaListItemMenu
