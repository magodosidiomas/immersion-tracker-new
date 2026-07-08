import { useState, useEffect, useRef } from 'react'
import Button from '../../components/Button'
import SelectableListItem from '../../components/SelectableListItem'
import Dropdown from '../../components/Dropdown'
import BottomSheet from '../../components/BottomSheet'
import Checkbox from '../../components/Checkbox'
import SelectionChip from '../../components/SelectionChip'
import SegmentedButton from '../../components/SegmentedButton'
import SegmentedControl from '../../components/SegmentedControl'
import DurationInput from '../../components/DurationInput'
import Calendar from '../../components/Calendar'
import { getAppSettings, getSessionsByLanguage } from '../../db'
import { AVAILABLE_LANGUAGES } from '../../data/availableLanguages'
import { Bolt, Check } from '@nine-thirty-five/material-symbols-react/outlined'
import Flag from '../../components/Flag'

// Small interactive demos for components whose preview needs real
// state (toggle, open/close, fetch) rather than a static prop combo.
// Split out from registry.jsx so that file can stay a pure data
// export (registry.jsx exporting an array alongside components
// defined in the same file breaks react-refresh's fast-refresh
// boundary — see eslint react-refresh/only-export-components).

const buttonVariants = ['primary', 'outline', 'ghost', 'warning', 'destructive', 'destructive-outline', 'destructive-ghost']

export function ButtonRow({ size, disabled }) {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {buttonVariants.map((variant) => (
        <Button key={variant} variant={variant} size={size} disabled={disabled} leadingIcon={<Bolt />} trailingIcon={<Bolt />}>
          Button label
        </Button>
      ))}
    </div>
  )
}

export function SelectionChipDemo() {
  const [selected, setSelected] = useState(false)
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <SelectionChip selected={selected} onClick={() => setSelected((s) => !s)} />
      <SelectionChip label="No icons" hasLeadingIcon={false} hasTrailingIcon={false} />
    </div>
  )
}

export function SegmentedButtonDemo() {
  const [selected, setSelected] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {[0, 1, 2].map((i) => (
        <SegmentedButton key={i} selected={selected === i} onClick={() => setSelected(i)} />
      ))}
    </div>
  )
}

export function SegmentedControlDemo() {
  const [value3, setValue3] = useState('a')
  const [value2, setValue2] = useState('x')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 296 }}>
      <SegmentedControl
        options={[{ label: 'Label', value: 'a' }, { label: 'Label', value: 'b' }, { label: 'Label', value: 'c' }]}
        value={value3}
        onChange={setValue3}
      />
      <SegmentedControl options={[{ label: 'Label', value: 'x' }, { label: 'Label', value: 'y' }]} value={value2} onChange={setValue2} />
    </div>
  )
}

export function CheckboxDemo() {
  const [checked, setChecked] = useState(false)
  return <Checkbox label="Label" description="Description" checked={checked} onClick={() => setChecked((c) => !c)} />
}

export function BottomSheetDemo() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(AVAILABLE_LANGUAGES[0].name)
  return (
    <>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Button variant="primary" onClick={() => setOpen(true)}>Abrir bottom sheet</Button>
        <Dropdown flag={<Flag code="us" />} label="Inglês" selected onClick={() => setOpen(true)} />
      </div>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Idioma"
        description="Escolha o idioma que você quer praticar."
        divider
        primaryButton={<Button variant="primary">Salvar</Button>}
        secondaryButton={<Button variant="ghost">Cancelar</Button>}
      >
        {AVAILABLE_LANGUAGES.map((language) => (
          <SelectableListItem
            key={language.name}
            label={language.name}
            flag={<Flag code={language.flagCode} />}
            selected={language.name === selected}
            trailingIcon={language.name === selected ? <Check /> : null}
            onClick={() => setSelected(language.name)}
          />
        ))}
      </BottomSheet>
    </>
  )
}

export function CalendarDemo() {
  const [sessionDates, setSessionDates] = useState([])
  useEffect(() => {
    getAppSettings().then((settings) => {
      if (!settings.activeLanguageId) return
      getSessionsByLanguage(settings.activeLanguageId).then((sessions) => setSessionDates(sessions.map((s) => s.date)))
    })
  }, [])
  return <Calendar sessionDates={sessionDates} />
}

export function DurationInputDemo() {
  const refHMS = useRef(null)
  const refHM = useRef(null)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 343 }}>
      <div>
        <p style={{ color: 'var(--color-text-tertiary)', marginBottom: 12, fontSize: 12 }}>hasSeconds=true (duração)</p>
        <DurationInput ref={refHMS} hasSeconds initialValue={{ hours: 0, minutes: 20, seconds: 30 }} />
      </div>
      <div>
        <p style={{ color: 'var(--color-text-tertiary)', marginBottom: 12, fontSize: 12 }}>hasSeconds=false (horário)</p>
        <DurationInput ref={refHM} hasSeconds={false} initialValue={{ hours: 12, minutes: 34, seconds: 0 }} />
      </div>
      <div>
        <p style={{ color: 'var(--color-text-tertiary)', marginBottom: 12, fontSize: 12 }}>state=error</p>
        <DurationInput initialValue={{ hours: 12, minutes: 10, seconds: 0 }} errorMessage="O horário de término precisa ser depois do início (12:35)." />
      </div>
    </div>
  )
}
