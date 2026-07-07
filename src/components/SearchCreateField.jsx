import { useId, useRef, useState } from 'react'
import './SearchCreateField.css'
import SelectableListItem from './SelectableListItem'
import { Add, KeyboardArrowDown, KeyboardArrowUp } from '@nine-thirty-five/material-symbols-react/outlined'

// Reusable "search or add" combobox: a text field that opens an inline
// results list (not a floating dropdown — the list pushes the layout
// below it, per the Série/Filme form design). Matches the Figma field
// + optional settings button, with a fixed "Adicionar X: '...'" row
// always last in the list when there's text to create from.
//
// Deliberately dumb: `items` must already be pre-filtered by the
// caller (matches the rest of the app's slot-driven components) — this
// only owns the open/close and row-selection behavior.
//
// settingsIcon/onSettingsClick are optional — the gear button next to
// the field (e.g. "manage séries") isn't always present.
function SearchCreateField({
  label = null,
  placeholder = '',
  value = '',
  onChange,
  items = [],
  onSelect,
  createLabel = 'item',
  onCreate,
  settingsIcon = null,
  onSettingsClick,
  ...props
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  function handleBlur(event) {
    if (containerRef.current?.contains(event.relatedTarget)) return
    setOpen(false)
  }

  function handleSelect(item) {
    onSelect?.(item)
    setOpen(false)
  }

  function handleCreate() {
    onCreate?.(trimmed)
    setOpen(false)
  }

  const trimmed = value.trim()
  const showCreate = Boolean(trimmed) && Boolean(onCreate)
  const showList = open && (items.length > 0 || showCreate)

  return (
    <div className="search-create-field" ref={containerRef} onBlur={handleBlur}>
      <div className="search-create-field-row">
        <span className="search-create-field-input-wrap">
          {label && (
            <label className="search-create-field-label" htmlFor={id}>
              {label}
            </label>
          )}
          <span className="search-create-field-control" data-open={open}>
            <input
              id={id}
              className="search-create-field-input"
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(event) => onChange?.(event.target.value)}
              onFocus={() => setOpen(true)}
              {...props}
            />
            <span className="search-create-field-chevron" aria-hidden="true">
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </span>
          </span>
        </span>
        {settingsIcon && (
          <button
            type="button"
            className="search-create-field-settings"
            onClick={onSettingsClick}
            aria-label="Gerenciar"
          >
            {settingsIcon}
          </button>
        )}
      </div>
      {showList && (
        <div className="search-create-field-list">
          {items.map((item) => (
            <SelectableListItem
              key={item.id}
              label={item.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(item)}
            />
          ))}
          {showCreate && (
            <SelectableListItem
              label={`Adicionar ${createLabel}: "${trimmed}"`}
              leadingIcon={<Add />}
              data-variant="create"
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleCreate}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default SearchCreateField
