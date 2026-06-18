import { useEffect, useState } from 'react'
import TopNav from '../components/TopNav'
import Dropdown from '../components/Dropdown'
import Button from '../components/Button'
import { Close, PlayArrow, Pause, Stop } from '@nine-thirty-five/material-symbols-react/outlined'
import './NewSession.css'

// Three states only: idle (not started) / running / paused. No IndexedDB
// writes happen here yet — per the locked MVP decision, the timer lives
// purely in memory, and closing/reloading loses it. So there's nothing
// to resume on mount either; this screen always starts idle.
//
// Elapsed time is accumulatedMs (frozen total from past running
// segments) plus the live segment in progress, recomputed from
// Date.now() every tick rather than just incrementing a counter — the
// same drift-resistant shape the future IndexedDB draft-session
// persistence is planned to use (status + startTime timestamp, see the
// data model doc), so wiring real persistence in later is additive
// instead of a rewrite of how time itself is measured.
//
// The category Dropdown deliberately doesn't open anything yet — its
// bottom sheet needs the Chip component, which doesn't exist. Picking a
// category isn't required to start the timer either way (the data model
// allows picking it during or after the session), so the timer flow
// itself isn't blocked by this.
//
// "Encerrar" doesn't lead to a real session-details screen yet (that
// screen also needs Chip, plus fields not built). For now it just
// discards and closes — swap handleEnd's body for real navigation once
// that screen exists.
function NewSession({ onClose }) {
  const [status, setStatus] = useState('idle') // idle | running | paused
  const [accumulatedMs, setAccumulatedMs] = useState(0)
  const [runStartedAt, setRunStartedAt] = useState(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [status])

  function handleStart() {
    setRunStartedAt(Date.now())
    setStatus('running')
  }

  function handlePause() {
    setAccumulatedMs((ms) => ms + (Date.now() - runStartedAt))
    setRunStartedAt(null)
    setStatus('paused')
  }

  function handleResume() {
    setRunStartedAt(Date.now())
    setStatus('running')
  }

  function handleEnd() {
    // TODO: open the session-details screen once it exists, passing
    // along the elapsed duration. Blocked on Chip + the rest of that
    // screen's missing fields.
    onClose()
  }

  const liveMs = status === 'running' ? accumulatedMs + (now - runStartedAt) : accumulatedMs
  const totalSeconds = Math.floor(liveMs / 1000)
  const display = [Math.floor(totalSeconds / 3600), Math.floor((totalSeconds % 3600) / 60), totalSeconds % 60]
    .map((unit) => String(unit).padStart(2, '0'))
    .join(':')

  return (
    <main className="new-session">
      <TopNav
        title="Nova sessão"
        hasDivider
        leadingIcon={
          <button type="button" className="top-nav-icon-reset" onClick={onClose} aria-label="Fechar">
            <Close />
          </button>
        }
      />
      <div className="new-session-body">
        <Dropdown label="Selecionar categoria" />
        <span className="new-session-timer">{display}</span>
      </div>
      <div className="new-session-footer">
        {status === 'idle' && (
          <Button leadingIcon={<PlayArrow />} fullWidth onClick={handleStart}>
            Iniciar
          </Button>
        )}
        {status === 'running' && (
          <>
            <Button leadingIcon={<Pause />} fullWidth onClick={handlePause}>
              Pausar
            </Button>
            <Button variant="outline" leadingIcon={<Stop />} fullWidth onClick={handleEnd}>
              Encerrar
            </Button>
          </>
        )}
        {status === 'paused' && (
          <>
            <Button leadingIcon={<PlayArrow />} fullWidth onClick={handleResume}>
              Retomar
            </Button>
            <Button variant="outline" leadingIcon={<Stop />} fullWidth onClick={handleEnd}>
              Encerrar
            </Button>
          </>
        )}
      </div>
    </main>
  )
}

export default NewSession
