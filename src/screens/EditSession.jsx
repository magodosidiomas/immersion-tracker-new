import { useState } from 'react'
import TopNav from '../components/TopNav'
import Button from '../components/Button'
import BottomSheet from '../components/BottomSheet'
import SessionForm from '../components/SessionForm'
import { ArrowBack, Delete } from '@nine-thirty-five/material-symbols-react/outlined'
import { updateSession, deleteSession } from '../db'
import './EditSession.css'

// Opened by tapping a row in Home's history list. Reuses the exact
// same form as NewSession's "finish" phase (SessionForm) — only the
// save target differs: this overwrites the existing record instead of
// creating one, and offers delete instead of discard. The language
// can't be changed here; sessions don't move between languages.
function EditSession({ session, onBack, onSaved }) {
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function handleSave(fields) {
    if (saving) return
    setSaving(true)
    await updateSession({ ...session, ...fields })
    onSaved()
  }

  async function handleDelete() {
    await deleteSession(session.id)
    onSaved()
  }

  return (
    <main className="edit-session">
      <TopNav
        title="Editar sessão"
        hasDivider
        leadingIcon={
          <button type="button" className="top-nav-icon-reset" onClick={onBack} aria-label="Voltar">
            <ArrowBack />
          </button>
        }
      />
      <SessionForm
        initialStartAt={new Date(session.startTime)}
        initialEndAt={new Date(session.endTime)}
        initialDurationSeconds={session.durationSeconds}
        initialDate={session.date}
        initialCategory={session.category}
        initialSubcategory={session.subcategory}
        onSave={handleSave}
        saving={saving}
        secondaryButton={
          <Button variant="destructive-ghost" leadingIcon={<Delete />} fullWidth onClick={() => setConfirmOpen(true)}>
            Excluir sessão
          </Button>
        }
      />
      <BottomSheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Excluir sessão?"
        description="Essa sessão será apagada permanentemente."
        contentCard={false}
        primaryButton={
          <Button variant="destructive" fullWidth onClick={handleDelete}>
            Excluir
          </Button>
        }
        secondaryButton={
          <Button variant="ghost" fullWidth onClick={() => setConfirmOpen(false)}>
            Cancelar
          </Button>
        }
      />
    </main>
  )
}

export default EditSession
