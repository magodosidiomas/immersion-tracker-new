import { useEffect, useRef, useState } from 'react'
import './BottomSheet.css'
import { Close } from '@nine-thirty-five/material-symbols-react/outlined'

// Mirrors the Figma "bottomSheet" component set, but `device` isn't a
// prop here — mobile vs desktop is handled entirely by a CSS media
// query (see BottomSheet.css), the same one markup tree for every
// breakpoint approach the rest of the app uses. Mobile gets the drag
// handle and slides up from the bottom edge; desktop gets the close
// button and opens centered over a dark overlay. Both share the same
// "click outside closes it" behavior via the overlay's onClick.
//
// hasHeader/hasTitle/hasDescription/hasCustomContent/hasButtons/
// hasButton1/hasButton2 aren't separate props — same simplification as
// Button/Dropdown/SelectableListItem: passing null already hides a
// slot. customContent is `children` (an instance-swap slot, same idea
// as Figma's), and button1/button2 are `primaryButton`/`secondaryButton`
// slots that take already-built <Button> elements, so this component
// stays decoupled from Button's own API.
//
// contentCard defaults to true (a grouped list, e.g. Home's language
// switcher, sits on its own card surface). Custom content that should
// sit flush on the sheet itself instead — a form field, say — passes
// contentCard={false} to drop the card background/padding.
//
// open/onClose make this fully controlled. It still tracks `present`
// separately from `open` so the exit animation gets to finish playing
// instead of the sheet just vanishing — driven by CSS animations (see
// BottomSheet.css) rather than a timer, so the unmount happens exactly
// when the animation actually ends instead of guessing a duration.
//
// variant='modal' (opt-in, default stays 'sheet' so every existing
// caller is unaffected): forces the centered-card presentation at
// every breakpoint instead of only ≥768px, for sheets whose content
// is a text input rather than a list/menu — typing doesn't suit an
// edge-anchored sheet. It also turns on two behaviors specific to
// having a real keyboard-triggering input inside:
// - Visual Viewport tracking: mobile virtual keyboards shrink
//   `visualViewport`, not the layout viewport `position: fixed` is
//   pinned to, so without this the keyboard would simply cover the
//   lower half of the modal. Mirroring visualViewport's height/offset
//   onto the overlay keeps the modal centered in whatever space is
//   actually visible above the keyboard, and re-centers automatically
//   (no extra logic needed) once the keyboard closes and the
//   viewport's resize event fires.
// - Two-stage outside-tap: if a tap outside lands while an input
//   inside is focused, it just blurs that input (dismissing the
//   keyboard) rather than closing the modal — closing only happens on
//   a second outside tap once nothing inside is focused.
function BottomSheet({
  open = false,
  onClose,
  title = null,
  description = null,
  children = null,
  contentCard = true,
  divider = false,
  primaryButton = null,
  secondaryButton = null,
  variant = 'sheet',
  ...props
}) {
  const [present, setPresent] = useState(open)
  const [viewport, setViewport] = useState(null)
  const sheetRef = useRef(null)

  // Derived state, computed during render rather than in an effect:
  // the moment `open` goes true, this needs to be mounted immediately
  // so the entrance animation has something to animate. (Going the
  // other way — unmounting after the exit animation — is handled by
  // handleAnimationEnd below instead, since that needs to wait for an
  // actual animation, not just a prop change.)
  if (open && !present) {
    setPresent(true)
  }

  function handleAnimationEnd(event) {
    if (event.target !== event.currentTarget) return // ignore bubbled child animations
    if (!open) setPresent(false)
  }

  // Background scroll lock + Escape-to-close, only while genuinely
  // open (not during the closing animation).
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  // Keyboard-aware repositioning, modal variant only: mirrors
  // visualViewport's height/offsetTop so the overlay tracks whatever
  // space is actually visible above an on-screen keyboard. Resize also
  // fires when the keyboard closes, so this is what re-centers the
  // modal on the full viewport again — no separate "keyboard closed"
  // codepath needed.
  useEffect(() => {
    if (!open || variant !== 'modal' || !window.visualViewport) return
    const vv = window.visualViewport
    function updateViewport() {
      setViewport({ height: vv.height, top: vv.offsetTop })
    }
    updateViewport()
    vv.addEventListener('resize', updateViewport)
    vv.addEventListener('scroll', updateViewport)
    return () => {
      vv.removeEventListener('resize', updateViewport)
      vv.removeEventListener('scroll', updateViewport)
    }
  }, [open, variant])

  if (!present) return null

  const hasHeader = Boolean(title || description)
  const hasButtons = Boolean(primaryButton || secondaryButton)

  // First outside tap while an input inside is focused just dismisses
  // the keyboard; the modal itself only closes once nothing inside has
  // focus. Plain `sheet` variant keeps the original one-tap-closes
  // behavior since it never contains a keyboard-triggering field.
  function handleOverlayClick() {
    if (variant === 'modal') {
      const active = document.activeElement
      if (active && sheetRef.current?.contains(active)) {
        active.blur()
        return
      }
    }
    onClose?.()
  }

  const overlayStyle =
    variant === 'modal' && viewport ? { top: viewport.top, height: viewport.height } : undefined

  return (
    <div
      className="bottom-sheet-overlay"
      data-open={open}
      data-variant={variant}
      style={overlayStyle}
      onClick={handleOverlayClick}
      onAnimationEnd={handleAnimationEnd}
    >
      <div
        ref={sheetRef}
        className="bottom-sheet"
        data-open={open}
        data-variant={variant}
        onClick={(event) => event.stopPropagation()}
        {...props}
      >
        <div className="bottom-sheet-handle-area">
          <span className="bottom-sheet-handle" />
        </div>
        <div className="bottom-sheet-body">
          {(hasHeader || onClose) && (
            <div className="bottom-sheet-top">
              {hasHeader && (
                <div className="bottom-sheet-header">
                  {title && <h2 className="bottom-sheet-title">{title}</h2>}
                  {description && <p className="bottom-sheet-description">{description}</p>}
                </div>
              )}
              {onClose && (
                <button type="button" className="bottom-sheet-close" onClick={onClose} aria-label="Fechar">
                  <Close />
                </button>
              )}
            </div>
          )}
          {children && (
            <div className="bottom-sheet-content" data-card={contentCard}>
              {children}
            </div>
          )}
          {divider && <span className="bottom-sheet-divider" />}
          {hasButtons && (
            <div className="bottom-sheet-buttons">
              {primaryButton}
              {secondaryButton}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BottomSheet
