import './SegmentedControl.css'
import SegmentedButton from './SegmentedButton'

// Mirrors the Figma "segmentedControl" component. hasThirdButton becomes
// implicit: options is an array (2 or 3 entries, matching the Figma
// variants), so a 2-item array just renders 2 buttons — no boolean
// needed, same idea as TopNav's trailingLeft/Mid/Right slots.
function SegmentedControl({ options = [], value, onChange, ...props }) {
  return (
    <div className="segmented-control" {...props}>
      {options.map((option) => (
        <SegmentedButton
          key={option.value}
          label={option.label}
          selected={option.value === value}
          onClick={() => onChange?.(option.value)}
        />
      ))}
    </div>
  )
}

export default SegmentedControl
