import './TopNav.css'
import { KeyboardArrowDown } from '@nine-thirty-five/material-symbols-react/outlined'

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
// The dropdown chevron isn't an exposed slot — the Figma properties only
// list `hasDropdown` as a boolean, not a swappable instance — so it's
// built into the component rather than passed in like the other icons.
function TopNav({
  title = 'Page title',
  leadingIcon = null,
  flag = null,
  trailingLeft = null,
  trailingMid = null,
  trailingRight = null,
  hasDropdown = false,
  hasDivider = false,
  ...props
}) {
  const hasTrailing = trailingLeft || trailingMid || trailingRight

  return (
    <header className="top-nav" data-divider={hasDivider} {...props}>
      <div className="top-nav-leading">
        {leadingIcon && <span className="top-nav-icon">{leadingIcon}</span>}
        {flag && <span className="top-nav-flag">{flag}</span>}
        <div className="top-nav-title-group" data-dropdown={hasDropdown}>
          <span className="top-nav-title">{title}</span>
          {hasDropdown && (
            <span className="top-nav-icon top-nav-chevron">
              <KeyboardArrowDown />
            </span>
          )}
        </div>
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
