import { useState } from 'react'
import Button from '../components/Button'
import SelectableListItem from '../components/SelectableListItem'
import Dropdown from '../components/Dropdown'
import TopNav from '../components/TopNav'
import BottomSheet from '../components/BottomSheet'
import { AVAILABLE_LANGUAGES } from '../data/availableLanguages'
import { Bolt, Check, ArrowBack, ViewInAr } from '@nine-thirty-five/material-symbols-react/outlined'

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
        Check and a flag emoji, but neither is hardcoded into the component.
      </p>
      <div style={{ width: 324, display: 'flex', flexDirection: 'column' }}>
        <SelectableListItem label="Selected" selected flag="🇺🇸" leadingIcon={<Check />} trailingIcon={<Check />} />
        <SelectableListItem label="Default" flag="🇺🇸" leadingIcon={<Check />} trailingIcon={<Check />} />
        <SelectableListItem label="Disabled" disabled flag="🇺🇸" leadingIcon={<Check />} trailingIcon={<Check />} />
        <SelectableListItem label="Default, with divider" divider flag="🇺🇸" leadingIcon={<Check />} trailingIcon={<Check />} />
        <SelectableListItem label="Selected, with divider" selected divider flag="🇺🇸" leadingIcon={<Check />} trailingIcon={<Check />} />
        <SelectableListItem label="Disabled, with divider" disabled divider flag="🇺🇸" leadingIcon={<Check />} trailingIcon={<Check />} />
      </div>

      <h1 style={{ color: 'var(--color-text-primary)', marginTop: 48 }}>Dropdown</h1>
      <p style={{ color: 'var(--color-text-tertiary)' }}>
        hasSelection is the only designed variant — flag/label/secondaryLabel
        are plain slots, same idea as the components above.
      </p>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <Dropdown flag="🇺🇸" label="Label" secondaryLabel="Label 2nd" />
        <Dropdown flag="🇺🇸" label="Label" secondaryLabel="Label 2nd" selected />
        <Dropdown flag="🇺🇸" label="Inglês" selected />
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
          flag="🇺🇸"
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
    </main>
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
        <Dropdown flag="🇺🇸" label="Inglês" selected onClick={() => setOpen(true)} />
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
            flag={language.flagEmoji}
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
