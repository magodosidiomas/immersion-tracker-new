import { useEffect, useState } from 'react'
import { getAppSettings, getContentCatalog, addCatalogEntry, renameCatalogEntry, deleteCatalogEntry } from '../db'
import TopNav from '../components/TopNav'
import SearchCreateField from '../components/SearchCreateField'
import SelectableListItem from '../components/SelectableListItem'
import EditableListItem from '../components/EditableListItem'
import Button from '../components/Button'
import BottomSheet from '../components/BottomSheet'
import InputField from '../components/InputField'
import EmptyState from '../components/EmptyState'
import { normalizeForCompare } from '../utils/text'
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
// onOpenEpisodes is optional: when this screen is opened from inside
// "Adicionar conteúdo" (picking/creating the série being added), the
// caller omits it — drilling into that série's other episodes while
// you're literally in the middle of creating one is confusing, so
// séries rows there are edit/delete-only (rename still works, tap just
// doesn't navigate). Only the Configurações entry point wires
// onOpenEpisodes, where full drilldown makes sense. Filmes'
// onOpenSessions isn't restricted the same way, since it's the only
// way to rename a filme in the first place (see the row below).
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
  const [renameError, setRenameError] = useState(null)
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
    setRenameError(null)
  }

  function isDuplicateName(value, excludeId) {
    const normalized = normalizeForCompare(value)
    return items.some((item) => item.id !== excludeId && normalizeForCompare(item.label) === normalized)
  }

  async function confirmRenameOrCreate() {
    const value = renameValue.trim()
    if (!value) return
    if (isDuplicateName(value, renameTarget.id)) {
      setRenameError(`Já existe ${isSerie ? 'uma série' : 'um filme'} com esse nome.`)
      return
    }
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
    if (isDuplicateName(name, null)) return
    await addCatalogEntry(languageId, kind, name)
    setQuery('')
    refresh()
  }

  const trimmedQuery = query.trim()
  const filteredItems = trimmedQuery
    ? items.filter((item) => normalizeForCompare(item.label).includes(normalizeForCompare(query)))
    : items
  const hasExactMatch = trimmedQuery
    ? items.some((item) => normalizeForCompare(item.label) === normalizeForCompare(trimmedQuery))
    : true

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
              variant="filter"
              label={labelCap}
              placeholder={`Busque ou adicione ${isSerie ? 'uma série' : 'um filme'}`}
              value={query}
              onChange={setQuery}
            />

            <div className="manage-series-list">
              {filteredItems.length === 0 && !trimmedQuery ? (
                <p className="manage-series-no-results">Nenhum resultado encontrado.</p>
              ) : (
                filteredItems.map((item, index) => (
                  <EditableListItem
                    key={item.id}
                    label={item.label}
                    description={item.sessionCount ? `${item.sessionCount} sessões` : null}
                    onClick={isSerie ? (onOpenEpisodes ? () => onOpenEpisodes(item) : undefined) : () => onOpenSessions(item)}
                    editIcon={<Edit />}
                    onEdit={isSerie ? () => openRename(item) : () => onOpenSessions(item)}
                    deleteIcon={<Delete />}
                    onDelete={() => setDeleteTarget(item)}
                    divider={index < filteredItems.length - 1}
                  />
                ))
              )}
              {trimmedQuery && !hasExactMatch && (
                <SelectableListItem
                  label={`Adicionar ${label}: "${trimmedQuery}"`}
                  leadingIcon={<Add />}
                  data-variant="create"
                  onClick={() => handleQuickCreate(trimmedQuery)}
                />
              )}
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
          onChange={(event) => {
            setRenameValue(event.target.value)
            setRenameError(null)
          }}
          trailingIcon={<Edit />}
          error={renameError}
          autoFocus
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
