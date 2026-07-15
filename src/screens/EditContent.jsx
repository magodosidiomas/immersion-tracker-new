import { useEffect, useRef, useState } from 'react'
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
import { normalizeForCompare } from '../utils/text'
import TopNav from '../components/TopNav'
import Button from '../components/Button'
import BottomSheet from '../components/BottomSheet'
import Modal from '../components/Modal'
import ContentForm from '../components/ContentForm'
import LinkSession from './LinkSession'
import ManageSeries from './ManageSeries'
import EpisodeDetail from './EpisodeDetail'
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
function EditContent({ contentId = null, onBack, onSaved, onOpenLinkSession, onOpenSession, onOpenManage, catalogRefreshTick = 0, headless = false, isDesktop = false }) {
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

  // Desktop only: which Modal "page" is showing, mirroring EditSession's
  // own view state. Mobile never touches this — it always uses
  // onOpenLinkSession/onOpenManage, the app-level full-page overlays.
  // 'manage-series' and 'episode-detail' are reached only through the
  // ContentForm gear icon (série/filme catalog management), same
  // restriction the mobile overlay already has (see ManageSeries' own
  // comment: onSelect only wired for kind 'serie', filme rows there are
  // management-only, not a pick).
  const [view, setView] = useState('form')
  const [manageDrill, setManageDrill] = useState(null)
  const pendingPickCallback = useRef(null)

  useEffect(() => {
    getAppSettings().then((settings) => setLanguageId(settings.activeLanguageId))
  }, [])

  function refreshCatalogs() {
    if (!languageId) return
    getContentsByLanguage(languageId).then(setExistingContents)
    getContentCatalog(languageId, 'serie').then((entries) =>
      setSeriesItems(entries.map((entry) => ({ id: entry.id, label: entry.name }))),
    )
    getContentCatalog(languageId, 'filme').then((entries) =>
      setMovieItems(entries.map((entry) => ({ id: entry.id, label: entry.name }))),
    )
  }

  useEffect(refreshCatalogs, [languageId, catalogRefreshTick])

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
    // Callers that open EditContent as a "pick or create" overlay (see
    // App.jsx's manualContentOverlay) need the freshly created content
    // back to treat it as the pick, same shape LinkContent's onSelect
    // hands over. Resolved via getContent (not the raw `fields`)
    // because série/filme content rows don't carry título/thumbnail
    // directly — those are derived from the catalog entry, see
    // resolveContentTitle. Existing callers that just navigate here
    // (Library) ignore the argument, so this is additive.
    const savedContent = isNew && savedContentId ? await getContent(savedContentId) : null
    onSaved(savedContent ? { ...savedContent, subtitle: '0 sessões' } : undefined)
  }

  async function handleCreateRelated(kind, name) {
    // Same name, different case/accents (e.g. "house of cards" vs
    // "House of Cards") is treated as the same série/filme — reuse the
    // existing entry instead of creating a duplicate row in the catalog.
    const existingItems = kind === 'serie' ? seriesItems : movieItems
    const match = existingItems.find((item) => normalizeForCompare(item.label) === normalizeForCompare(name))
    if (match) return match

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
    const pick = (session) => {
      if (!contentId) {
        setPendingSessions((current) => (current.some((s) => s.id === session.id) ? current : [...current, session]))
        setLinkedSessions((current) => [...current, toRow(session)])
        return
      }
      linkSessionContent(session.id, contentId).then(() => refreshLinkedSessions(contentId))
    }
    if (isDesktop) {
      pendingPickCallback.current = pick
      setView('link-session')
      return
    }
    onOpenLinkSession(pick)
  }

  // Desktop only: gear icon on the série/filme SearchCreateField opens
  // Gerenciar séries/filmes as a Modal sub-view instead of the app-level
  // full-page overlay. Closing it (any path) re-fetches the catalogs
  // directly — there's no parent-owned catalogRefreshTick bump to rely
  // on since App.jsx's openManageOverlay is bypassed entirely here.
  function handleOpenManage(kind, onSelectItem) {
    if (!isDesktop) {
      onOpenManage(kind, onSelectItem)
      return
    }
    pendingPickCallback.current = onSelectItem
    setManageDrill({ kind })
    setView('manage-series')
  }

  function closeDesktopManage() {
    refreshCatalogs()
    setManageDrill(null)
    setView('form')
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

  const body = (
    <>
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
          onManageRelated={handleOpenManage}
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
    </>
  )

  // headless: rendered inside a Modal (desktop) that already supplies
  // its own header/back button — skip this screen's own TopNav/main
  // wrapper so there isn't a duplicate header.
  if (headless) return body

  // isDesktop (top-level Biblioteca entry point only — manualContentOverlay
  // stays headless-inside-picker-overlay, unrelated to this): windowed
  // Modal instead of the full-page mobile layout, same pattern EditSession
  // already uses for "Editar sessão"/"Vincular conteúdo".
  if (isDesktop) {
    if (view === 'link-session') {
      return (
        <Modal
          title="Vincular sessão"
          leadingIcon={<ArrowBack />}
          onLeadingClick={() => setView('form')}
          onClose={onBack}
          flushContent
          className="finish-session-modal"
          width={480}
          height={640}
        >
          <LinkSession
            headless
            onSelect={(session) => {
              pendingPickCallback.current?.(session)
              setView('form')
            }}
            // "Nova sessão" would need its own nested Modal layer inside
            // this one — same simplification manualContentOverlay's
            // onOpenLinkSession already makes elsewhere; not built here.
            onAddSession={() => {}}
          />
        </Modal>
      )
    }
    if (view === 'manage-series') {
      return (
        <Modal
          title={manageDrill?.kind === 'serie' ? 'Gerenciar séries' : 'Gerenciar filmes'}
          leadingIcon={<ArrowBack />}
          onLeadingClick={closeDesktopManage}
          onClose={onBack}
          width={480}
          height={640}
        >
          <ManageSeries
            embedded
            kind={manageDrill?.kind}
            onOpenSessions={
              manageDrill?.kind === 'filme'
                ? async (item) => {
                    const filmeContent = await getFilmeContent(item.id)
                    setManageDrill({ kind: 'filme', catalogItem: item, contentId: filmeContent?.id ?? null })
                    setView('episode-detail')
                  }
                : undefined
            }
            onSelect={
              manageDrill?.kind === 'serie'
                ? (item) => {
                    pendingPickCallback.current?.(item)
                    closeDesktopManage()
                  }
                : undefined
            }
          />
        </Modal>
      )
    }
    if (view === 'episode-detail') {
      return (
        <Modal
          title={manageDrill?.catalogItem?.label ?? 'Sessões'}
          leadingIcon={<ArrowBack />}
          onLeadingClick={() => setView('manage-series')}
          onClose={onBack}
          width={480}
          height={640}
        >
          <EpisodeDetail
            embedded
            contentId={manageDrill?.contentId}
            seriesName={manageDrill?.catalogItem?.label}
            episode={null}
            onAddSession={onOpenLinkSession}
            onOpenSession={onOpenSession}
          />
        </Modal>
      )
    }
    return (
      <Modal
        title={isNew ? 'Novo conteúdo' : 'Editar conteúdo'}
        leadingIcon={<ArrowBack />}
        onLeadingClick={onBack}
        onClose={onBack}
        flushContent
        className="finish-session-modal"
        width={480}
        height={640}
      >
        {body}
      </Modal>
    )
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
      {body}
    </main>
  )
}

export default EditContent
