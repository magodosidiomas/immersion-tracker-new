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
} from '../db'
import { sessionLabel, formatDurationShort } from '../utils/sessions'
import { formatDateInput, formatGroupLabel } from '../utils/date'
import TopNav from '../components/TopNav'
import Button from '../components/Button'
import BottomSheet from '../components/BottomSheet'
import ContentForm from '../components/ContentForm'
import { ArrowBack, Delete } from '@nine-thirty-five/material-symbols-react/outlined'
import './EditContent.css'

// Opened either from Biblioteca's "+" (new content, contentId is
// null) or by tapping an existing content item (contentId given).
// Fetches everything ContentForm needs (the content itself, existing
// contents for duplicate-detection, séries/filmes catalogs, and linked
// sessions) and owns the actual db writes — ContentForm/SearchCreateField
// stay dumb, this is where the data lives.
//
// Known limitation: linking a session before the very first Salvar
// isn't wired yet (there's no contentId to link against until then) —
// Vincular sessão only does something once the content already exists.
function EditContent({ contentId = null, onBack, onSaved, onOpenLinkSession, onOpenManage }) {
  const [languageId, setLanguageId] = useState(null)
  const [content, setContent] = useState(null)
  const [existingContents, setExistingContents] = useState([])
  const [seriesItems, setSeriesItems] = useState([])
  const [movieItems, setMovieItems] = useState([])
  const [linkedSessions, setLinkedSessions] = useState([])
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

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
    getSessionsForContent(id).then((sessions) => {
      const todayStr = formatDateInput(new Date())
      setLinkedSessions(
        sessions.map((session) => ({
          id: session.id,
          label: sessionLabel(session),
          description: `${formatGroupLabel(session.date, todayStr)} · ${formatDurationShort(session.durationSeconds)}`,
        })),
      )
    })
  }

  const isNew = !contentId

  async function handleSave(fields) {
    if (saving) return
    setSaving(true)
    const { type, link, title, author, thumbnail, season, episode, relatedId } = fields

    if (type === 'serie') {
      if (relatedId && season && episode) {
        await saveSerieContent(relatedId, Number(season), Number(episode))
      }
    } else if (type === 'filme') {
      if (relatedId) {
        // The filme's content row already exists (created alongside
        // its catalog entry) — nothing further to save here.
        await getFilmeContent(relatedId)
      }
    } else if (isNew) {
      await createContent({ languageId, type, link, title, author, thumbnail })
    } else {
      await updateContent({ ...content, type, link, title, author, thumbnail })
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

  function handleAddSession() {
    if (!contentId) return
    onOpenLinkSession(async (session) => {
      await linkSessionContent(session.id, contentId)
      refreshLinkedSessions(contentId)
    })
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
        initialRelatedQuery={content?.relatedName ?? ''}
        initialRelatedId={content?.catalogId ?? null}
        linkedSessions={linkedSessions}
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
