import { useState, useEffect, useRef } from 'react'
import Button from '../components/Button'
import SelectableListItem from '../components/SelectableListItem'
import ListItem from '../components/ListItem'
import Dropdown from '../components/Dropdown'
import TopNav from '../components/TopNav'
import BottomSheet from '../components/BottomSheet'
import Checkbox from '../components/Checkbox'
import InputField from '../components/InputField'
import SelectionChip from '../components/SelectionChip'
import SegmentedButton from '../components/SegmentedButton'
import SegmentedControl from '../components/SegmentedControl'
import ResumeSessionBanner from '../components/ResumeSessionBanner'
import Banner from '../components/Banner'
import TimerWidget from '../components/TimerWidget'
import NumericCard from '../components/NumericCard'
import StreakItem from '../components/StreakItem'
import StreakItemGroup from '../components/StreakItemGroup'
import StreakCard from '../components/StreakCard'
import DataCard from '../components/DataCard'
import DonutCard from '../components/DonutCard'
import ImmersionCard from '../components/ImmersionCard'
import ReceptionCard from '../components/ReceptionCard'
import ProductionCard from '../components/ProductionCard'
import StudyCard from '../components/StudyCard'
import DurationInput from '../components/DurationInput'
import Alert from '../components/Alert'
import CalendarItem from '../components/CalendarItem'
import Calendar from '../components/Calendar'
import NavItem from '../components/NavItem'
import BottomNav from '../components/BottomNav'
import { getAppSettings, getSessionsByLanguage } from '../db'
import { AVAILABLE_LANGUAGES } from '../data/availableLanguages'
import { Bolt, Check, ArrowBack, ViewInAr, Schedule, Home, BarChart } from '@nine-thirty-five/material-symbols-react/outlined'
import Flag from '../components/Flag'

// Sample groups for DataCard — shaped like CATEGORIES with totals
// attached, but the component itself doesn't know that; it's just
// label/colorRamp/totalSeconds/items. Numbers are arbitrary, chosen to
// exercise different magnitudes (one big group, a few small ones) and
// a 4-item group (Produção) alongside three 3-item ones.
const DATA_CARD_SAMPLE = [
  {
    key: 'imersao',
    label: 'Imersão',
    colorRamp: 'data-violet',
    totalSeconds: 9360,
    items: [
      { key: 'simultaneo', label: 'Simultâneo', totalSeconds: 7200 },
      { key: 'escuta', label: 'Escuta', totalSeconds: 1980 },
      { key: 'leitura', label: 'Leitura', totalSeconds: 180 },
    ],
  },
  {
    key: 'imersaoInterativa',
    label: 'Imersão interativa',
    colorRamp: 'data-teal',
    totalSeconds: 1800,
    items: [
      { key: 'simultaneo', label: 'Simultâneo', totalSeconds: 900 },
      { key: 'escuta', label: 'Escuta', totalSeconds: 600 },
      { key: 'leitura', label: 'Leitura', totalSeconds: 300 },
    ],
  },
  {
    key: 'estudo',
    label: 'Estudo',
    colorRamp: 'data-amber',
    totalSeconds: 600,
    items: [
      { key: 'vocabulario', label: 'Vocabulário', totalSeconds: 240 },
      { key: 'gramatica', label: 'Gramática', totalSeconds: 180 },
      { key: 'pronuncia', label: 'Pronúncia', totalSeconds: 180 },
    ],
  },
  {
    key: 'producao',
    label: 'Produção',
    colorRamp: 'data-pink',
    totalSeconds: 600,
    items: [
      { key: 'fala', label: 'Fala', totalSeconds: 300 },
      { key: 'escrita', label: 'Escrita', totalSeconds: 120 },
      { key: 'conversacao', label: 'Conversação', totalSeconds: 180 },
      { key: 'aula', label: 'Aula', totalSeconds: 0 },
    ],
  },
]

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

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>SegmentedButton</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        Base of segmentedControl — selected toggled here for real. Only
        the selected variant has a documented hover change, so unselected
        has none.
      </p>
      <SegmentedButtonDemo />

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>SegmentedControl</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        options.length replaces hasThirdButton — 2 or 3 items both work,
        no separate prop. Fills its container's width by default.
      </p>
      <SegmentedControlDemo />

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>Banner</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        type=primary/secondary. Same icon/title/description/primaryButton/
        secondaryButton slot pattern as ResumeSessionBanner.
      </p>
      <div style={{ width: 343, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Banner
          type="primary"
          icon={<Bolt />}
          title="Título"
          description="Aqui vai uma descrição"
          secondaryButton={<Button variant="outline" size="sm">Button label</Button>}
          primaryButton={<Button variant="primary" size="sm">Button label</Button>}
        />
        <Banner
          type="secondary"
          icon={<Bolt />}
          title="Título"
          description="Aqui vai uma descrição"
          secondaryButton={<Button variant="outline" size="sm">Button label</Button>}
          primaryButton={<Button variant="primary" size="sm">Button label</Button>}
        />
      </div>

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

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>StreakCard</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        Header (🔥 + title/value) over a StreakItemGroup. Visual
        component only for now — same scope as StreakItemGroup.
      </p>
      <StreakCard />

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>CalendarItem</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        All 7 documented states (hover is plain CSS on active, not a
        prop — see SegmentedButton). Base for the Calendar component, next.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <CalendarItem day={3} state="default" />
        <CalendarItem day={3} state="active" />
        <CalendarItem day={3} state="today" />
        <CalendarItem day={3} state="disabled" />
        <CalendarItem day={3} state="weekend" />
        <CalendarItem day={3} state="month" />
        <CalendarItem day={3} state="white-version-month" />
        <CalendarItem day={3} state="white-version-today" />
      </div>

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>Calendar</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        ‹ › step one month at a time. Tap the label to jump straight to
        a different year — picking one returns to the month grid.
      </p>
      <Calendar />

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>Calendar (idioma ativo)</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        Same component, fed with real sessions from the active
        language — marks every day that has at least one session.
      </p>
      <CalendarDemo />

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>NavItem</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        Atom for bottom-nav, next. isActive maps to active — hover for
        real here too, same as Button/SegmentedButton.
      </p>
      <div style={{ display: 'flex', gap: 16 }}>
        <NavItem icon={<ViewInAr />} label="Label" />
        <NavItem icon={<ViewInAr />} label="Label" active />
      </div>

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>BottomNav</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        items.length replaces hasItem1-5, same idea as
        SegmentedControl&apos;s options array.
      </p>
      <div style={{ width: 375 }}>
        <BottomNav
          items={[
            { label: 'Home', icon: <Home />, active: true },
            { label: 'Dashboard', icon: <BarChart /> },
            { label: 'Label', icon: <ViewInAr /> },
            { label: 'Label', icon: <ViewInAr /> },
            { label: 'Label', icon: <ViewInAr /> },
          ]}
        />
      </div>
      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>DataCard</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        groups/items, not categories/subcategories — generic on purpose,
        see the comment in DataCard.jsx. Percent is always of the grand
        total across all groups, never of the parent group. Tap a group
        to expand; each opens independently.
      </p>
      <DataCard groups={DATA_CARD_SAMPLE} />

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>DonutCard</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        Same groups shape as DataCard — a ring built from stacked arcs plus
        a flat legend, no expand/collapse. Center label shows the largest
        group by default, or pass centerLabel to override.
      </p>
      <DonutCard
        title="Visão geral"
        description="Como seu tempo se divide entre as categorias."
        groups={DATA_CARD_SAMPLE}
      />

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>ImmersionCard</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        SegmentedControl (Habilidade/Formato) over a bare DonutCard. Habilidade
        shows Simultâneo/Escuta/Leitura summed across Imersão and Imersão
        interativa; Formato compares Imersão vs. Imersão interativa at the
        category level.
      </p>
      <ImmersionCard groups={DATA_CARD_SAMPLE} />

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>ReceptionCard</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        No SegmentedControl — Recepção (Escuta+Leitura from Imersão and
        Imersão interativa) vs. Produção's full total, each with a short
        description line under the label.
      </p>
      <ReceptionCard groups={DATA_CARD_SAMPLE} />

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>ProductionCard</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        No SegmentedControl — just Produção's own subcategories
        (Fala/Escrita/Conversação/Aula) shaded from the pink ramp.
      </p>
      <ProductionCard groups={DATA_CARD_SAMPLE} />

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>StudyCard</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        No SegmentedControl — just Estudo's own subcategories
        (Vocabulário/Gramática/Pronúncia) shaded from the amber ramp.
      </p>
      <StudyCard groups={DATA_CARD_SAMPLE} />

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>DurationInput</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        Segment inputs for h:m:s (duração) or h:m (horário). Uncontrolled
        internally; parent reads via ref.getValue(). Error state drives
        red border + red bg + message below. editKey pattern: bump a key
        prop on the component to remount fresh on each sheet open.
      </p>
      <DurationInputDemo />

      <h2>Alert</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 343 }}>
        <Alert type="error" title="Título" description="Descrição" />
        <Alert type="success" title="Título" description="Descrição" />
        <Alert type="alert" title="Título" description="Descrição" />
        <Alert type="info" title="Título" description="Descrição" />
        <Alert type="error" title="Só título, sem descrição" />
        <Alert type="info" description="Só descrição, sem título" />
      </div>
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

function SegmentedButtonDemo() {
  const [selected, setSelected] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {[0, 1, 2].map((i) => (
        <SegmentedButton
          key={i}
          selected={selected === i}
          onClick={() => setSelected(i)}
        />
      ))}
    </div>
  )
}

function SegmentedControlDemo() {
  const [value3, setValue3] = useState('a')
  const [value2, setValue2] = useState('x')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 296 }}>
      <SegmentedControl
        options={[
          { label: 'Label', value: 'a' },
          { label: 'Label', value: 'b' },
          { label: 'Label', value: 'c' },
        ]}
        value={value3}
        onChange={setValue3}
      />
      <SegmentedControl
        options={[
          { label: 'Label', value: 'x' },
          { label: 'Label', value: 'y' },
        ]}
        value={value2}
        onChange={setValue2}
      />
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

// Same data-fetch shape as Home's sessionDates (active language's
// sessions, refetched on mount only — this is a DS check, not a live
// screen). Falls back to an empty calendar if no language is active
// yet, instead of erroring. Calendar computes the grid itself now, so
// this just passes the raw dates through.
function CalendarDemo() {
  const [sessionDates, setSessionDates] = useState([])

  useEffect(() => {
    getAppSettings().then((settings) => {
      if (!settings.activeLanguageId) return
      getSessionsByLanguage(settings.activeLanguageId).then((sessions) =>
        setSessionDates(sessions.map((session) => session.date))
      )
    })
  }, [])

  return <Calendar sessionDates={sessionDates} />
}

function DurationInputDemo() {
  const refHMS = useRef(null)
  const refHM = useRef(null)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48, maxWidth: 343 }}>
      <div>
        <p style={{ color: 'var(--color-text-tertiary)', marginBottom: 12, fontSize: 12 }}>
          hasSeconds=true (duração)
        </p>
        <DurationInput ref={refHMS} hasSeconds initialValue={{ hours: 0, minutes: 20, seconds: 30 }} />
      </div>
      <div>
        <p style={{ color: 'var(--color-text-tertiary)', marginBottom: 12, fontSize: 12 }}>
          hasSeconds=false (horário)
        </p>
        <DurationInput ref={refHM} hasSeconds={false} initialValue={{ hours: 12, minutes: 34, seconds: 0 }} />
      </div>
      <div>
        <p style={{ color: 'var(--color-text-tertiary)', marginBottom: 12, fontSize: 12 }}>
          state=error
        </p>
        <DurationInput
          initialValue={{ hours: 12, minutes: 10, seconds: 0 }}
          errorMessage="O horário de término precisa ser depois do início (12:35)."
        />
      </div>
    </div>
  )
}

export default ComponentShowcase
