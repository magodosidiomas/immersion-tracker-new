import { useEffect, useState } from 'react'
import { getEpisodes, addEpisode, deleteEpisode } from '../db'
import TopNav from '../components/TopNav'
import SelectionChip from '../components/SelectionChip'
import EditableListItem from '../components/EditableListItem'
import Button from '../components/Button'
import BottomSheet from '../components/BottomSheet'
import InputField from '../components/InputField'
import EmptyState from '../components/EmptyState'
import { ArrowBack, Add, Edit, Delete, PlaylistPlay } from '@nine-thirty-five/material-symbols-react/outlined'
import './ManageEpisodes.css'

// Episode directory for one série — season filter chips up top, then
// episodes grouped by season. Unlike ManageSeries' rows, the pencil
// here navigates to the episode's own detail screen (sessões
// vinculadas) rather than opening a rename sheet — there's no name to
// rename, just the auto-generated "T# E#" title.
function ManageEpisodes({ catalogId, seriesName = '', onBack, onOpenEpisode, embedded }) {
  const [episodes, setEpisodes] = useState([])
  const [selectedSeason, setSelectedSeason] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createSeason, setCreateSeason] = useState('')
  const [createEpisode, setCreateEpisode] = useState('')

  function refresh() {
    if (!catalogId) return
    getEpisodes(catalogId).then(setEpisodes)
  }

  useEffect(refresh, [catalogId])

  const seasons = [...new Set(episodes.map((ep) => ep.season))].sort((a, b) => a - b)
  const visible = selectedSeason === 'all' ? episodes : episodes.filter((ep) => ep.season === selectedSeason)

  const grouped = seasons
    .filter((season) => selectedSeason === 'all' || season === selectedSeason)
    .map((season) => ({
      season,
      items: visible.filter((ep) => ep.season === season).sort((a, b) => a.episode - b.episode),
    }))

  async function confirmDelete() {
    await deleteEpisode(deleteTarget.id)
    setDeleteTarget(null)
    refresh()
  }

  async function confirmCreate() {
    const season = Number(createSeason)
    const episode = Number(createEpisode)
    if (!season || !episode) return
    await addEpisode(catalogId, season, episode)
    setCreateOpen(false)
    setCreateSeason('')
    setCreateEpisode('')
    refresh()
  }

  return (
    <main className="manage-episodes" data-embedded={embedded || undefined}>
      {!embedded && (
        <TopNav
          title={`Episódios - ${seriesName}`}
          hasDivider
          leadingIcon={
            <button type="button" className="top-nav-icon-reset" onClick={onBack} aria-label="Voltar">
              <ArrowBack />
            </button>
          }
        />
      )}
      <div className="manage-episodes-content">
        {episodes.length === 0 ? (
          <div className="manage-episodes-empty">
            <EmptyState
              icon={<PlaylistPlay />}
              title="Nenhum episódio adicionado"
              description="Toque no botão abaixo para adicionar o primeiro episódio."
              buttonLabel="Adicionar episódio"
              buttonIcon={<Add />}
              onButtonClick={() => setCreateOpen(true)}
            />
          </div>
        ) : (
          <>
            <div className="manage-episodes-field-group">
              <span className="manage-episodes-label">Temporadas</span>
              <div className="manage-episodes-chips">
                <SelectionChip
                  label="Todas"
                  hasLeadingIcon={false}
                  hasTrailingIcon={false}
                  selected={selectedSeason === 'all'}
                  onClick={() => setSelectedSeason('all')}
                />
                {seasons.map((season) => (
                  <SelectionChip
                    key={season}
                    label={`T${season}`}
                    hasLeadingIcon={false}
                    hasTrailingIcon={false}
                    selected={selectedSeason === season}
                    onClick={() => setSelectedSeason(season)}
                  />
                ))}
              </div>
            </div>

            {grouped.map(({ season, items }) => (
              <div key={season} className="manage-episodes-field-group">
                <span className="manage-episodes-label">Temporada {season}</span>
                <div className="manage-episodes-list">
                  {items.map((ep, index) => (
                    <EditableListItem
                      key={ep.id}
                      label={`T${ep.season} · E${ep.episode}`}
                      description={ep.sessionCount ? `${ep.sessionCount} sessões` : null}
                      editIcon={<Edit />}
                      onEdit={() => onOpenEpisode(ep)}
                      deleteIcon={<Delete />}
                      onDelete={() => setDeleteTarget(ep)}
                      divider={index < items.length - 1}
                    />
                  ))}
                </div>
              </div>
            ))}

            <Button variant="outline" fullWidth leadingIcon={<Add />} onClick={() => setCreateOpen(true)}>
              Adicionar episódio
            </Button>
          </>
        )}
      </div>

      <BottomSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Adicionar episódio"
        contentCard={false}
        variant="modal"
        primaryButton={
          <Button fullWidth onClick={confirmCreate}>
            Confirmar
          </Button>
        }
        secondaryButton={
          <Button variant="outline" fullWidth onClick={() => setCreateOpen(false)}>
            Cancelar
          </Button>
        }
      >
        <div className="manage-episodes-row">
          <InputField
            label="Temporada"
            type="number"
            min={1}
            value={createSeason}
            onChange={(event) => setCreateSeason(event.target.value)}
          />
          <InputField
            label="Episódio"
            type="number"
            min={1}
            value={createEpisode}
            onChange={(event) => setCreateEpisode(event.target.value)}
          />
        </div>
      </BottomSheet>

      <BottomSheet
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={`Remover "${seriesName} T${deleteTarget?.season} · E${deleteTarget?.episode}"?`}
        description="Esse episódio será removido e todas as suas sessões serão desvinculadas."
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

export default ManageEpisodes
