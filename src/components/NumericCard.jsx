import './NumericCard.css'

// Mirrors the Figma "numericCard" component. hasTitle/hasNumber from the
// Figma properties aren't exposed as separate booleans — same as Button's
// leadingIcon/trailingIcon, presence of the title/number prop is the toggle.
function NumericCard({ title = 'Título', number = '000', size, ...props }) {
  return (
    <div className="numeric-card" data-size={size} {...props}>
      {title && <span className="numeric-card-title">{title}</span>}
      {number && <span className="numeric-card-number">{number}</span>}
    </div>
  )
}

export default NumericCard
