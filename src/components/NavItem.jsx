import './NavItem.css'

// Mirrors the Figma "navItem" component set. isActive maps to `active`,
// same simplification as isSelected -> selected elsewhere. state
// (enabled/hover) isn't a prop — same reasoning as Button/SegmentedButton:
// the browser already does :hover for free.
function NavItem({ icon = null, label = 'Label', active = false, ...props }) {
  return (
    <button
      type="button"
      className="nav-item"
      data-active={active}
      aria-current={active ? 'page' : undefined}
      {...props}
    >
      {icon && <span className="nav-item-icon">{icon}</span>}
      <span className="nav-item-label">{label}</span>
    </button>
  )
}

export default NavItem
