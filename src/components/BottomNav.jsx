import './BottomNav.css'
import NavItem from './NavItem'

// Mirrors the Figma "bottom-nav" component. hasItem1-5 booleans become
// implicit: items is an array (1-5 entries), same idea as
// SegmentedControl's options array replacing hasThirdButton — a
// shorter array just renders fewer items, no boolean needed.
function BottomNav({ items = [], ...props }) {
  return (
    <nav className="bottom-nav" {...props}>
      {items.map((item, index) => (
        <NavItem
          key={item.key ?? index}
          icon={item.icon}
          label={item.label}
          active={item.active}
          onClick={item.onClick}
        />
      ))}
    </nav>
  )
}

export default BottomNav
