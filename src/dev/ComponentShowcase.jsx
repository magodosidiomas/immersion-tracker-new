import { useState } from 'react'
import Button from '../components/Button'
import SelectableListItem from '../components/SelectableListItem'
import ListItem from '../components/ListItem'
import Dropdown from '../components/Dropdown'
import TopNav from '../components/TopNav'
import BottomSheet from '../components/BottomSheet'
import Checkbox from '../components/Checkbox'
import InputField from '../components/InputField'
import SelectionChip from '../components/SelectionChip'
import ResumeSessionBanner from '../components/ResumeSessionBanner'
import TimerWidget from '../components/TimerWidget'
import NumericCard from '../components/NumericCard'
import StreakItem from '../components/StreakItem'
import StreakItemGroup from '../components/StreakItemGroup'
import { AVAILABLE_LANGUAGES } from '../data/availableLanguages'
import { Bolt, Check, ArrowBack, ViewInAr, Schedule } from '@nine-thirty-five/material-symbols-react/outlined'
import Flag from '../components/Flag'

// Temporary: a visual checklist of every implemented component, so we
// can compare against Figma before building real screens. This file
// (and the App.jsx wiring to it) goes away once routing/real screens
// exist — it's not part of the app itself.

const variants = [
  'primary',
  'outline',
  'ghost',
  'destructive',
  'destructive-outline',
  'destructive-ghost',
]
const sizes = ['lg', 'sm']

function ButtonRow({ size, disabled }) {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
      {variants.map((variant) => (
        <Button
          key={variant}
          variant={variant}
          size={size}
          disabled={disabled}
          leadingIcon={<Bolt />}
          trailingIcon={<Bolt />}
        >
          Button label
        </Button>
      ))}
    </div>
  )
}

function ComponentShowcase() {
  return (
    <main
      style={{
        padding: 32,
        background: 'var(--color-purple-900)',
        minHeight: '100vh',
        fontFamily: 'var(--font-family-main)',
      }}
    >
      <h1 style={{ color: 'var(--color-text-primary)' }}>Button</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        Hover any of these for real to check the hover state — no separate
        "hover" row needed, the browser does that for free.
      </p>

      {sizes.map((size) => (
        <div key={size} style={{ marginBottom: 24 }}>
          <h2 style={{ color: 'var(--color-text-tertiary)', fontSize: 14 }}>{size}</h2>
          <ButtonRow size={size} disabled={false} />
          <ButtonRow size={size} disabled={true} />
        </div>
      ))}

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>SelectableListItem</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        Same idea as Button: hover for real instead of a separate row.
        leadingIcon/trailingIcon/flag are plain slots — these examples pass
        Check and a flag, but neither is hardcoded into the component.
      </p>
      <div style={{ width: 324, display: 'flex', flexDirection: 'column' }}>
        <SelectableListItem label="Selected" selected flag={<Flag code="us" />} leadingIcon={<Check />} trailingIcon={<Check />} />
        <SelectableListItem label="Default" flag={<Flag code="us" />} leadingIcon={<Check />} trailingIcon={<Check />} />
        <SelectableListItem label="Disabled" disabled flag={<Flag code="us" />} leadingIcon={<Check />} trailingIcon={<Check />} />
        <SelectableListItem label="Default, with divider" divider flag={<Flag code="us" />} leadingIcon={<Check />} trailingIcon={<Check />} />
        <SelectableListItem label="Selected, with divider" selected divider flag={<Flag code="us" />} leadingIcon={<Check />} trailingIcon={<Check />} />
        <SelectableListItem label="Disabled, with divider" disabled divider flag={<Flag code="us" />} leadingIcon={<Check />} trailingIcon={<Check />} />
      </div>

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>ListItem</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        Same row chrome as SelectableListItem, but no selected state —
        adds description/extraText slots instead.
      </p>
      <div style={{ width: 324, display: 'flex', flexDirection: 'column' }}>
        <ListItem
          label="Label"
          description="Imersão · Escuta e leitura"
          extraText="1h 20"
          flag={<Flag code="us" />}
          leadingIcon={<Check />}
          trailingIcon={<Check />}
        />
        <ListItem
          label="Label"
          description="Imersão · Escuta e leitura"
          extraText="1h 20"
          divider
          flag={<Flag code="us" />}
          leadingIcon={<Check />}
          trailingIcon={<Check />}
        />
        <ListItem
          label="Label"
          description="Imersão · Escuta e leitura"
          extraText="1h 20"
          disabled
          flag={<Flag code="us" />}
          leadingIcon={<Check />}
          trailingIcon={<Check />}
        />
      </div>

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>Dropdown</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        hasSelection is the only designed variant — flag/label/secondaryLabel
        are plain slots, same idea as the components above.
      </p>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <Dropdown flag={<Flag code="us" />} label="Label" secondaryLabel="Label 2nd" />
        <Dropdown flag={<Flag code="us" />} label="Label" secondaryLabel="Label 2nd" selected />
        <Dropdown flag={<Flag code="us" />} label="Inglês" selected />
      </div>

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>TopNav</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        leadingIcon/flag and trailingLeft/Mid/Right are plain slots, same
        idea as the components above — passing null hides them instead of
        a separate has* boolean.
      </p>
      <div style={{ width: 375, display: 'flex', flexDirection: 'column' }}>
        <TopNav
          title="Page title"
          leadingIcon={<ArrowBack />}
          trailingLeft={<ViewInAr />}
          trailingMid={<ViewInAr />}
          trailingRight={<ViewInAr />}
        />
        <TopNav
          title="Page title"
          leadingIcon={<ArrowBack />}
          trailingLeft={<ViewInAr />}
          trailingMid={<ViewInAr />}
          trailingRight={<ViewInAr />}
          hasDivider
        />
        <TopNav
          title="Inglês"
          flag={<Flag code="us" />}
          hasDropdown
          hasDivider
          trailingLeft={<ViewInAr />}
          trailingMid={<ViewInAr />}
          trailingRight={<ViewInAr />}
        />
      </div>
      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>BottomSheet</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        Mobile vs desktop is CSS-driven (resize the window to see it switch
        from a sheet to a centered modal) — no device prop. Demoed here with
        its real first use case: picking the active language.
      </p>
      <BottomSheetDemo />

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>Checkbox</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        description is the only optional slot (null hides it) — checked is
        toggled here for real instead of a static "isActive" row.
      </p>
      <div style={{ width: 343, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <CheckboxDemo />
        <Checkbox label="Label" description="Description" checked />
        <Checkbox label="Label only" />
      </div>

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>InputField</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        isFilled isn't a prop — type into the first field to see the
        placeholder style swap to the bold value style for real.
      </p>
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <InputField
          label="Label"
          placeholder="Placeholder"
          hint="Hint text"
          leadingIcon={<Bolt />}
          trailingIcon={<Bolt />}
        />
        <InputField
          label="Label"
          placeholder="Placeholder"
          hint="Hint text"
          defaultValue="User input"
          leadingIcon={<Bolt />}
          trailingIcon={<Bolt />}
        />
      </div>

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>SelectionChip</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        selected is toggled here for real instead of a static row.
        hasLeadingIcon/hasTrailingIcon are booleans, not slots — both
        Figma instances show a check on each side, so both default true.
      </p>
      <SelectionChipDemo />

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>ResumeSessionBanner</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        Purely presentational — icon/title/description and the two buttons
        are all passed in, same primaryButton/secondaryButton slot pattern
        as BottomSheet. No draft-reading or resume/discard logic yet.
      </p>
      <div style={{ width: 343 }}>
        <ResumeSessionBanner
          icon={<Schedule />}
          title="Sessão em andamento"
          description="Iniciada há 2h09min"
          secondaryButton={
            <Button variant="outline" size="sm">
              Descartar
            </Button>
          }
          primaryButton={
            <Button variant="primary" size="sm">
              Continuar
            </Button>
          }
        />
      </div>

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>TimerWidget</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        Mirrors the Figma "timerCard" set (hasSelection × state, 4
        variants). Same component for Home's in-place card and the
        floating mini-player over other screens — onToggle stops
        propagation so it doesn't also fire onClick (which opens the
        full timer screen).
      </p>
      <div style={{ width: 343, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TimerWidget elapsedLabel="00:01" running />
        <TimerWidget elapsedLabel="00:01" category="Imersão" subcategory="Simultâneo" running />
        <TimerWidget elapsedLabel="00:01" running={false} />
        <TimerWidget elapsedLabel="00:01" category="Imersão" subcategory="Simultâneo" running={false} />
      </div>

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>NumericCard</h1>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <NumericCard title="Sequência" number="12" />
        <NumericCard title="Total de horas" number="148" />
        <NumericCard />
      </div>

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>StreakItem</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        isActive × isToday, 3 documented Figma variants below. Plain div,
        not a button — purely presentational.
      </p>
      <div style={{ display: 'flex', gap: 16 }}>
        <StreakItem weekday="S" />
        <StreakItem weekday="S" isActive />
        <StreakItem weekday="S" isToday />
      </div>

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>StreakItemGroup</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        Row of StreakItem. days prop not finalized against real
        date/streak logic yet — visual component only for now.
      </p>
      <StreakItemGroup />
    </main>
  )
}

function SelectionChipDemo() {
  const [selected, setSelected] = useState(false)
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <SelectionChip selected={selected} onClick={() => setSelected((s) => !s)} />
      <SelectionChip label="No icons" hasLeadingIcon={false} hasTrailingIcon={false} />
    </div>
  )
}

function CheckboxDemo() {
  const [checked, setChecked] = useState(false)
  return (
    <Checkbox
      label="Label"
      description="Description"
      checked={checked}
      onClick={() => setChecked((c) => !c)}
    />
  )
}

// Demoes BottomSheet with its real first use case (the language
// switcher) instead of placeholder content, since customContent's
// actual shape — a scrollable list of SelectableListItems — is part
// of what needs checking against Figma.
function BottomSheetDemo() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(AVAILABLE_LANGUAGES[0].name)

  return (
    <>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Abrir bottom sheet
        </Button>
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

export default ComponentShowcase
