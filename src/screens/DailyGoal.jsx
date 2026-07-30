import { useEffect, useRef, useState } from 'react'
import TopNav from '../components/TopNav'
import Modal from '../components/Modal'
import SelectableListItem from '../components/SelectableListItem'
import Button from '../components/Button'
import DurationInput from '../components/DurationInput'
import { formatDurationShort } from '../utils/sessions'
import { getAppSettings } from '../db'
import { ArrowBack, Close } from '@nine-thirty-five/material-symbols-react/outlined'
import './DailyGoal.css'

const PRESETS = [
  { label: 'Leve', minutes: 15 },
  { label: 'Casual', minutes: 30 },
  { label: 'Regular', minutes: 60 },
  { label: 'Séria', minutes: 90 },
  { label: 'Intensa', minutes: 120 },
]

// "Meta diária" screen — reached from the home DailyGoalCard or Settings
// > Preferências > Meta diária. Self-sufficient (fetches its own current
// goal via getAppSettings, same pattern as AddLanguages/Home) rather than
// requiring App.jsx to thread the value down. Two sub-views:
// - 'presets': list of fixed options + an outline button that opens 'custom'.
//   Picking a preset only selects it (highlighted row) — Salvar confirms.
// - 'custom': DurationInput (hours/minutes) seeded from the current goal
//   if it doesn't match a preset. Its own Salvar persists immediately and
//   closes the whole screen (per design decision: no round-trip back to
//   the presets list).
function DailyGoal({ isDesktop = false, onBack, onSave }) {
  const [loaded, setLoaded] = useState(false)
  const [currentGoal, setCurrentGoal] = useState(null)
  const [view, setView] = useState('presets')
  const [selectedMinutes, setSelectedMinutes] = useState(null)
  const durationRef = useRef(null)

  useEffect(() => {
    getAppSettings().then((settings) => {
      const minutes = settings.dailyGoalMinutes ?? null
      setCurrentGoal(minutes)
      setSelectedMinutes(PRESETS.some((p) => p.minutes === minutes) ? minutes : null)
      setLoaded(true)
    })
  }, [])

  if (!loaded) return null

  const customInitial = { hours: Math.floor((currentGoal ?? 60) / 60), minutes: (currentGoal ?? 60) % 60 }

  function handleSavePresets() {
    if (selectedMinutes) onSave(selectedMinutes)
  }

  function handleSaveCustom() {
    const { hours, minutes } = durationRef.current.getValue()
    const total = hours * 60 + minutes
    if (total > 0) onSave(total)
  }

  const presetsView = (
    <>
      <h1 className="daily-goal-heading">Escolha uma meta</h1>
      <div className="daily-goal-list-card">
        {PRESETS.map((preset, index) => (
          <SelectableListItem
            key={preset.minutes}
            label={preset.label}
            description={`${formatDurationShort(preset.minutes * 60)} / dia`}
            selected={selectedMinutes === preset.minutes}
            divider={index > 0}
            position={index === 0 ? 'first' : index === PRESETS.length - 1 ? 'last' : 'middle'}
            onClick={() => setSelectedMinutes(preset.minutes)}
          />
        ))}
      </div>
      <Button variant="outline" fullWidth onClick={() => setView('custom')}>
        Definir meta personalizada
      </Button>
    </>
  )

  const customView = (
    <>
      <h1 className="daily-goal-heading">Quanto por dia?</h1>
      <div className="daily-goal-custom-input">
        <DurationInput ref={durationRef} initialValue={customInitial} />
      </div>
    </>
  )

  if (isDesktop) {
    return (
      <Modal
        title="Meta diária"
        leadingIcon={view === 'custom' ? <ArrowBack /> : undefined}
        onLeadingClick={view === 'custom' ? () => setView('presets') : undefined}
        trailingIcon={view === 'presets' ? <Close /> : undefined}
        onTrailingClick={view === 'presets' ? onBack : undefined}
        onClose={onBack}
        footer={
          <Button onClick={view === 'presets' ? handleSavePresets : handleSaveCustom} disabled={view === 'presets' && !selectedMinutes}>
            Salvar
          </Button>
        }
      >
        {view === 'presets' ? presetsView : customView}
      </Modal>
    )
  }

  return (
    <main className="daily-goal">
      <TopNav
        title={view === 'custom' ? 'Meta personalizada' : 'Meta diária'}
        hasDivider
        leadingIcon={
          <button
            type="button"
            className="top-nav-icon-reset"
            onClick={view === 'custom' ? () => setView('presets') : onBack}
            aria-label="Voltar"
          >
            <ArrowBack />
          </button>
        }
      />
      <div className="daily-goal-content">{view === 'presets' ? presetsView : customView}</div>
      <div className="daily-goal-footer">
        <Button
          fullWidth
          onClick={view === 'presets' ? handleSavePresets : handleSaveCustom}
          disabled={view === 'presets' && !selectedMinutes}
        >
          Salvar
        </Button>
      </div>
    </main>
  )
}

export default DailyGoal
