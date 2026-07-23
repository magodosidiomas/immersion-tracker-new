import './TopNavDesktop.css'
import Button from './Button'
import { Search, ArrowBack, Close } from '@nine-thirty-five/material-symbols-react/outlined'

// Mirrors the Figma "topNavDesktop" component set. Desktop-only (>=1280px)
// header used at the top of a screen's content column: a search field plus
// a primary action button. Not related to the mobile TopNav (title/icon
// header) — this is a distinct component for a layout that doesn't exist
// on mobile at all.
//
// type="main": screen header (e.g. Biblioteca) — optional title, search
// field, action button, all in one row under a divider.
// type="modal": header for a windowed Modal-style flow — back arrow,
// title, a smaller action button, close icon. Kept as one component
// since Figma defines both as variants of the same set, but each is
// used in a different context (screen vs modal window).
function TopNavDesktop({
  type = 'main',
  title = null,
  searchValue = '',
  onSearchChange = () => {},
  searchPlaceholder = 'Buscar',
  actionLabel,
  actionIcon,
  onActionClick,
  onLeadingClick = null,
  onClose = null,
}) {
  const searchField = (
    <div className="top-nav-desktop-field">
      <Search className="top-nav-desktop-search-icon" aria-hidden="true" />
      <input
        className="top-nav-desktop-input"
        type="text"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>
  )

  const actionButton = actionLabel && (
    <Button size={type === 'modal' ? 'sm' : 'lg'} leadingIcon={actionIcon} onClick={onActionClick}>
      {actionLabel}
    </Button>
  )

  if (type === 'modal') {
    return (
      <header className="top-nav-desktop" data-type="modal">
        <button type="button" className="top-nav-desktop-icon-reset" onClick={onLeadingClick} aria-label="Voltar">
          <ArrowBack />
        </button>
        <span className="top-nav-desktop-title">{title}</span>
        {actionButton}
        <button type="button" className="top-nav-desktop-icon-reset" onClick={onClose} aria-label="Fechar">
          <Close />
        </button>
      </header>
    )
  }

  return (
    <header className="top-nav-desktop" data-type="main">
      {title && <span className="top-nav-desktop-title">{title}</span>}
      <div className="top-nav-desktop-content">
        {searchField}
        {actionButton}
      </div>
    </header>
  )
}

export default TopNavDesktop
