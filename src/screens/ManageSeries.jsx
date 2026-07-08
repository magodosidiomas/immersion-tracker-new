import { useEffect, useState } from 'react'
import { getAppSettings, getContentCatalog, addCatalogEntry, renameCatalogEntry, deleteCatalogEntry } from '../db'
import TopNav from '../components/TopNav'
import SearchCreateField from '../components/SearchCreateField'
import EditableListItem from '../components/EditableListItem'
import Button from '../components/Button'
import BottomSheet from '../components/BottomSheet'
import InputField from '../components/InputField'
import EmptyState from '../components/EmptyState'
import { ArrowBack, Add, Edit, Delete, Theaters, Movie } from '@nine-thirty-five/material-symbols-react/outlined'
import './ManageSeries.css'

// Shared "manage catalog" screen for séries and filmes (kind picks the
// copy and navigation). Séries rows open the episodes screen — pencil
// renames, since there's still a name to edit at that layer. Filmes
// skip the episódios layer entirely: both tap and pencil go straight
// to the "Sessões" screen for that filme (there's nothing to rename
// mid-flow, only via "+ Adicionar filme"'s own name entry). The same
// rename BottomSheet is reused for "add new" (renameTarget.id is null
// in that case) rather than building a second near-identical sheet.
//
// Self-fetches its own languageId + catalog (same convention as
// Home/Statistics/Library) — only navigation callbacks come from
// whoever renders this screen.
function ManageSeries({ kind = 'serie', onBack, onOpenEpisodes, onOpenSessions }) {
  const [languageId, setLanguageId] = useState(null)
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [renameTarget, setRenameTarget] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const isSerie = kind === 'serie'
  const label = isSerie ? 'série' : 'filme'
  const labelCap = isSerie ? 'Série' : 'Filme'

  useEffect(() => {
    getAppSettings().then((settings) => setLanguageId(settings.activeLanguageId))
  }, [])

  function refresh() {
    if (!languageId) return
    getContentCatalog(languageId, kind).then((entries) =>
      setItems(entries.map((entry) => ({ id: entry.id, label: entry.name, sessionCount: entry.sessionCount }))),
    )
  }

  useEffect(refresh, [languageId, kind])

  function openRename(item) {
    setRenameTarget(item)
    setRenameValue(item.label)
  }

  async function confirmRenameOrCreate() {
    const value = renameValue.trim()
    if (!value) return
    if (renameTarget.id) await renameCatalogEntry(renameTarget.id, value)
    else await addCatalogEntry(languageId, kind, value)
    setRenameTarget(null)
    refresh()
  }

  async function confirmDelete() {
    await deleteCatalogEntry(deleteTarget.id)
    setDeleteTarget(null)
    refresh()
  }

  async function handleQuickCreate(name) {
    await addCatalogEntry(languageId, kind, name)
    setQuery('')
    refresh()
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
      {items.length === 0 ? (
        <div className="manage-series-empty">
          <EmptyState
            icon={isSerie ? <Theaters /> : <Movie />}
            title={isSerie ? 'Nenhuma série adicionada' : 'Nenhum filme adicionado'}
            description={`Toque no botão abaixo para adicionar sua primeira ${label}.`}
            buttonLabel={`Adicionar ${label}`}
            buttonIcon={<Add />}
            onButtonClick={() => openRename({ id: null, label: '' })}
          />
        </div>
      ) : (
        <>
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
                  onClick={isSerie ? () => onOpenEpisodes(item) : () => onOpenSessions(item)}
                  editIcon={<Edit />}
                  onEdit={isSerie ? () => openRename(item) : () => onOpenSessions(item)}
                  deleteIcon={<Delete />}
                  onDelete={() => setDeleteTarget(item)}
                  divider={index < items.length - 1}
                />
              ))}
            </div>
          </div>

          <div className="manage-series-footer">
            <Button variant="outline" fullWidth leadingIcon={<Add />} onClick={() => openRename({ id: null, label: '' })}>
              {`Adicionar ${label}`}
            </Button>
          </div>
        </>
      )}

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
