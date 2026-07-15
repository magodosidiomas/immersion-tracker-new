import './EditableListItem.css'

// A list row for "manage a catalog" screens (séries, filmes, episódios):
// label/description text plus separate edit and delete icon buttons.
// Unlike ListItem, the whole row isn't a single <button> — the edit
// and delete actions need their own click targets that don't bubble
// into a row-level click, and nesting <button> inside <button> isn't
// valid HTML. `onClick` on the text area is optional (episode rows
// aren't themselves navigable, only their icons are).
function EditableListItem({
  label = 'Label',
  description = null,
  onClick = null,
  editIcon = null,
  onEdit,
  deleteIcon = null,
  onDelete,
  divider = false,
}) {
  const text = (
    <span className="editable-list-item-text">
      <span className="editable-list-item-label">{label}</span>
      {description && <span className="editable-list-item-description">{description}</span>}
    </span>
  )

  return (
    <div className="editable-list-item" data-divider={divider}>
      {onClick ? (
        <button type="button" className="editable-list-item-main" onClick={onClick}>
          {text}
        </button>
      ) : (
        <span className="editable-list-item-main">{text}</span>
      )}
      {editIcon && (
        <button type="button" className="editable-list-item-icon-btn" onClick={onEdit} aria-label="Editar">
          {editIcon}
        </button>
      )}
      {deleteIcon && (
        <button
          type="button"
          className="editable-list-item-icon-btn"
          data-danger="true"
          onClick={onDelete}
          aria-label="Excluir"
        >
          {deleteIcon}
        </button>
      )}
    </div>
  )
}

export default EditableListItem
