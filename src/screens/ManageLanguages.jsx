import { useEffect, useState } from 'react'
import { getLanguages, getSessionsByLanguage, removeLanguage, reorderLanguages } from '../db'
import TopNav from '../components/TopNav'
import Button from '../components/Button'
import BottomSheet from '../components/BottomSheet'
import InputField from '../components/InputField'
import { ArrowBack, Add, DragIndicator, Delete } from '@nine-thirty-five/material-symbols-react/outlined'
import Flag from '../components/Flag'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import './ManageLanguages.css'

// Phrase the user must type to confirm a destructive delete — only
// required when the language actually has history to lose (see
// hasSessions below). Matches the Figma copy verbatim.
const CONFIRM_PHRASE = 'QUERO REMOVER'

// One row, draggable by its handle only — onDelete/the row body stay
// independently clickable, which is exactly why this couldn't stay a
// SelectableListItem (a single whole-row button can't also contain a
// drag handle and a delete button without nesting interactive
// elements). useSortable's `listeners`/`attributes` go on the handle
// via setActivatorNodeRef, not on the row itself, so dragging only
// starts from the handle — tapping the flag/name/delete still works
// normally mid-list.
function LanguageRow({ language, divider, onDelete }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: language.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="manage-languages-row" data-dragging={isDragging}>
      <span className="manage-languages-row-content">
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="top-nav-icon-reset manage-languages-drag-handle"
          aria-label={`Reordenar ${language.name}`}
          {...attributes}
          {...listeners}
        >
          <DragIndicator />
        </button>
        <span className="manage-languages-flag">
          <Flag code={language.flagCode} />
        </span>
        <span className="manage-languages-row-label">{language.name}</span>
        <button
          type="button"
          className="manage-languages-delete"
          onClick={() => onDelete(language)}
          aria-label={`Remover ${language.name}`}
        >
          <Delete />
        </button>
      </span>
      {divider && <span className="manage-languages-row-divider" />}
    </div>
  )
}

// Lives inside Settings in the nav hierarchy — back always returns to
// Settings, even when this screen was opened via Home's dropdown
// shortcut (see Home.jsx's BottomSheet primaryButton). "Adicionar
// idiomas" opens AddLanguages.
function ManageLanguages({ onBack, onOpenAddLanguages }) {
  const [languages, setLanguages] = useState([])
  // The language pending deletion, plus whether it has sessions —
  // decided once, when the trash icon is tapped, rather than re-derived
  // on every render, since it's what picks which confirmation variant
  // (typed phrase vs plain confirm) the sheet below shows.
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [confirmText, setConfirmText] = useState('')

  // PointerSensor (mouse + touch) needs a small movement threshold so a
  // tap-and-release on the handle doesn't get mistaken for a drag.
  // KeyboardSensor makes the handle reorderable with arrow keys once
  // focused, for anyone who can't drag.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

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

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = languages.findIndex((language) => language.id === active.id)
    const newIndex = languages.findIndex((language) => language.id === over.id)
    const next = arrayMove(languages, oldIndex, newIndex)
    setLanguages(next)
    reorderLanguages(next.map((language) => language.id))
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
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={languages.map((language) => language.id)} strategy={verticalListSortingStrategy}>
              {languages.map((language, index) => (
                <LanguageRow
                  key={language.id}
                  language={language}
                  divider={index < languages.length - 1}
                  onDelete={handleDeleteClick}
                />
              ))}
            </SortableContext>
          </DndContext>
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
