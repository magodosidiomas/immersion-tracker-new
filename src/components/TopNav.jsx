import './TopNav.css'
import Dropdown from './Dropdown'

// Mirrors the Figma "topNav" component set, with the same simplification
// Button and SelectableListItem already use: the has* booleans
// (hasLeadingIcon, hasTrailingLeft/Mid/Right, hasTrailingIcons) aren't
// separate props here — passing `null` for a slot already hides it, so
// the booleans wouldn't add anything the slot's own presence doesn't.
//
// `flag` is its own prop rather than overloading `leadingIcon`, for the
// same reason SelectableListItem keeps `flag` separate from its icon
// slots: an emoji isn't an icon component, and the two need different
// sizing rules to look balanced in the same 24px box.
//
// hasDropdown used to build its own title+chevron markup inline, back
// before the real Dropdown component existed. Now it just renders one,
// passing flag/title through as flag/label — selected is always true
// here since the title is standing in for "the current selection" (e.g.
// the active language), not a row in a list someone could toggle.
function TopNav({
  title = 'Page title',
  leadingIcon = null,
  flag = null,
  trailingLeft = null,
  trailingMid = null,
  trailingRight = null,
  hasDropdown = false,
  hasDivider = false,
  onDropdownClick = null,
  ...props
}) {
  const hasTrailing = trailingLeft || trailingMid || trailingRight

  return (
    <header className="top-nav" data-divider={hasDivider} {...props}>
      <div className="top-nav-leading">
        {leadingIcon && <span className="top-nav-icon">{leadingIcon}</span>}
        {hasDropdown ? (
          <Dropdown label={title} flag={flag} selected onClick={onDropdownClick} />
        ) : (
          <>
            {flag && <span className="top-nav-flag">{flag}</span>}
            <span className="top-nav-title">{title}</span>
          </>
        )}
      </div>
      {hasTrailing && (
        <div className="top-nav-trailing">
          {trailingLeft && <span className="top-nav-icon">{trailingLeft}</span>}
          {trailingMid && <span className="top-nav-icon">{trailingMid}</span>}
          {trailingRight && <span className="top-nav-icon">{trailingRight}</span>}
        </div>
      )}
    </header>
  )
}

export default TopNav
