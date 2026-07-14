import './Dropdown.css'
import { KeyboardArrowDown } from '@nine-thirty-five/material-symbols-react/outlined'

// Mirrors the Figma "dropdown" component set. Same simplification as
// Button and SelectableListItem: the has* properties (hasLabel,
// hasSecondaryLabel, hasDividerDot, hasFlagContainer) aren't separate
// props — passing `null` for flag/secondaryLabel already hides them,
// and the dot only ever appears together with a secondary label, so
// it isn't a separate prop either.
//
// hasSelection is the one real visual variant (retints label, dot,
// and secondary label to an accent color), so it stays as `selected`
// to match SelectableListItem's name for the same idea.
//
// The chevron isn't an exposed slot — Figma lists it as a fixed part
// of the component, not a swappable instance, same reasoning as
// TopNav's old inline chevron. It uses KeyboardArrowDown rather than
// an "ExpandMore" import since the icon package doesn't expose that
// name; it's the same glyph TopNav already used for this chevron.
//
// dropdown-content is Figma's "content" frame, separate from the root.
// It's what carries the hover background — see Dropdown.css for why
// it needs its own wrapper instead of living directly on the button.
function Dropdown({
  label = 'Label',
  secondaryLabel = null,
  flag = null,
  selected = false,
  outline = false,
  ...props
}) {
  return (
    <button type="button" className="dropdown" data-selected={selected} data-outline={outline} {...props}>
      <span className="dropdown-content">
        {flag && <span className="dropdown-flag">{flag}</span>}
        <span className="dropdown-categories">
          {label && <span className="dropdown-label">{label}</span>}
          {secondaryLabel && (
            <>
              <span className="dropdown-dot">•</span>
              <span className="dropdown-label-secondary">{secondaryLabel}</span>
            </>
          )}
        </span>
        <span className="dropdown-icon">
          <KeyboardArrowDown />
        </span>
      </span>
    </button>
  )
}

export default Dropdown
