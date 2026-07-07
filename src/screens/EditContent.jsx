import { useState } from 'react'
import TopNav from '../components/TopNav'
import Button from '../components/Button'
import BottomSheet from '../components/BottomSheet'
import ContentForm from '../components/ContentForm'
import { ArrowBack, Delete } from '@nine-thirty-five/material-symbols-react/outlined'
import './EditContent.css'

// Opened either from Biblioteca's "+" (new content) or by tapping an
// existing content item (edit). `content` is null for the new-content
// case — same isNew-by-presence convention as elsewhere in the app.
// Séries/filmes search state (relatedItems/relatedQuery/etc.) is
// lifted to whoever renders this screen, since it needs a live query
// against the user's saved séries/filmes — this component only wires
// the props through to ContentForm.
function EditContent({
  content = null,
  linkedSessions = [],
  onAddSession,
  relatedItems = [],
  relatedQuery = '',
  onRelatedQueryChange,
  onSelectRelated,
  onCreateRelated,
  onManageRelated,
  existingContents = [],
  onBack,
  onSave,
  onDelete,
}) {
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isNew = !content

  async function handleSave(fields) {
    if (saving) return
    setSaving(true)
    await onSave(isNew ? fields : { ...content, ...fields })
  }

  async function handleDelete() {
    await onDelete(content.id)
  }

  return (
    <main className="edit-content">
      <TopNav
        title={isNew ? 'Novo conteúdo' : 'Editar conteúdo'}
        hasDivider
        leadingIcon={
          <button type="button" className="top-nav-icon-reset" onClick={onBack} aria-label="Voltar">
            <ArrowBack />
          </button>
        }
      />
      <ContentForm
        initialType={content?.type}
        initialLink={content?.link}
        initialTitle={content?.title}
        initialAuthor={content?.author}
        initialThumbnail={content?.thumbnail}
        initialSeason={content?.season}
        initialEpisode={content?.episode}
        linkedSessions={linkedSessions}
        onAddSession={onAddSession}
        relatedItems={relatedItems}
        relatedQuery={relatedQuery}
        onRelatedQueryChange={onRelatedQueryChange}
        onSelectRelated={onSelectRelated}
        onCreateRelated={onCreateRelated}
        onManageRelated={onManageRelated}
        existingContents={existingContents}
        excludeId={content?.id}
        onSave={handleSave}
        saving={saving}
        secondaryButton={
          !isNew && (
            <Button variant="destructive-ghost" leadingIcon={<Delete />} fullWidth onClick={() => setConfirmOpen(true)}>
              Excluir conteúdo
            </Button>
          )
        }
      />
      <BottomSheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Excluir conteúdo?"
        description="Esse conteúdo será apagado permanentemente."
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

export default EditContent
