import { useState } from 'react'
import TopNav from '../components/TopNav'
import SearchCreateField from '../components/SearchCreateField'
import EditableListItem from '../components/EditableListItem'
import Button from '../components/Button'
import BottomSheet from '../components/BottomSheet'
import InputField from '../components/InputField'
import { ArrowBack, Add, Edit, Delete } from '@nine-thirty-five/material-symbols-react/outlined'
import './ManageSeries.css'

// Shared "manage catalog" screen for séries and filmes (kind picks the
// copy and whether rows are navigable). Séries rows open the episodes
// screen on tap; filmes have no episodes, so their rows are inert
// outside the edit/delete icons. The same rename BottomSheet is reused
// for "add new" (renameTarget.id is null in that case) rather than
// building a second near-identical sheet.
function ManageSeries({ kind = 'serie', items = [], onBack, onRename, onDelete, onCreate, onOpenEpisodes }) {
  const [query, setQuery] = useState('')
  const [renameTarget, setRenameTarget] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const isSerie = kind === 'serie'
  const label = isSerie ? 'série' : 'filme'
  const labelCap = isSerie ? 'Série' : 'Filme'

  function openRename(item) {
    setRenameTarget(item)
    setRenameValue(item.label)
  }

  function confirmRenameOrCreate() {
    const value = renameValue.trim()
    if (!value) return
    if (renameTarget.id) onRename(renameTarget.id, value)
    else onCreate(value)
    setRenameTarget(null)
  }

  function confirmDelete() {
    onDelete(deleteTarget.id)
    setDeleteTarget(null)
  }

  function handleQuickCreate(name) {
    onCreate(name)
    setQuery('')
  }

  const hasLinked = Boolean(deleteTarget?.sessionCount)
  const deleteDescription = isSerie
    ? hasLinked
      ? 'Essa série e todos os episódios serão removidos da sua lista e todas as suas sessões serão desvinculadas.'
      : 'Essa série e todos os episódios serão removidos da sua lista.'
    : hasLinked
      ? 'Esse filme será removido da sua lista e todas as suas sessões serão desvinculadas.'
      : 'Esse filme será removido da sua lista.'

  return (
    <main className="manage-series">
      <TopNav
        title={isSerie ? 'Gerenciar séries' : 'Gerenciar filmes'}
        hasDivider
        leadingIcon={
          <button type="button" className="top-nav-icon-reset" onClick={onBack} aria-label="Voltar">
            <ArrowBack />
          </button>
        }
      />
      <div className="manage-series-content">
        <SearchCreateField
          label={labelCap}
          placeholder={`Busque ou adicione ${isSerie ? 'uma série' : 'um filme'}`}
          value={query}
          onChange={setQuery}
          items={[]}
          createLabel={label}
          onCreate={handleQuickCreate}
        />

        <div className="manage-series-list">
          {items.map((item, index) => (
            <EditableListItem
              key={item.id}
              label={item.label}
              description={item.sessionCount ? `${item.sessionCount} sessões` : null}
              onClick={isSerie ? () => onOpenEpisodes(item) : null}
              editIcon={<Edit />}
              onEdit={() => openRename(item)}
              deleteIcon={<Delete />}
              onDelete={() => setDeleteTarget(item)}
              divider={index < items.length - 1}
            />
          ))}
        </div>

        <Button variant="outline" fullWidth leadingIcon={<Add />} onClick={() => openRename({ id: null, label: '' })}>
          {`Adicionar ${label}`}
        </Button>
      </div>

      <BottomSheet
        open={Boolean(renameTarget)}
        onClose={() => setRenameTarget(null)}
        title={renameTarget?.id ? `Editar ${label}` : `Adicionar ${label}`}
        contentCard={false}
        variant="modal"
        primaryButton={
          <Button fullWidth onClick={confirmRenameOrCreate}>
            Confirmar
          </Button>
        }
        secondaryButton={
          <Button variant="outline" fullWidth onClick={() => setRenameTarget(null)}>
            Cancelar
          </Button>
        }
      >
        <InputField
          label={`Nome ${isSerie ? 'da série' : 'do filme'}`}
          value={renameValue}
          onChange={(event) => setRenameValue(event.target.value)}
          trailingIcon={<Edit />}
        />
      </BottomSheet>

      <BottomSheet
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={`Remover "${deleteTarget?.label}"?`}
        description={deleteDescription}
        contentCard={false}
        primaryButton={
          <Button variant="destructive" fullWidth onClick={confirmDelete}>
            Remover mesmo assim
          </Button>
        }
        secondaryButton={
          <Button variant="ghost" fullWidth onClick={() => setDeleteTarget(null)}>
            Cancelar
          </Button>
        }
      />
    </main>
  )
}

export default ManageSeries
