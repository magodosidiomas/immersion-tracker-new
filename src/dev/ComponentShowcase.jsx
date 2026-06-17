import Button from '../components/Button'
import { Bolt } from '@nine-thirty-five/material-symbols-react/outlined'

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
    </main>
  )
}

export default ComponentShowcase
