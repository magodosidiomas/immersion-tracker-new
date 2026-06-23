import { Error, Check, Warning, Info } from '@nine-thirty-five/material-symbols-react/outlined'
import './Alert.css'

// Mirrors the Figma "alert" component set.
// type: 'error' | 'success' | 'alert' | 'info'
// title and description are optional slots — omit to hide.
// When title is absent, icon and description render on the same row.
function Alert({ type = 'info', title, description }) {
  const icons = {
    error: <Error />,
    success: <Check />,
    alert: <Warning />,
    info: <Info />,
  }

  return (
    <div className="alert" data-type={type}>
      <div className="alert-content">
        {title ? (
          <>
            <div className="alert-title-row">
              <span className="alert-icon">{icons[type]}</span>
              <p className="alert-title">{title}</p>
            </div>
            {description && (
              <div className="alert-description-row">
                <p className="alert-description">{description}</p>
              </div>
            )}
          </>
        ) : (
          <div className="alert-title-row">
            <span className="alert-icon">{icons[type]}</span>
            {description && <p className="alert-description">{description}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default Alert
