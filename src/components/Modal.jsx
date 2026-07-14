import './Modal.css'

// Generic desktop-only (>=1280px) windowed modal shell — generalizes the
// pattern already used ad hoc in SettingsWindow/AddLanguagesWindow into a
// reusable component, so web versions of screens don't have to duplicate
// the overlay/header/footer scaffolding each time.
//
// Header: optional leading icon (back/close), title, optional trailing icon.
// Content: scrollable middle area, arbitrary children.
// Footer: optional, fixed, buttons hug the right edge (flex-end) — pass
// Button elements as children.
function Modal({ title, leadingIcon, onLeadingClick, trailingIcon, onTrailingClick, footer, width = 560, height = 600, onClose, children }) {
  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && onClose) onClose()
      }}
    >
      <div className="modal-window" style={{ width, height }}>
        <div className="modal-header">
          {leadingIcon ? (
            <button type="button" className="modal-header-icon" onClick={onLeadingClick} aria-label="Voltar">
              {leadingIcon}
            </button>
          ) : (
            <span className="modal-header-icon-spacer" />
          )}
          <h2 className="modal-title">{title}</h2>
          {trailingIcon ? (
            <button type="button" className="modal-header-icon" onClick={onTrailingClick} aria-label="Fechar">
              {trailingIcon}
            </button>
          ) : (
            <span className="modal-header-icon-spacer" />
          )}
        </div>
        <div className="modal-content">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

export default Modal
