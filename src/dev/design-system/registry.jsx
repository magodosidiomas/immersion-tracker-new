import { ButtonRow, SelectionChipDemo, SegmentedButtonDemo, SegmentedControlDemo, CheckboxDemo, BottomSheetDemo, CalendarDemo, DurationInputDemo } from './demoHelpers'
import Button from '../../components/Button'
import SelectableListItem from '../../components/SelectableListItem'
import ListItem from '../../components/ListItem'
import Dropdown from '../../components/Dropdown'
import TopNav from '../../components/TopNav'
import InputField from '../../components/InputField'
import Checkbox from '../../components/Checkbox'
import ResumeSessionBanner from '../../components/ResumeSessionBanner'
import Banner from '../../components/Banner'
import TimerWidget from '../../components/TimerWidget'
import NumericCard from '../../components/NumericCard'
import StreakItem from '../../components/StreakItem'
import StreakItemGroup from '../../components/StreakItemGroup'
import StreakCard from '../../components/StreakCard'
import DataCard from '../../components/DataCard'
import DonutCard from '../../components/DonutCard'
import SkillCard from '../../components/SkillCard'
import FormatCard from '../../components/FormatCard'
import ReceptionCard from '../../components/ReceptionCard'
import ProductionCard from '../../components/ProductionCard'
import StudyCard from '../../components/StudyCard'
import Alert from '../../components/Alert'
import CalendarItem from '../../components/CalendarItem'
import NavItem from '../../components/NavItem'
import BottomNav from '../../components/BottomNav'
import { Bolt, Check, ArrowBack, ViewInAr, Schedule, Home, BarChart } from '@nine-thirty-five/material-symbols-react/outlined'
import Flag from '../../components/Flag'

// Same groups/items shape DataCard (and the rest of the card family)
// expects — see the comment in DataCard.jsx. Shared across every card
// entry below instead of repeating it per component.
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

const DATA_CARD_CODE_NOTE = `// groups shape (shared by DataCard/DonutCard/SkillCard/FormatCard/
// ReceptionCard/ProductionCard/StudyCard):
// [{ key, label, colorRamp, totalSeconds, items: [{ key, label, totalSeconds }] }]`

const buttonSizes = ['lg', 'sm']

// Each entry: id (route + sort key), name, optional description (kept
// short — usage notes, not documentation prose), render() for the live
// preview, and code (the representative usage snippet shown below it).
// Sorted alphabetically by name at the bottom of this file, once, so
// every consumer (sidebar, mobile list, default selection) agrees.
const registry = [
  {
    id: 'alert',
    name: 'Alert',
    render: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 343 }}>
        <Alert type="error" title="Título" description="Descrição" />
        <Alert type="success" title="Título" description="Descrição" />
        <Alert type="alert" title="Título" description="Descrição" />
        <Alert type="info" title="Título" description="Descrição" />
      </div>
    ),
    code: `<Alert type="error" title="Título" description="Descrição" />
<Alert type="success" title="Título" description="Descrição" />
<Alert type="alert" title="Título" description="Descrição" />
<Alert type="info" title="Título" description="Descrição" />

// title or description alone both work — the other slot just hides
<Alert type="error" title="Só título, sem descrição" />
<Alert type="info" description="Só descrição, sem título" />`,
  },
  {
    id: 'banner',
    name: 'Banner',
    description: 'type=primary/secondary. Same icon/title/description/primaryButton/secondaryButton slot pattern as ResumeSessionBanner.',
    render: () => (
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
    ),
    code: `<Banner
  type="primary"
  icon={<Bolt />}
  title="Título"
  description="Aqui vai uma descrição"
  secondaryButton={<Button variant="outline" size="sm">Button label</Button>}
  primaryButton={<Button variant="primary" size="sm">Button label</Button>}
/>`,
  },
  {
    id: 'bottom-nav',
    name: 'BottomNav',
    description: 'items.length replaces hasItem1-5, same idea as SegmentedControl\u2019s options array.',
    render: () => (
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
    ),
    code: `<BottomNav
  items={[
    { label: 'Home', icon: <Home />, active: true },
    { label: 'Dashboard', icon: <BarChart /> },
    { label: 'Label', icon: <ViewInAr /> },
  ]}
/>`,
  },
  {
    id: 'bottom-sheet',
    name: 'BottomSheet',
    description: 'Mobile vs desktop is CSS-driven (resize the window to see it switch from a sheet to a centered modal) — no device prop.',
    render: () => <BottomSheetDemo />,
    code: `<BottomSheet
  open={open}
  onClose={() => setOpen(false)}
  title="Idioma"
  description="Escolha o idioma que você quer praticar."
  divider
  primaryButton={<Button variant="primary">Salvar</Button>}
  secondaryButton={<Button variant="ghost">Cancelar</Button>}
>
  {languages.map((language) => (
    <SelectableListItem key={language.name} label={language.name} selected={...} onClick={...} />
  ))}
</BottomSheet>`,
  },
  {
    id: 'button',
    name: 'Button',
    description: 'Hover any of these for real to check the hover state — no separate "hover" row needed.',
    render: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {buttonSizes.map((size) => (
          <div key={size}>
            <ButtonRow size={size} disabled={false} />
          </div>
        ))}
      </div>
    ),
    code: `<Button variant="primary" size="lg" leadingIcon={<Bolt />}>
  Button label
</Button>

// variant: primary / outline / ghost / warning / destructive /
//          destructive-outline / destructive-ghost
// size: lg / sm`,
  },
  {
    id: 'calendar',
    name: 'Calendar',
    description: '‹ › step one month at a time. Tap the label to jump straight to a year. sessionDates marks days with at least one session.',
    render: () => <CalendarDemo />,
    code: `<Calendar sessionDates={sessionDates} />
// sessionDates: array of 'YYYY-MM-DD' strings`,
  },
  {
    id: 'calendar-item',
    name: 'CalendarItem',
    description: 'All 7 documented states — base for Calendar, above.',
    render: () => (
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
    ),
    code: `<CalendarItem day={3} state="active" />
// state: default / active / today / disabled / weekend / month /
//        white-version-month / white-version-today`,
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    description: 'description is the only optional slot (null hides it) — checked toggled here for real.',
    render: () => (
      <div style={{ width: 343, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <CheckboxDemo />
        <Checkbox label="Label" description="Description" checked />
        <Checkbox label="Label only" />
      </div>
    ),
    code: `<Checkbox
  label="Label"
  description="Description"
  checked={checked}
  onClick={() => setChecked((c) => !c)}
/>`,
  },
  {
    id: 'data-card',
    name: 'DataCard',
    description: 'Generic groups/items (not categories/subcategories). Percent is always of the grand total, never of the parent group. Tap a group to expand.',
    render: () => <DataCard groups={DATA_CARD_SAMPLE} />,
    code: `${DATA_CARD_CODE_NOTE}\n\n<DataCard groups={groups} />`,
  },
  {
    id: 'donut-card',
    name: 'DonutCard',
    description: 'Same groups shape as DataCard — a ring of stacked arcs + a flat legend, no expand/collapse.',
    render: () => <DonutCard title="Visão geral" description="Como seu tempo se divide entre as categorias." groups={DATA_CARD_SAMPLE} />,
    code: `<DonutCard title="Visão geral" description="Como seu tempo se divide entre as categorias." groups={groups} />`,
  },
  {
    id: 'dropdown',
    name: 'Dropdown',
    description: 'hasSelection is the only designed variant — flag/label/secondaryLabel are plain slots.',
    render: () => (
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <Dropdown flag={<Flag code="us" />} label="Label" secondaryLabel="Label 2nd" />
        <Dropdown flag={<Flag code="us" />} label="Label" secondaryLabel="Label 2nd" selected />
        <Dropdown flag={<Flag code="us" />} label="Inglês" selected />
      </div>
    ),
    code: `<Dropdown flag={<Flag code="us" />} label="Inglês" selected onClick={...} />`,
  },
  {
    id: 'duration-input',
    name: 'DurationInput',
    description: 'Segment inputs for h:m:s or h:m. Uncontrolled internally; parent reads via ref.getValue(). editKey pattern remounts fresh on each sheet open.',
    render: () => <DurationInputDemo />,
    code: `const ref = useRef(null)

<DurationInput ref={ref} hasSeconds initialValue={{ hours: 0, minutes: 20, seconds: 30 }} />
<DurationInput hasSeconds={false} initialValue={{ hours: 12, minutes: 34, seconds: 0 }} />
<DurationInput errorMessage="O horário de término precisa ser depois do início (12:35)." />

// read the value on submit:
const value = ref.current.getValue()`,
  },
  {
    id: 'format-card',
    name: 'FormatCard',
    description: 'No SegmentedControl — Imersão vs. Imersão interativa at the category level.',
    render: () => <FormatCard groups={DATA_CARD_SAMPLE} />,
    code: `<FormatCard groups={groups} />`,
  },
  {
    id: 'input-field',
    name: 'InputField',
    description: 'isFilled isn\u2019t a prop — type into a field to see placeholder swap to the value style for real.',
    render: () => (
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <InputField label="Label" placeholder="Placeholder" hint="Hint text" leadingIcon={<Bolt />} trailingIcon={<Bolt />} />
        <InputField label="Label" placeholder="Placeholder" hint="Hint text" defaultValue="User input" leadingIcon={<Bolt />} trailingIcon={<Bolt />} />
      </div>
    ),
    code: `<InputField
  label="Label"
  placeholder="Placeholder"
  hint="Hint text"
  leadingIcon={<Bolt />}
  trailingIcon={<Bolt />}
/>`,
  },
  {
    id: 'list-item',
    name: 'ListItem',
    description: 'Same row chrome as SelectableListItem, no selected state — adds description/extraText slots instead.',
    render: () => (
      <div style={{ width: 324, display: 'flex', flexDirection: 'column' }}>
        <ListItem label="Label" description="Imersão · Escuta e leitura" extraText="1h 20" flag={<Flag code="us" />} leadingIcon={<Check />} trailingIcon={<Check />} />
        <ListItem label="Label" description="Imersão · Escuta e leitura" extraText="1h 20" divider flag={<Flag code="us" />} leadingIcon={<Check />} trailingIcon={<Check />} />
        <ListItem label="Label" description="Imersão · Escuta e leitura" extraText="1h 20" disabled flag={<Flag code="us" />} leadingIcon={<Check />} trailingIcon={<Check />} />
      </div>
    ),
    code: `<ListItem
  label="Label"
  description="Imersão · Escuta e leitura"
  extraText="1h 20"
  flag={<Flag code="us" />}
/>`,
  },
  {
    id: 'nav-item',
    name: 'NavItem',
    description: 'Atom for BottomNav. isActive maps to active — hover for real here too.',
    render: () => (
      <div style={{ display: 'flex', gap: 16 }}>
        <NavItem icon={<ViewInAr />} label="Label" />
        <NavItem icon={<ViewInAr />} label="Label" active />
      </div>
    ),
    code: `<NavItem icon={<ViewInAr />} label="Label" active />`,
  },
  {
    id: 'numeric-card',
    name: 'NumericCard',
    render: () => (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <NumericCard title="Sequência" number="12" />
        <NumericCard title="Total de horas" number="148" />
      </div>
    ),
    code: `<NumericCard title="Sequência" number="12" />`,
  },
  {
    id: 'production-card',
    name: 'ProductionCard',
    description: 'No SegmentedControl — just Produção\u2019s own subcategories (Fala/Escrita/Conversação/Aula), shaded from the pink ramp.',
    render: () => <ProductionCard groups={DATA_CARD_SAMPLE} />,
    code: `<ProductionCard groups={groups} />`,
  },
  {
    id: 'reception-card',
    name: 'ReceptionCard',
    description: 'No SegmentedControl — Recepção (Escuta+Leitura) vs. Produção\u2019s full total, each with a short description line.',
    render: () => <ReceptionCard groups={DATA_CARD_SAMPLE} />,
    code: `<ReceptionCard groups={groups} />`,
  },
  {
    id: 'resume-session-banner',
    name: 'ResumeSessionBanner',
    description: 'Purely presentational — icon/title/description and both buttons are passed in, same slot pattern as BottomSheet.',
    render: () => (
      <div style={{ width: 343 }}>
        <ResumeSessionBanner
          icon={<Schedule />}
          title="Sessão em andamento"
          description="Iniciada há 2h09min"
          secondaryButton={<Button variant="outline" size="sm">Descartar</Button>}
          primaryButton={<Button variant="primary" size="sm">Continuar</Button>}
        />
      </div>
    ),
    code: `<ResumeSessionBanner
  icon={<Schedule />}
  title="Sessão em andamento"
  description="Iniciada há 2h09min"
  secondaryButton={<Button variant="outline" size="sm">Descartar</Button>}
  primaryButton={<Button variant="primary" size="sm">Continuar</Button>}
/>`,
  },
  {
    id: 'segmented-button',
    name: 'SegmentedButton',
    description: 'Base of SegmentedControl — only the selected variant has a documented hover change.',
    render: () => <SegmentedButtonDemo />,
    code: `<SegmentedButton selected={selected === i} onClick={() => setSelected(i)} />`,
  },
  {
    id: 'segmented-control',
    name: 'SegmentedControl',
    description: 'options.length replaces hasThirdButton — 2 or 3 items both work. Fills its container\u2019s width by default.',
    render: () => <SegmentedControlDemo />,
    code: `<SegmentedControl
  options={[
    { label: 'Label', value: 'a' },
    { label: 'Label', value: 'b' },
  ]}
  value={value}
  onChange={setValue}
/>`,
  },
  {
    id: 'selectable-list-item',
    name: 'SelectableListItem',
    description: 'leadingIcon/trailingIcon/flag are plain slots — hover for real instead of a separate row.',
    render: () => (
      <div style={{ width: 324, display: 'flex', flexDirection: 'column' }}>
        <SelectableListItem label="Selected" selected flag={<Flag code="us" />} leadingIcon={<Check />} trailingIcon={<Check />} />
        <SelectableListItem label="Default" flag={<Flag code="us" />} leadingIcon={<Check />} trailingIcon={<Check />} />
        <SelectableListItem label="Disabled" disabled flag={<Flag code="us" />} leadingIcon={<Check />} trailingIcon={<Check />} />
        <SelectableListItem label="Default, with divider" divider flag={<Flag code="us" />} leadingIcon={<Check />} trailingIcon={<Check />} />
      </div>
    ),
    code: `<SelectableListItem
  label="Inglês"
  selected={language === selected}
  flag={<Flag code="us" />}
  trailingIcon={selected ? <Check /> : null}
  onClick={() => setSelected(language)}
/>`,
  },
  {
    id: 'selection-chip',
    name: 'SelectionChip',
    description: 'selected toggled here for real. hasLeadingIcon/hasTrailingIcon are booleans (both default true).',
    render: () => <SelectionChipDemo />,
    code: `<SelectionChip selected={selected} onClick={() => setSelected((s) => !s)} />
<SelectionChip label="No icons" hasLeadingIcon={false} hasTrailingIcon={false} />`,
  },
  {
    id: 'skill-card',
    name: 'SkillCard',
    description: 'No SegmentedControl — Simultâneo/Escuta/Leitura summed across Imersão and Imersão interativa.',
    render: () => <SkillCard groups={DATA_CARD_SAMPLE} />,
    code: `<SkillCard groups={groups} />`,
  },
  {
    id: 'streak-card',
    name: 'StreakCard',
    description: 'Header (🔥 + title/value) over a StreakItemGroup. Visual component only for now.',
    render: () => <StreakCard />,
    code: `<StreakCard />`,
  },
  {
    id: 'streak-item',
    name: 'StreakItem',
    description: 'isActive × isToday, 3 documented states. Plain div, purely presentational.',
    render: () => (
      <div style={{ display: 'flex', gap: 16 }}>
        <StreakItem weekday="S" />
        <StreakItem weekday="S" isActive />
        <StreakItem weekday="S" isToday />
      </div>
    ),
    code: `<StreakItem weekday="S" isActive />`,
  },
  {
    id: 'streak-item-group',
    name: 'StreakItemGroup',
    description: 'Row of StreakItem. Visual component only for now — days prop not finalized against real streak logic yet.',
    render: () => <StreakItemGroup />,
    code: `<StreakItemGroup />`,
  },
  {
    id: 'study-card',
    name: 'StudyCard',
    description: 'No SegmentedControl — just Estudo\u2019s own subcategories (Vocabulário/Gramática/Pronúncia), shaded from the amber ramp.',
    render: () => <StudyCard groups={DATA_CARD_SAMPLE} />,
    code: `<StudyCard groups={groups} />`,
  },
  {
    id: 'timer-widget',
    name: 'TimerWidget',
    description: 'Same component for Home\u2019s in-place card and the floating mini-player. onToggle stops propagation so it doesn\u2019t also fire onClick.',
    render: () => (
      <div style={{ width: 343, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TimerWidget elapsedLabel="00:01" running />
        <TimerWidget elapsedLabel="00:01" category="Imersão" subcategory="Simultâneo" running />
        <TimerWidget elapsedLabel="00:01" running={false} />
      </div>
    ),
    code: `<TimerWidget elapsedLabel="00:01" category="Imersão" subcategory="Simultâneo" running onToggle={...} onClick={...} />`,
  },
  {
    id: 'top-nav',
    name: 'TopNav',
    description: 'leadingIcon/flag and trailingLeft/Mid/Right are plain slots — passing null hides them.',
    render: () => (
      <div style={{ width: 375, display: 'flex', flexDirection: 'column' }}>
        <TopNav title="Page title" leadingIcon={<ArrowBack />} trailingLeft={<ViewInAr />} trailingMid={<ViewInAr />} trailingRight={<ViewInAr />} />
        <TopNav title="Inglês" flag={<Flag code="us" />} hasDropdown hasDivider trailingLeft={<ViewInAr />} />
      </div>
    ),
    code: `<TopNav
  leadingIcon={
    <button type="button" className="top-nav-icon-reset" onClick={onBack} aria-label="Voltar">
      <ArrowBack />
    </button>
  }
  title="Page title"
  hasDivider
/>`,
  },
]

registry.sort((a, b) => a.name.localeCompare(b.name))

export default registry
