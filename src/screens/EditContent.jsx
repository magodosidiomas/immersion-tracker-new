import { useEffect, useState } from 'react'
import {
  getAppSettings,
  getContent,
  getContentsByLanguage,
  getContentCatalog,
  createContent,
  updateContent,
  deleteContent,
  saveSerieContent,
  getFilmeContent,
  addCatalogEntry,
  getSessionsForContent,
  linkSessionContent,
  unlinkSessionContent,
} from '../db'
import { sessionLabel, formatDurationShort } from '../utils/sessions'
import { formatDateInput, formatGroupLabel } from '../utils/date'
import TopNav from '../components/TopNav'
import Button from '../components/Button'
import BottomSheet from '../components/BottomSheet'
import ContentForm from '../components/ContentForm'
import { ArrowBack, Delete } from '@nine-thirty-five/material-symbols-react/outlined'
import './EditContent.css'

function toRow(session) {
  const todayStr = formatDateInput(new Date())
  return {
    id: session.id,
    label: sessionLabel(session),
    description: `${formatGroupLabel(session.date, todayStr)} · ${formatDurationShort(session.durationSeconds)}`,
    session,
  }
}

// Opened either from Biblioteca's "+" (new content, contentId is
// null) or by tapping an existing content item (contentId given).
// Fetches everything ContentForm needs (the content itself, existing
// contents for duplicate-detection, séries/filmes catalogs, and linked
// sessions) and owns the actual db writes — ContentForm/SearchCreateField
// stay dumb, this is where the data lives.
//
// New content has no contentId yet to link sessions against, so
// Vincular sessão stages picks in `pendingSessions` (shown immediately
// via linkedSessions, same as if they were already linked) and the
// actual sessionContents rows are written once Salvar creates the
// content and its real id exists.
function EditContent({ contentId = null, onBack, onSaved, onOpenLinkSession, onOpenSession, onOpenManage }) {
  const [languageId, setLanguageId] = useState(null)
  const [content, setContent] = useState(null)
  const [existingContents, setExistingContents] = useState([])
  const [seriesItems, setSeriesItems] = useState([])
  const [movieItems, setMovieItems] = useState([])
  const [linkedSessions, setLinkedSessions] = useState([])
  const [pendingSessions, setPendingSessions] = useState([])
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sessionToRemove, setSessionToRemove] = useState(null)

  useEffect(() => {
    getAppSettings().then((settings) => setLanguageId(settings.activeLanguageId))
  }, [])

  useEffect(() => {
    if (!languageId) return
    getContentsByLanguage(languageId).then(setExistingContents)
    getContentCatalog(languageId, 'serie').then((entries) =>
      setSeriesItems(entries.map((entry) => ({ id: entry.id, label: entry.name }))),
    )
    getContentCatalog(languageId, 'filme').then((entries) =>
      setMovieItems(entries.map((entry) => ({ id: entry.id, label: entry.name }))),
    )
  }, [languageId])

  useEffect(() => {
    if (!contentId) return
    getContent(contentId).then(setContent)
    refreshLinkedSessions(contentId)
  }, [contentId])

  function refreshLinkedSessions(id) {
    getSessionsForContent(id).then((sessions) => setLinkedSessions(sessions.map(toRow)))
  }

  const isNew = !contentId

  async function handleSave(fields) {
    if (saving) return
    setSaving(true)
    const { type, link, title, author, thumbnail, season, episode, relatedId } = fields

    let savedContentId = contentId
    if (type === 'serie') {
      if (relatedId && season && episode) {
        const saved = await saveSerieContent(relatedId, Number(season), Number(episode))
        savedContentId = saved?.id ?? savedContentId
      }
    } else if (type === 'filme') {
      if (relatedId) {
        // The filme's content row already exists (created alongside
        // its catalog entry) — nothing further to save here.
        const saved = await getFilmeContent(relatedId)
        savedContentId = saved?.id ?? savedContentId
      }
    } else if (isNew) {
      const saved = await createContent({ languageId, type, link, title, author, thumbnail })
      savedContentId = saved.id
    } else {
      await updateContent({ ...content, type, link, title, author, thumbnail })
    }

    if (isNew && savedContentId && pendingSessions.length > 0) {
      await Promise.all(pendingSessions.map((session) => linkSessionContent(session.id, savedContentId)))
    }
    onSaved()
  }

  async function handleCreateRelated(kind, name) {
    const entry = await addCatalogEntry(languageId, kind, name)
    if (kind === 'serie') {
      const updated = await getContentCatalog(languageId, 'serie')
      setSeriesItems(updated.map((item) => ({ id: item.id, label: item.name })))
    } else {
      const updated = await getContentCatalog(languageId, 'filme')
      setMovieItems(updated.map((item) => ({ id: item.id, label: item.name })))
    }
    return { id: entry.id, label: entry.name }
  }

  async function handleDelete() {
    await deleteContent(contentId)
    onSaved()
  }

  // New content has no id yet — stage the pick locally (shown right
  // away via linkedSessions) instead of writing to sessionContents;
  // handleSave links every staged session once the content is created.
  function handleAddSession() {
    onOpenLinkSession((session) => {
      if (!contentId) {
        setPendingSessions((current) => (current.some((s) => s.id === session.id) ? current : [...current, session]))
        setLinkedSessions((current) => [...current, toRow(session)])
        return
      }
      linkSessionContent(session.id, contentId).then(() => refreshLinkedSessions(contentId))
    })
  }

  function handleRemoveSession(sessionId) {
    setSessionToRemove(sessionId)
  }

  function confirmRemoveSession() {
    const sessionId = sessionToRemove
    setSessionToRemove(null)
    if (!contentId) {
      setPendingSessions((current) => current.filter((s) => s.id !== sessionId))
      setLinkedSessions((current) => current.filter((row) => row.id !== sessionId))
      return
    }
    unlinkSessionContent(sessionId, contentId).then(() => refreshLinkedSessions(contentId))
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
      {(isNew || content) && (
        <ContentForm
          key={contentId ?? 'new'}
          initialType={content?.type}
          initialLink={content?.link}
          initialTitle={content?.title}
          initialAuthor={content?.author}
          initialThumbnail={content?.thumbnail}
          initialSeason={content?.season}
          initialEpisode={content?.episode}
          initialRelatedQuery={content?.relatedName ?? ''}
          initialRelatedId={content?.catalogId ?? null}
          linkedSessions={linkedSessions}
          onOpenSession={(row) => onOpenSession(row.session)}
          onRemoveSession={handleRemoveSession}
          onAddSession={handleAddSession}
          seriesItems={seriesItems}
          movieItems={movieItems}
          onCreateRelated={handleCreateRelated}
          onManageRelated={onOpenManage}
          existingContents={existingContents}
          excludeId={contentId}
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
      )}
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
      <BottomSheet
        open={sessionToRemove !== null}
        onClose={() => setSessionToRemove(null)}
        title="Remover sessão?"
        description="A sessão não será excluída, só deixará de estar vinculada a esse conteúdo."
        contentCard={false}
        primaryButton={
          <Button variant="destructive" fullWidth onClick={confirmRemoveSession}>
            Remover
          </Button>
        }
        secondaryButton={
          <Button variant="ghost" fullWidth onClick={() => setSessionToRemove(null)}>
            Cancelar
          </Button>
        }
      />
    </main>
  )
}

export default EditContent
