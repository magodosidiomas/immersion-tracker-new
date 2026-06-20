import './Banner.css'

// Mirrors the Figma "banner" component set (type: primary | secondary).
// Slot presence instead of hasX booleans, same as Button/ResumeSessionBanner —
// icon/title/description/primaryButton/secondaryButton only render when passed in.
function Banner({ type = 'primary', icon, title, description, primaryButton, secondaryButton }) {
  return (
    <div className="banner" data-type={type}>
      {icon && <span className="banner-icon">{icon}</span>}
      <div className="banner-content">
        {(title || description) && (
          <div className="banner-text">
            {title && <p className="banner-title">{title}</p>}
            {description && <p className="banner-description">{description}</p>}
          </div>
        )}
        {(primaryButton || secondaryButton) && (
          <div className="banner-actions">
            {secondaryButton}
            {primaryButton}
          </div>
        )}
      </div>
    </div>
  )
}

export default Banner
