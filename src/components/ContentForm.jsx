import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import InputField from './InputField'
import SelectionChip from './SelectionChip'
import SearchCreateField from './SearchCreateField'
import LinkedSessionListItem from './LinkedSessionListItem'
import EmptyState from './EmptyState'
import Thumbnail from './Thumbnail'
import Button from './Button'
import BottomSheet from './BottomSheet'
import { useContentLinkAutofill } from '../hooks/useContentLinkAutofill'
import {
  isYouTubeUrl,
  isSpotifyUrl,
  isYouTubeMusicUrl,
  isYouTubePlaylistUrl,
  isYouTubeChannelUrl,
  extractYouTubeId,
  isHttpUrl,
} from '../utils/contentLink'
import { normalizeForCompare } from '../utils/text'
import { CONTENT_TYPES } from '../data/contentTypes'
import {
  Add,
  ContentPaste,
  Edit,
  Settings,
  Schedule,
  Movie,
  Theaters,
  Bookmark,
} from '@nine-thirty-five/material-symbols-react/outlined'
import './ContentForm.css'

const RELATED_KIND_META = {
  serie: { label: 'série', labelCap: 'Série', article: 'uma', icon: <Theaters />, emptyTitle: 'Nenhuma série cadastrada ainda', emptyDescription: 'Séries que você adicionar vão aparecer aqui.' },
  filme: { label: 'filme', labelCap: 'Filme', article: 'um', icon: <Movie />, emptyTitle: 'Nenhum filme cadastrado ainda', emptyDescription: 'Filmes que você adicionar vão aparecer aqui.' },
  livro: { label: 'livro', labelCap: 'Livro', article: 'um', icon: <Bookmark />, emptyTitle: 'Nenhum livro cadastrado ainda', emptyDescription: 'Livros que você adicionar vão aparecer aqui.' },
}

// The "Novo/editar conteúdo" form — same fields whether creating or
// editing (only the save target differs, same split as SessionForm/
// NewSession/EditSession). Owns its own editable state, seeded once
// from the initial* props.
//
// Which data fields show depends entirely on `type`:
//   - youtube/podcast: Link (auto-fills título+thumbnail via oEmbed)
//   - website: Link + Título, manual (no oEmbed provider)
//   - serie: SearchCreateField + Temporada/Episódio, título is
//     derived ("Nome · T1 E1") rather than typed
//   - filme/livro: SearchCreateField only
//   - outro: Título only
//
// Séries/filmes/livros aren't static taxonomy like CONTENT_TYPES —
// they're user data, so the list to search/create against comes in as
// `seriesItems`/`movieItems`/`bookItems` rather than being owned here
// (same reasoning as SearchCreateField itself staying "dumb").
const ContentForm = forwardRef(function ContentForm({
  initialType = 'youtube',
  initialLink = '',
  initialTitle = '',
  initialThumbnail = '',
  initialSeason = '',
  initialEpisode = '',
  initialRelatedQuery = '',
  initialRelatedId = null,
  linkedSessions = [],
  onOpenSession,
  onRemoveSession,
  onAddSession,
  seriesItems = [],
  movieItems = [],
  bookItems = [],
  onCreateRelated,
  onManageRelated,
  existingContents = [],
  excludeId = null,
  onSave,
  saving = false,
  primaryLabel = 'Salvar',
  secondaryButton = null,
  onDirtyChange,
  // hideFooter: desktop "Novo conteúdo" Modal renders its own footer
  // (Modal's footer prop, matching AddLanguagesWindow's action bar)
  // instead of this component's internal stacked footer — submit is
  // then triggered externally via the exposed `submit` ref method.
  hideFooter = false,
  onValidityChange,
}, ref) {
  const [type, setType] = useState(initialType)
  const [attemptedSave, setAttemptedSave] = useState(false)
  const [link, setLink] = useState(initialLink)
  const [title, setTitle] = useState(initialTitle)
  const [thumbnail] = useState(initialThumbnail)
  const [season, setSeason] = useState(initialSeason)
  const [episode, setEpisode] = useState(initialEpisode)
  const [relatedQuery, setRelatedQuery] = useState(initialRelatedQuery)
  const [relatedId, setRelatedId] = useState(initialRelatedId)
  // Switching category (e.g. YouTube -> Podcast) resets the visible
  // fields rather than bleeding one type's link/title into another —
  // but stashes the outgoing type's values here first, so switching
  // back (including by accident) restores them instead of losing work.
  const [fieldsByType, setFieldsByType] = useState({})
  const seasonInputRef = useRef(null)
  const episodeInputRef = useRef(null)
  // Quick-create sheet: shown instead of SearchCreateField when there
  // are no séries/filmes yet to search through (nothing to search
  // makes the combobox pointless) — same pattern as ManageSeries'
  // own "add new" sheet, just reached from inside the form instead.
  const [showCreateRelated, setShowCreateRelated] = useState(false)
  const [createRelatedName, setCreateRelatedName] = useState('')

  useEffect(() => {
    onDirtyChange?.(
      Boolean(link.trim() || title.trim() || season || episode || relatedQuery.trim()),
    )
  }, [link, title, season, episode, relatedQuery, onDirtyChange])

  const autofillsFromLink = type === 'youtube' || type === 'podcast' || type === 'website'
  const autofill = useContentLinkAutofill(autofillsFromLink ? link : '', type, {
    hasTitle: title.trim().length > 0,
    onTitle: setTitle,
  })
  const displayThumbnail = autofillsFromLink ? autofill.thumbnail : thumbnail

  function handleTypeChange(key) {
    if (key === type) return
    setFieldsByType((cache) => ({ ...cache, [type]: { link, title, season, episode, relatedQuery, relatedId } }))
    const cached = fieldsByType[key]
    setType(key)
    setLink(cached?.link ?? '')
    setTitle(cached?.title ?? '')
    setSeason(cached?.season ?? '')
    setEpisode(cached?.episode ?? '')
    setRelatedQuery(cached?.relatedQuery ?? '')
    setRelatedId(cached?.relatedId ?? null)
  }

  function handleLinkChange(value) {
    setLink(value)
    if (autofillsFromLink) setTitle('')
  }

  async function handlePasteLink() {
    try {
      const text = await navigator.clipboard.readText()
      if (text) setLink(text)
    } catch {
      // Clipboard permission denied/unavailable — the person can still
      // paste manually, so this just silently does nothing.
    }
  }

  // Temporada's Enter (or a mobile keyboard's "next" action) moves
  // straight into Episódio, since filling one after the other is the
  // expected flow. Episódio has nothing left to jump to, so its Enter
  // just dismisses the keyboard instead, same as tapping outside would.
  function handleSeasonEnter(event) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    episodeInputRef.current?.focus()
  }

  function handleEpisodeEnter(event) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    event.target.blur()
  }

  const trimmedTitle = title.trim().toLowerCase()
  const trimmedLink = link.trim().toLowerCase()
  const isDuplicate = existingContents.some((item) => {
    if (item.id === excludeId) return false
    const sameLink = trimmedLink && item.link?.trim().toLowerCase() === trimmedLink
    const sameTitle = trimmedTitle && item.title?.trim().toLowerCase() === trimmedTitle
    return sameLink || sameTitle
  })
  const duplicateError = isDuplicate ? 'Já existe um conteúdo com esse título ou link.' : null
  const titleNotFoundError =
    autofillsFromLink && autofill.notFound && !title.trim() ? 'Título não encontrado. Coloque um título.' : null

  // Each link-based type validates its link differently:
  //   - youtube: must resolve to a real video id (rejects playlists/
  //     canais the same way it rejects a non-YouTube link)
  //   - podcast: any host works (título stays manually editable
  //     either way), but a YouTube link specifically still needs to
  //     resolve to a video id, and anything else at least needs to be
  //     a well-formed link
  //   - website: just needs to be a well-formed link — Microlink will
  //     handle whatever it finds there
  const trimmedLinkValue = link.trim()
  const linkError = (() => {
    if (!trimmedLinkValue) return null
    if (type === 'youtube') {
      if (!isYouTubeUrl(link)) {
        return 'Esse link não parece ser do YouTube. Cole o link do vídeo do YouTube (ex: youtube.com/watch?v=...).'
      }
      if (isYouTubePlaylistUrl(link)) return 'Esse link é de uma playlist do YouTube. Cole o link do vídeo.'
      if (isYouTubeChannelUrl(link)) return 'Esse é um link de um canal do YouTube. Cole o link do vídeo.'
      return !extractYouTubeId(link)
        ? 'Esse link não parece ser do YouTube. Cole o link do vídeo do YouTube (ex: youtube.com/watch?v=...).'
        : null
    }
    if (type === 'podcast') {
      return !isHttpUrl(link) ? 'Cole um link válido.' : null
    }
    if (type === 'website') {
      if (isYouTubeMusicUrl(link)) return 'Esse link é do YouTube Music. Use o tipo Podcast para adicionar esse conteúdo.'
      if (isYouTubeUrl(link)) return 'Esse link é do YouTube. Use o tipo YouTube para adicionar esse conteúdo.'
      if (isSpotifyUrl(link)) return 'Esse link é do Spotify. Use o tipo Podcast para adicionar esse conteúdo.'
      return !isHttpUrl(link) ? 'Cole um link válido.' : null
    }
    return null
  })()

  // Required-field validation — separate from linkError/duplicateError
  // above (which validate *format*), this catches empty required
  // fields per type so a blank/near-blank content item can't be saved.
  const requiredTitleError =
    !title.trim() && (type === 'podcast' || type === 'website' || type === 'outro')
      ? 'Coloque um título.'
      : null
  const requiredLinkError =
    !trimmedLinkValue && (type === 'youtube' || type === 'podcast' || type === 'website')
      ? type === 'youtube'
        ? 'Cole o link do vídeo do YouTube.'
        : 'Cole um link.'
      : null

  const isSeries = type === 'serie'
  const isMovie = type === 'filme'
  const isBook = type === 'livro'
  const hasRelated = isSeries || isMovie || isBook
  const hasLinkField = type === 'youtube' || type === 'podcast' || type === 'website' || type === 'outro'
  // série/filme/livro: sessões only make sense once a título is
  // actually selected (or there's nothing to select yet) — gated on
  // relatedId instead of the link-based check the other types use.
  // outro: link is optional here, título is the field that actually
  // matters, so it gates on título instead of link like youtube/
  // podcast/website do.
  const showSessions = hasRelated
    ? Boolean(relatedId)
    : type === 'outro'
      ? title.trim().length > 0
      : !hasLinkField || link.trim().length > 0
  const relatedMeta = RELATED_KIND_META[type]
  const relatedKind = type
  const relatedLabel = relatedMeta?.label
  const relatedItemsByKind = { serie: seriesItems, filme: movieItems, livro: bookItems }
  const relatedItems = relatedItemsByKind[type] ?? []
  const filteredRelatedItems = relatedQuery.trim()
    ? relatedItems.filter((item) => normalizeForCompare(item.label).includes(normalizeForCompare(relatedQuery)))
    : relatedItems
  const derivedTitle =
    isSeries && relatedQuery && season
      ? `${relatedQuery}${season ? ` · T${season}` : ''}${episode ? ` E${episode}` : ''}`
      : ''
  const requiredRelatedError =
    hasRelated && !relatedId ? `Selecione ${relatedMeta.article} ${relatedMeta.label}.` : null
  const requiredSeasonEpisodeError =
    isSeries && relatedId && (!season || !episode) ? 'Preencha temporada e episódio.' : null

  function handleSelectRelated(item) {
    setRelatedQuery(item.label)
    setRelatedId(item.id)
    if (isSeries) {
      // Temporada field only mounts once relatedId is set, so focus
      // has to wait a tick for it to appear in the DOM.
      requestAnimationFrame(() => seasonInputRef.current?.focus())
    }
  }

  async function handleCreateRelated(name) {
    const created = await onCreateRelated?.(relatedKind, name)
    if (created) {
      setRelatedQuery(created.label ?? created.name ?? name)
      setRelatedId(created.id)
    }
  }

  async function handleQuickCreateRelated() {
    const name = createRelatedName.trim()
    if (!name) return
    await handleCreateRelated(name)
    setCreateRelatedName('')
    setShowCreateRelated(false)
  }

  const canSave =
    !isDuplicate &&
    !linkError &&
    !requiredTitleError &&
    !requiredLinkError &&
    !requiredRelatedError &&
    !requiredSeasonEpisodeError

  useEffect(() => {
    onValidityChange?.(canSave)
  }, [canSave, onValidityChange])

  useImperativeHandle(ref, () => ({
    submit: handleSave,
  }))

  function handleSave() {
    if (!canSave) {
      setAttemptedSave(true)
      return
    }
    onSave({
      type,
      link,
      title,
      thumbnail: displayThumbnail,
      season,
      episode,
      relatedId,
    })
  }

  return (
    <>
      <div className="content-form-body">
        <div className="content-form-field-group">
          <span className="content-form-label">Categoria</span>
          <div className="content-form-chips">
            {CONTENT_TYPES.map((item) => (
              <SelectionChip
                key={item.key}
                label={item.label}
                hasLeadingIcon={false}
                hasTrailingIcon={false}
                selected={type === item.key}
                onClick={() => handleTypeChange(item.key)}
              />
            ))}
          </div>
        </div>

        <div className="content-form-divider" />

        {type === 'youtube' && (
          <>
            <InputField
              label="Link"
              placeholder="Cole o link do YouTube"
              value={link}
              onChange={(event) => handleLinkChange(event.target.value)}
              trailingIcon={<ContentPaste />}
              onTrailingIconClick={handlePasteLink}
              error={linkError || duplicateError || (attemptedSave && requiredLinkError)}
            />
            {(title || autofill.loading || autofill.notFound) && (
              <InputField
                label="Título"
                value={title}
                placeholder={autofill.loading ? 'Buscando título...' : ''}
                disabled={autofill.loading && !title}
                onChange={(event) => setTitle(event.target.value)}
                trailingIcon={<Edit />}
                error={duplicateError || titleNotFoundError}
              />
            )}
            {displayThumbnail && <Thumbnail size="lg" src={displayThumbnail} alt={title} />}
          </>
        )}

        {type === 'podcast' && (
          <>
            <InputField
              label="Link"
              placeholder="Cole o link do podcast"
              value={link}
              onChange={(event) => handleLinkChange(event.target.value)}
              hint="Links do Spotify ou YouTube Music preenchem título e capa automaticamente"
              trailingIcon={<ContentPaste />}
              onTrailingIconClick={handlePasteLink}
              error={linkError || (attemptedSave && requiredLinkError)}
            />
            <InputField
              label="Título"
              placeholder={autofill.loading ? 'Buscando título...' : 'Título do podcast'}
              disabled={autofill.loading && !title}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              trailingIcon={<Edit />}
              error={duplicateError || titleNotFoundError || (attemptedSave && requiredTitleError)}
            />
            {displayThumbnail && <Thumbnail size="lg" src={displayThumbnail} alt={title} />}
          </>
        )}

        {type === 'website' && (
          <>
            <InputField
              label="Link"
              placeholder="Cole o link do site"
              value={link}
              onChange={(event) => handleLinkChange(event.target.value)}
              trailingIcon={<ContentPaste />}
              onTrailingIconClick={handlePasteLink}
              error={linkError || (attemptedSave && requiredLinkError)}
            />
            <InputField
              label="Título"
              placeholder={autofill.loading ? 'Buscando título...' : 'Adicione um título'}
              disabled={autofill.loading && !title}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              trailingIcon={<Edit />}
              error={duplicateError || titleNotFoundError || (attemptedSave && requiredTitleError)}
            />
            {displayThumbnail && <Thumbnail size="lg" src={displayThumbnail} alt={title} />}
          </>
        )}

        {hasRelated && (
          <>
            {relatedItems.length === 0 ? (
              <EmptyState
                style="plain"
                icon={relatedMeta.icon}
                title={relatedMeta.emptyTitle}
                description={relatedMeta.emptyDescription}
                buttonLabel={`Adicionar ${relatedLabel}`}
                buttonIcon={<Add />}
                onButtonClick={() => setShowCreateRelated(true)}
              />
            ) : (
              <SearchCreateField
                label={relatedMeta.labelCap}
                placeholder={`Busque ou adicione ${relatedMeta.article} ${relatedMeta.label}`}
                value={relatedQuery}
                onChange={setRelatedQuery}
                items={filteredRelatedItems}
                onSelect={handleSelectRelated}
                createLabel={relatedLabel}
                onCreate={handleCreateRelated}
                settingsIcon={<Settings />}
                onSettingsClick={() => onManageRelated?.(relatedKind, handleSelectRelated)}
                onQuickAddClick={() => {
                  setCreateRelatedName(relatedQuery.trim())
                  setShowCreateRelated(true)
                }}
                error={attemptedSave && requiredRelatedError}
              />
            )}
            {isSeries && relatedId && (
              <>
                <div className="content-form-row">
                  <InputField
                    ref={seasonInputRef}
                    label="Temporada"
                    type="number"
                    min={1}
                    value={season}
                    onChange={(event) => setSeason(event.target.value)}
                    onKeyDown={handleSeasonEnter}
                    error={attemptedSave && !season ? requiredSeasonEpisodeError : null}
                  />
                  <InputField
                    ref={episodeInputRef}
                    label="Episódio"
                    type="number"
                    min={1}
                    value={episode}
                    onChange={(event) => setEpisode(event.target.value)}
                    onKeyDown={handleEpisodeEnter}
                    error={attemptedSave && !episode ? requiredSeasonEpisodeError : null}
                  />
                </div>
                {season && <InputField label="Título" value={derivedTitle} hint="Gerado automaticamente" disabled />}
              </>
            )}
          </>
        )}

        {type === 'outro' && (
          <>
            <InputField
              label="Título"
              placeholder="Coloque o título"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              trailingIcon={<Edit />}
              error={duplicateError || (attemptedSave && requiredTitleError)}
            />
            <InputField
              label="Link (opcional)"
              placeholder="Cole o link"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              trailingIcon={<ContentPaste />}
              onTrailingIconClick={handlePasteLink}
            />
          </>
        )}

        {showSessions && (
          <>
            <div className="content-form-divider" />

            <div className="content-form-field-group">
              {linkedSessions.length > 0 && (
                <>
                  <span className="content-form-label">Sessões</span>
                  <div className="content-form-sessions-card">
                    {linkedSessions.map((session, index) => (
                      <LinkedSessionListItem
                        key={session.id}
                        label={session.label}
                        description={session.description}
                        divider={index < linkedSessions.length - 1}
                        onView={onOpenSession ? () => onOpenSession(session) : null}
                        onUnlink={() => onRemoveSession?.(session.id)}
                      />
                    ))}
                  </div>
                  <Button variant="outline" leadingIcon={<Add />} onClick={onAddSession}>
                    Vincular sessão
                  </Button>
                </>
              )}
              {linkedSessions.length === 0 && (
                <EmptyState
                  icon={<Schedule />}
                  title="Sem sessões"
                  description="Vincule as sessões em que você usou esse conteúdo."
                  buttonLabel="Vincular sessão"
                  buttonIcon={<Add />}
                  onButtonClick={onAddSession}
                  style="plain"
                />
              )}
            </div>
          </>
        )}
      </div>

      {!hideFooter && (
        <div className="content-form-footer">
          <div style={{ position: 'relative', width: '100%' }}>
            <Button fullWidth onClick={handleSave} disabled={saving || !canSave}>
              {primaryLabel}
            </Button>
            {!saving && !canSave && (
              <div
                style={{ position: 'absolute', inset: 0 }}
                onClick={() => setAttemptedSave(true)}
                aria-hidden="true"
              />
            )}
          </div>
          {secondaryButton}
        </div>
      )}

      <BottomSheet
        open={showCreateRelated}
        onClose={() => {
          setShowCreateRelated(false)
          setCreateRelatedName('')
        }}
        title={`Adicionar ${relatedLabel}`}
        contentCard={false}
        variant="modal"
        primaryButton={
          <Button fullWidth onClick={handleQuickCreateRelated} disabled={!createRelatedName.trim()}>
            Salvar
          </Button>
        }
        secondaryButton={
          <Button
            variant="outline"
            fullWidth
            onClick={() => {
              setShowCreateRelated(false)
              setCreateRelatedName('')
            }}
          >
            Cancelar
          </Button>
        }
      >
        <InputField
          label={relatedMeta?.labelCap}
          placeholder="Digite o título"
          value={createRelatedName}
          onChange={(event) => setCreateRelatedName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              handleQuickCreateRelated()
            }
          }}
          autoFocus
        />
      </BottomSheet>
    </>
  )
})

export default ContentForm
