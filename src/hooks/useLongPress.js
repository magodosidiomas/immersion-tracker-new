import { useRef } from 'react'

const LONG_PRESS_MS = 500
const MOVE_THRESHOLD = 10

// Long-press detector for list rows (DayHistory, Library). Returns a
// `bind(key, onLongPress, onClick)` function rather than handlers
// directly, since a screen calls this once per row inside a .map() —
// calling a hook itself inside a loop would break the rules of hooks,
// so the one real hook call (this one) happens at the top of the
// component, and per-row state lives in a Map keyed by row id instead
// of separate useRef calls per row.
//
// A press held past LONG_PRESS_MS without moving more than
// MOVE_THRESHOLD fires onLongPress; anything shorter (or that moved,
// e.g. a scroll) falls through to onClick instead. A fired long-press
// swallows the click that follows pointer-up, since browsers still
// dispatch one after a touch/mouse press.
export function useLongPress() {
  const statesRef = useRef(new Map())

  function getState(key) {
    if (!statesRef.current.has(key)) {
      statesRef.current.set(key, { timer: null, start: { x: 0, y: 0 }, fired: false })
    }
    return statesRef.current.get(key)
  }

  return function bind(key, onLongPress, onClick) {
    const state = getState(key)

    function clear() {
      if (state.timer) {
        clearTimeout(state.timer)
        state.timer = null
      }
    }

    return {
      onPointerDown(event) {
        if (event.pointerType === 'mouse' && event.button !== 0) return
        state.fired = false
        state.start = { x: event.clientX, y: event.clientY }
        state.timer = setTimeout(() => {
          state.fired = true
          onLongPress()
        }, LONG_PRESS_MS)
      },
      onPointerMove(event) {
        const dx = Math.abs(event.clientX - state.start.x)
        const dy = Math.abs(event.clientY - state.start.y)
        if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) clear()
      },
      onPointerUp: clear,
      onPointerLeave: clear,
      onContextMenu(event) {
        event.preventDefault()
      },
      onClick(event) {
        clear()
        if (state.fired) {
          state.fired = false
          return
        }
        onClick?.(event)
      },
    }
  }
}
