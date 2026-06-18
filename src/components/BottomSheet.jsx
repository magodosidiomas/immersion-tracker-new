import { useEffect, useState } from 'react'
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
  ...props
}) {
  const [present, setPresent] = useState(open)

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

  if (!present) return null

  const hasHeader = Boolean(title || description)
  const hasButtons = Boolean(primaryButton || secondaryButton)

  return (
    <div
      className="bottom-sheet-overlay"
      data-open={open}
      onClick={onClose}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="bottom-sheet" data-open={open} onClick={(event) => event.stopPropagation()} {...props}>
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
