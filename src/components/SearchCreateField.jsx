import { useEffect, useId, useRef, useState } from 'react'
import './SearchCreateField.css'
import SelectableListItem from './SelectableListItem'
import {
  Add,
  ArrowBack,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Search,
} from '@nine-thirty-five/material-symbols-react/outlined'

// The app is always a phone-width column, even on wide viewports (see
// #root's max-width in index.css) — "desktop" here just means mouse +
// keyboard, not a wider layout. This only decides which popup shape to
// render: a floating dropdown attached to the field, or a full-screen
// search overlay. 768px matches the breakpoint ContentSearchList's own
// filter row already uses.
const DESKTOP_QUERY = '(min-width: 768px)'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches,
  )
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY)
    const handleChange = (event) => setIsDesktop(event.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])
  return isDesktop
}

// Reusable "search or add" combobox. Two variants:
//   - "combobox" (default): field + a results list of `items` to pick
//     from, with a fixed "Adicionar X: '...'" row when there's text to
//     create from. On desktop the list is a dropdown attached directly
//     under the field (no gap/shadow between them, so it reads as one
//     shape); on mobile, focusing the field opens a full-screen search
//     overlay instead — easier to use one-handed with the keyboard up
//     than a small popup. Used by ContentForm (Série/Filme picker).
//   - "filter": just a plain filter input, no popup at all. Used by
//     ManageSeries, where the matching results are already always
//     visible as the page's own list — a second, hidden list would
//     just duplicate it. Quick-create there lives inline in that list
//     instead (see ManageSeries.jsx).
//
// Deliberately dumb: `items` must already be pre-filtered by the
// caller (matches the rest of the app's slot-driven components) — this
// only owns the open/close, row-selection, and keyboard behavior.
//
// settingsIcon/onSettingsClick are optional — the gear button next to
// the field (e.g. "manage séries") isn't always present.
function SearchCreateField({
  variant = 'combobox',
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
  const isDesktop = useIsDesktop()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const overlayInputRef = useRef(null)

  const trimmed = value.trim()
  const showCreate = Boolean(trimmed) && Boolean(onCreate)
  const rowCount = items.length + (showCreate ? 1 : 0)

  // Focus lands on the overlay's own input once it mounts — the main
  // field stays read-only on mobile (see below), so this is the only
  // input the user actually types into there.
  useEffect(() => {
    if (!open || isDesktop) return
    const timer = setTimeout(() => overlayInputRef.current?.focus(), 0)
    return () => clearTimeout(timer)
  }, [open, isDesktop])

  function handleBlur(event) {
    // Mobile closes explicitly (back arrow / selection / create) —
    // relying on blur's relatedTarget there is flaky on mobile Safari
    // and would risk closing the overlay the instant it opens (its
    // input stealing focus counts as a blur on the main field).
    if (!isDesktop) return
    if (containerRef.current?.contains(event.relatedTarget)) return
    setOpen(false)
  }

  function handleFocus() {
    setOpen(true)
    setActiveIndex(-1)
  }

  function handleChange(newValue) {
    onChange?.(newValue)
    setActiveIndex(-1)
  }

  function handleSelect(item) {
    onSelect?.(item)
    setOpen(false)
  }

  function handleCreate() {
    onCreate?.(trimmed)
    setOpen(false)
  }

  function activateRow(index) {
    if (index < 0 || index >= rowCount) return
    if (index < items.length) handleSelect(items[index])
    else handleCreate()
  }

  function handleKeyDown(event) {
    if (!isDesktop) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((current) => Math.min(current + 1, rowCount - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => Math.max(current - 1, 0))
    } else if (event.key === 'Enter') {
      if (activeIndex >= 0) {
        event.preventDefault()
        activateRow(activeIndex)
      }
    } else if (event.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  function renderRows(highlight) {
    return (
      <>
        {items.map((item, index) => (
          <SelectableListItem
            key={item.id}
            label={item.label}
            selected={highlight && index === activeIndex}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => handleSelect(item)}
          />
        ))}
        {showCreate && (
          <SelectableListItem
            label={`Adicionar ${createLabel}: "${trimmed}"`}
            leadingIcon={<Add />}
            data-variant="create"
            selected={highlight && activeIndex === items.length}
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleCreate}
          />
        )}
      </>
    )
  }

  if (variant === 'filter') {
    return (
      <div className="search-create-field">
        <div className="search-create-field-row">
          <span className="search-create-field-input-wrap">
            {label && (
              <label className="search-create-field-label" htmlFor={id}>
                {label}
              </label>
            )}
            <span className="search-create-field-control">
              <Search className="search-create-field-filter-icon" aria-hidden="true" />
              <input
                id={id}
                className="search-create-field-input"
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(event) => onChange?.(event.target.value)}
                {...props}
              />
            </span>
          </span>
        </div>
      </div>
    )
  }

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
              ref={inputRef}
              className="search-create-field-input"
              type="text"
              placeholder={placeholder}
              value={value}
              readOnly={!isDesktop}
              role="combobox"
              aria-expanded={open}
              aria-autocomplete="list"
              onChange={(event) => handleChange(event.target.value)}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              {...props}
            />
            <span className="search-create-field-chevron" aria-hidden="true">
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </span>
          </span>

          {isDesktop && open && (rowCount > 0 || items.length > 0) && (
            <div className="search-create-field-list" role="listbox">
              {renderRows(true)}
            </div>
          )}
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

      {!isDesktop && open && (
        <div className="search-create-field-overlay">
          <div className="search-create-field-overlay-header">
            <button
              type="button"
              className="search-create-field-overlay-back"
              onClick={() => setOpen(false)}
              aria-label="Voltar"
            >
              <ArrowBack />
            </button>
            <span className="search-create-field-overlay-input-wrap">
              <Search className="search-create-field-overlay-icon" aria-hidden="true" />
              <input
                ref={overlayInputRef}
                className="search-create-field-overlay-input"
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(event) => handleChange(event.target.value)}
              />
            </span>
          </div>
          <div className="search-create-field-overlay-list">{renderRows(false)}</div>
        </div>
      )}
    </div>
  )
}

export default SearchCreateField
