import { useEffect, useState } from 'react'
import TopNav from '../components/TopNav'
import Button from '../components/Button'
import BottomSheet from '../components/BottomSheet'
import Modal from '../components/Modal'
import SessionForm from '../components/SessionForm'
import { ArrowBack, Delete } from '@nine-thirty-five/material-symbols-react/outlined'
import { updateSession, deleteSession, getContentsForSession, linkSessionContent, unlinkSessionContent } from '../db'
import './EditSession.css'

// Opened by tapping a row in Home's history list. Reuses the exact
// same form as NewSession's "finish" phase (SessionForm) — only the
// save target differs: this overwrites the existing record instead of
// creating one, and offers delete instead of discard. The language
// can't be changed here; sessions don't move between languages.
//
// Unlike NewSession (no sessionId until Salvar), this session already
// exists — so linking/unlinking content writes to sessionContents
// immediately instead of staging a pending list.
function EditSession({ session, isDesktop = false, onBack, onSaved, onOpenLinkContent }) {
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [linkedContents, setLinkedContents] = useState([])

  function refreshContents() {
    getContentsForSession(session.id).then(setLinkedContents)
  }

  useEffect(refreshContents, [session.id])

  function handleAddContent() {
    onOpenLinkContent(async (item) => {
      await linkSessionContent(session.id, item.id)
      refreshContents()
    })
  }

  async function handleRemoveContent(contentId) {
    await unlinkSessionContent(session.id, contentId)
    refreshContents()
  }

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

  const formAndSheets = (
    <>
      <SessionForm
        initialStartAt={new Date(session.startTime)}
        initialDurationSeconds={session.durationSeconds}
        initialCategory={session.category}
        initialSubcategory={session.subcategory}
        linkedContents={linkedContents}
        onAddContent={handleAddContent}
        onRemoveContent={handleRemoveContent}
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
    </>
  )

  if (isDesktop) {
    return (
      <Modal
        title="Editar sessão"
        leadingIcon={<ArrowBack />}
        onLeadingClick={onBack}
        onClose={onBack}
        flushContent
        className="finish-session-modal"
        width={433}
        height={640}
      >
        {formAndSheets}
      </Modal>
    )
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
      {formAndSheets}
    </main>
  )
}

export default EditSession
