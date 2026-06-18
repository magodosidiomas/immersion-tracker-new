import './Button.css'

// variant and size values match the Figma component exactly (variant:
// primary/outline/ghost/destructive/destructive-outline/destructive-ghost,
// size: lg/sm), so there's no translation step between design and code.
//
// Unlike the Figma component, there's no "state" prop — hover and
// disabled are handled the way the browser already handles them
// (:hover, the native `disabled` attribute), instead of being toggled
// manually. That's strictly less to get wrong, not a simplification
// that loses anything.
function Button({
  variant = 'primary',
  size = 'lg',
  disabled = false,
  fullWidth = false,
  leadingIcon = null,
  trailingIcon = null,
  children,
  ...props
}) {
  return (
    <button
      type="button"
      className="button"
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth}
      disabled={disabled}
      {...props}
    >
      {leadingIcon && <span className="button-icon">{leadingIcon}</span>}
      {children && <span>{children}</span>}
      {trailingIcon && <span className="button-icon">{trailingIcon}</span>}
    </button>
  )
}

export default Button
