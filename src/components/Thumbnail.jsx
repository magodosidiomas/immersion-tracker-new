import './Thumbnail.css'

// Content cover slot. Shows the image when `src` is set; otherwise falls
// back to a centered icon (see src/data/contentTypes.js for which icon
// per type). Book covers get their own size/behavior: uniform 16:9-style
// slot but centered on a black backdrop with object-fit: contain, since
// cropping a book cover looks wrong (decided during library screen work).
function Thumbnail({ size = 'sm', src = null, alt = '', icon = null }) {
  return (
    <span className="thumbnail" data-size={size}>
      {src ? (
        <img
          className="thumbnail-image"
          src={src}
          alt={alt}
          data-fit={size === 'book' ? 'contain' : 'cover'}
        />
      ) : (
        icon && <span className="thumbnail-icon">{icon}</span>
      )}
    </span>
  )
}

export default Thumbnail
