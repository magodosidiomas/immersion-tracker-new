import { useEffect, useState } from 'react'
import { getLanguages, getSessionsByLanguage, removeLanguage } from '../db'
import TopNav from '../components/TopNav'
import Button from '../components/Button'
import BottomSheet from '../components/BottomSheet'
import InputField from '../components/InputField'
import { ArrowBack, Add, DragIndicator, Delete } from '@nine-thirty-five/material-symbols-react/outlined'
import Flag from '../components/Flag'
import './ManageLanguages.css'

// Phrase the user must type to confirm a destructive delete — only
// required when the language actually has history to lose (see
// hasSessions below). Matches the Figma copy verbatim.
const CONFIRM_PHRASE = 'QUERO REMOVER'

// Lives inside Settings in the nav hierarchy — back always returns to
// Settings, even when this screen was opened via Home's dropdown
// shortcut (see Home.jsx's BottomSheet primaryButton). Tapping a row's
// body isn't designed yet, so rows stay read-only there; the drag
// handle is rendered for visual fidelity but isn't wired to actual
// reordering yet (a separate, not-yet-scoped feature). "Adicionar
// idiomas" opens AddLanguages.
function ManageLanguages({ onBack, onOpenAddLanguages }) {
  const [languages, setLanguages] = useState([])
  // The language pending deletion, plus whether it has sessions —
  // decided once, when the trash icon is tapped, rather than re-derived
  // on every render, since it's what picks which confirmation variant
  // (typed phrase vs plain confirm) the sheet below shows.
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [confirmText, setConfirmText] = useState('')

  useEffect(() => {
    getLanguages().then(setLanguages)
  }, [])

  async function handleDeleteClick(language) {
    const sessions = await getSessionsByLanguage(language.id)
    setDeleteTarget({ language, hasSessions: sessions.length > 0 })
  }

  function closeDeleteSheet() {
    setDeleteTarget(null)
    setConfirmText('')
  }

  async function handleConfirmDelete() {
    await removeLanguage(deleteTarget.language.id)
    setLanguages(await getLanguages())
    closeDeleteSheet()
  }

  const canDelete = deleteTarget && (!deleteTarget.hasSessions || confirmText.trim() === CONFIRM_PHRASE)

  return (
    <main className="manage-languages">
      <TopNav
        title="Gerenciar idiomas"
        hasDivider
        leadingIcon={
          <button type="button" className="top-nav-icon-reset" onClick={onBack} aria-label="Voltar">
            <ArrowBack />
          </button>
        }
      />
      <div className="manage-languages-content">
        <p className="manage-languages-label">Meus idiomas</p>
        <div className="manage-languages-card">
          {languages.map((language, index) => (
            <div key={language.id} className="manage-languages-row">
              <span className="manage-languages-row-content">
                <span className="manage-languages-drag-handle" aria-hidden="true">
                  <DragIndicator />
                </span>
                <span className="manage-languages-flag">
                  <Flag code={language.flagCode} />
                </span>
                <span className="manage-languages-row-label">{language.name}</span>
                <button
                  type="button"
                  className="top-nav-icon-reset manage-languages-delete"
                  onClick={() => handleDeleteClick(language)}
                  aria-label={`Remover ${language.name}`}
                >
                  <Delete />
                </button>
              </span>
              {index < languages.length - 1 && <span className="manage-languages-row-divider" />}
            </div>
          ))}
        </div>
        <div className="manage-languages-footer">
          <Button variant="outline" leadingIcon={<Add />} fullWidth onClick={onOpenAddLanguages}>
            Adicionar idiomas
          </Button>
        </div>
      </div>
      <BottomSheet
        open={Boolean(deleteTarget)}
        onClose={closeDeleteSheet}
        title={deleteTarget ? `Remover ${deleteTarget.language.name}?` : null}
        description={
          !deleteTarget
            ? null
            : deleteTarget.hasSessions
              ? 'Todo o histórico desse idioma será apagado. Essa ação não pode ser desfeita.'
              : 'Esse idioma será removido da sua lista.'
        }
        contentCard={false}
        primaryButton={
          <Button variant="destructive" fullWidth disabled={!canDelete} onClick={handleConfirmDelete}>
            Remover
          </Button>
        }
        secondaryButton={
          <Button variant="ghost" fullWidth onClick={closeDeleteSheet}>
            Cancelar
          </Button>
        }
      >
        {deleteTarget?.hasSessions && (
          <InputField
            label={
              <>
                Digite <span className="manage-languages-confirm-phrase">{CONFIRM_PHRASE}</span> pra confirmar
              </>
            }
            placeholder="Escreva o texto acima"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
          />
        )}
      </BottomSheet>
    </main>
  )
}

export default ManageLanguages
