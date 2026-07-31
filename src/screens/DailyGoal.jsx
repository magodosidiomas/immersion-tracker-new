import { useEffect, useRef, useState } from 'react'
import TopNav from '../components/TopNav'
import Modal from '../components/Modal'
import BottomSheet from '../components/BottomSheet'
import SelectableListItem from '../components/SelectableListItem'
import Button from '../components/Button'
import DurationInput from '../components/DurationInput'
import { formatDurationShort } from '../utils/sessions'
import { getAppSettings } from '../db'
import { ArrowBack, Close, Edit } from '@nine-thirty-five/material-symbols-react/outlined'
import './DailyGoal.css'

const PRESETS = [
  { label: 'Leve', minutes: 15 },
  { label: 'Casual', minutes: 30 },
  { label: 'Regular', minutes: 60 },
  { label: 'Séria', minutes: 90 },
  { label: 'Intensa', minutes: 120 },
]

// "Meta diária" screen — reached from the home DailyGoalCard, Settings
// > Preferências > Meta diária, or (via `onboarding`) right after picking
// a language for the first time. Self-sufficient (fetches its own current
// goal via getAppSettings, same pattern as AddLanguages/Home).
//
// A custom goal is remembered independently of which goal is currently
// active (see setCustomGoalMinutes in db/index.js): picking a preset
// after having set a custom value only changes what's active, it never
// clears the remembered custom minutes. So once a custom goal exists it
// always shows as its own "Personalizada" row (same row chrome as the
// presets, layout="row", selected only when it's the active goal) with
// a trailing pencil to edit it — tapping the row itself just reselects
// it as active, same as tapping any preset.
//
// Editing/creating the custom goal opens a duration entry:
// - `embedded` (desktop SettingsWindow): a small nested BottomSheet
//   (variant="modal", same chrome as the "Adicionar filme" dialog) with
//   its own Cancelar/Confirmar — confirming saves immediately and
//   closes back to the presets list, which is the only view this screen
//   ever shows when embedded.
// - otherwise (mobile, including onboarding): the existing full-screen
//   sub-view with its own TopNav + footer Salvar.
// Picking a preset saves immediately when embedded (there's no separate
// panel-level Salvar anymore); on mobile it stays a pending selection
// confirmed via the screen's own footer Salvar, as before.
function DailyGoal({ isDesktop = false, embedded = false, onboarding = false, onBack, onSave }) {
  const [loaded, setLoaded] = useState(false)
  const [currentGoal, setCurrentGoal] = useState(null)
  const [customGoalMinutes, setCustomGoalMinutes] = useState(null)
  const [selectedMinutes, setSelectedMinutes] = useState(null)
  const [pendingCustom, setPendingCustom] = useState(false)
  const [view, setView] = useState('presets')
  const [customModalOpen, setCustomModalOpen] = useState(false)
  const [customError, setCustomError] = useState(null)
  const durationRef = useRef(null)

  useEffect(() => {
    getAppSettings().then((settings) => {
      const minutes = settings.dailyGoalMinutes ?? null
      const custom = settings.customGoalMinutes ?? null
      const isCustomFlag = Boolean(settings.dailyGoalIsCustom) && custom != null
      setCurrentGoal(minutes)
      setCustomGoalMinutes(custom)
      if (isCustomFlag) {
        setSelectedMinutes(null)
        setPendingCustom(true)
      } else {
        setSelectedMinutes(PRESETS.some((p) => p.minutes === minutes) ? minutes : null)
        setPendingCustom(false)
      }
      setLoaded(true)
    })
  }, [])

  // Autofocus the hours field the moment the custom editor mounts —
  // brings up the keyboard on mobile, focuses the field on desktop.
  useEffect(() => {
    if (view === 'custom' || customModalOpen) {
      const id = requestAnimationFrame(() => durationRef.current?.focusFirst())
      return () => cancelAnimationFrame(id)
    }
  }, [view, customModalOpen])

  if (!loaded) return null

  const customInitial = {
    hours: Math.floor((customGoalMinutes ?? currentGoal ?? 60) / 60),
    minutes: (customGoalMinutes ?? currentGoal ?? 60) % 60,
  }
  const isCustomActive = pendingCustom

  function openCustomEditor() {
    setCustomError(null)
    if (embedded) setCustomModalOpen(true)
    else setView('custom')
  }

  function handlePickPreset(minutes) {
    setPendingCustom(false)
    if (embedded) {
      setCurrentGoal(minutes)
      onSave(minutes, false)
    } else {
      setSelectedMinutes(minutes)
    }
  }

  function handlePickCustom() {
    if (customGoalMinutes == null) return
    setPendingCustom(true)
    if (embedded) {
      setCurrentGoal(customGoalMinutes)
      onSave(customGoalMinutes, true)
    } else {
      setSelectedMinutes(null)
    }
  }

  function handleSavePresets() {
    if (pendingCustom) onSave(customGoalMinutes, true)
    else if (selectedMinutes) onSave(selectedMinutes, false)
  }

  function handleSaveCustom() {
    const { hours, minutes } = durationRef.current.getValue()
    const total = hours * 60 + minutes
    if (total === 0) {
      setCustomError('A meta precisa ser maior que 0 minutos.')
      return
    }
    setCustomError(null)
    onSave(total, true)
    setCurrentGoal(total)
    setCustomGoalMinutes(total)
    setPendingCustom(true)
    if (embedded) setCustomModalOpen(false)
  }

  const rows = customGoalMinutes != null ? [...PRESETS, { custom: true }] : PRESETS

  const presetsView = (
    <div className="daily-goal-view">
      <h1 className="daily-goal-heading">Escolha uma meta</h1>
      <div className="daily-goal-list-card">
        {rows.map((row, index) => {
          const position = index === 0 ? 'first' : index === rows.length - 1 ? 'last' : 'middle'
          if (row.custom) {
            return (
              <SelectableListItem
                key="custom"
                label="Personalizada"
                description={`${formatDurationShort(customGoalMinutes * 60)} / dia`}
                layout="row"
                trailingIcon={<Edit />}
                onTrailingIconClick={openCustomEditor}
                selected={isCustomActive}
                divider
                position={position}
                onClick={handlePickCustom}
              />
            )
          }
          return (
            <SelectableListItem
              key={row.minutes}
              label={row.label}
              description={`${formatDurationShort(row.minutes * 60)} / dia`}
              layout="row"
              selected={!pendingCustom && (embedded ? currentGoal === row.minutes : selectedMinutes === row.minutes)}
              divider={index > 0}
              position={position}
              onClick={() => handlePickPreset(row.minutes)}
            />
          )
        })}
      </div>
      {customGoalMinutes == null && (
        <Button variant="outline" fullWidth onClick={openCustomEditor}>
          Definir meta personalizada
        </Button>
      )}
    </div>
  )

  const customView = (
    <div className="daily-goal-view">
      {!embedded && <h1 className="daily-goal-heading">Quanto por dia?</h1>}
      <div className="daily-goal-custom-input">
        <DurationInput ref={durationRef} initialValue={customInitial} errorMessage={customError} />
      </div>
    </div>
  )

  if (embedded) {
    return (
      <div className="daily-goal-content" data-embedded="true">
        {presetsView}
        <BottomSheet
          open={customModalOpen}
          onClose={() => setCustomModalOpen(false)}
          title="Meta personalizada"
          contentCard={false}
          variant="modal"
          primaryButton={
            <Button fullWidth onClick={handleSaveCustom}>
              Confirmar
            </Button>
          }
          secondaryButton={
            <Button variant="outline" fullWidth onClick={() => setCustomModalOpen(false)}>
              Cancelar
            </Button>
          }
        >
          {customView}
        </BottomSheet>
      </div>
    )
  }

  if (isDesktop) {
    return (
      <Modal
        title={view === 'custom' ? 'Meta personalizada' : 'Meta diária'}
        leadingIcon={view === 'custom' ? <ArrowBack /> : undefined}
        onLeadingClick={view === 'custom' ? () => setView('presets') : undefined}
        trailingIcon={view === 'presets' ? <Close /> : undefined}
        onTrailingClick={view === 'presets' ? onBack : undefined}
        onClose={onBack}
        footer={
          <Button
            onClick={view === 'presets' ? handleSavePresets : handleSaveCustom}
            disabled={view === 'presets' && !selectedMinutes && !pendingCustom}
          >
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
          view === 'custom' ? (
            <button type="button" className="top-nav-icon-reset" onClick={() => setView('presets')} aria-label="Voltar">
              <ArrowBack />
            </button>
          ) : onboarding ? null : (
            <button type="button" className="top-nav-icon-reset" onClick={onBack} aria-label="Voltar">
              <ArrowBack />
            </button>
          )
        }
        trailingRight={
          onboarding && view === 'presets' ? (
            <Button variant="ghost" size="sm" onClick={onBack}>
              Pular
            </Button>
          ) : null
        }
      />
      <div className="daily-goal-content">{view === 'presets' ? presetsView : customView}</div>
      <div className="daily-goal-footer">
        <Button
          fullWidth
          onClick={view === 'presets' ? handleSavePresets : handleSaveCustom}
          disabled={view === 'presets' && !selectedMinutes && !pendingCustom}
        >
          Salvar
        </Button>
      </div>
    </main>
  )
}

export default DailyGoal
