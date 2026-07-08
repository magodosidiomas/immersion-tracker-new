import { useState } from 'react'
import InputField from './InputField'
import SelectionChip from './SelectionChip'
import SearchCreateField from './SearchCreateField'
import EditableListItem from './EditableListItem'
import Thumbnail from './Thumbnail'
import Button from './Button'
import Alert from './Alert'
import { useContentLinkAutofill } from '../hooks/useContentLinkAutofill'
import { isYouTubeUrl, extractYouTubeId } from '../utils/contentLink'
import { CONTENT_TYPES } from '../data/contentTypes'
import {
  Add,
  ContentPaste,
  Edit,
  Settings,
  DoNotDisturbOn,
} from '@nine-thirty-five/material-symbols-react/outlined'
import './ContentForm.css'

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
//   - filme: SearchCreateField only
//   - livro: Título + Autor
//   - outro: Título only
//
// Séries/filmes aren't static taxonomy like CONTENT_TYPES — they're
// user data, so the list to search/create against comes in as
// `seriesItems`/`movieItems` rather than being owned here (same
// reasoning as SearchCreateField itself staying "dumb").
function ContentForm({
  initialType = 'youtube',
  initialLink = '',
  initialTitle = '',
  initialAuthor = '',
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
  onCreateRelated,
  onManageRelated,
  existingContents = [],
  excludeId = null,
  onSave,
  saving = false,
  primaryLabel = 'Salvar',
  secondaryButton = null,
}) {
  const [type, setType] = useState(initialType)
  const [link, setLink] = useState(initialLink)
  const [title, setTitle] = useState(initialTitle)
  const [author, setAuthor] = useState(initialAuthor)
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

  const autofillsFromLink = type === 'youtube' || type === 'podcast' || type === 'website'
  const autofill = useContentLinkAutofill(autofillsFromLink ? link : '', type, {
    hasTitle: title.trim().length > 0,
    onTitle: setTitle,
  })
  const displayThumbnail = autofillsFromLink ? autofill.thumbnail : thumbnail

  function handleTypeChange(key) {
    if (key === type) return
    setFieldsByType((cache) => ({ ...cache, [type]: { link, title, author, season, episode, relatedQuery, relatedId } }))
    const cached = fieldsByType[key]
    setType(key)
    setLink(cached?.link ?? '')
    setTitle(cached?.title ?? '')
    setAuthor(cached?.author ?? '')
    setSeason(cached?.season ?? '')
    setEpisode(cached?.episode ?? '')
    setRelatedQuery(cached?.relatedQuery ?? '')
    setRelatedId(cached?.relatedId ?? null)
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

  const trimmedTitle = title.trim().toLowerCase()
  const trimmedLink = link.trim().toLowerCase()
  const isDuplicate = existingContents.some((item) => {
    if (item.id === excludeId) return false
    const sameLink = trimmedLink && item.link?.trim().toLowerCase() === trimmedLink
    const sameTitle = trimmedTitle && item.title?.trim().toLowerCase() === trimmedTitle
    return sameLink || sameTitle
  })

  // YouTube only accepts a single video link — playlists/canais don't
  // resolve to a video id via extractYouTubeId, so they're rejected
  // the same way a non-YouTube link is.
  const youtubeLinkError =
    type === 'youtube' && link.trim() && (!isYouTubeUrl(link) || !extractYouTubeId(link))
      ? 'Cole o link de um vídeo do YouTube (não funciona com playlists ou canais).'
      : null

  const isSeries = type === 'serie'
  const isMovie = type === 'filme'
  const relatedKind = isSeries ? 'serie' : 'filme'
  const relatedLabel = isSeries ? 'série' : 'filme'
  const derivedTitle =
    isSeries && relatedQuery ? `${relatedQuery}${season ? ` · T${season}` : ''}${episode ? ` E${episode}` : ''}` : ''

  function handleSelectRelated(item) {
    setRelatedQuery(item.label)
    setRelatedId(item.id)
  }

  async function handleCreateRelated(name) {
    const created = await onCreateRelated?.(relatedKind, name)
    if (created) {
      setRelatedQuery(created.label ?? created.name ?? name)
      setRelatedId(created.id)
    }
  }

  const canSave = !isDuplicate && !youtubeLinkError

  function handleSave() {
    if (!canSave) return
    onSave({
      type,
      link,
      title,
      author,
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
              onChange={(event) => setLink(event.target.value)}
              trailingIcon={<ContentPaste />}
              onTrailingIconClick={handlePasteLink}
            />
            {youtubeLinkError && <Alert type="error" description={youtubeLinkError} />}
            {title && (
              <InputField
                label="Título"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                trailingIcon={<Edit />}
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
              onChange={(event) => setLink(event.target.value)}
              hint="Links do Spotify ou YouTube Music preenchem título e capa automaticamente"
              trailingIcon={<ContentPaste />}
              onTrailingIconClick={handlePasteLink}
            />
            <InputField
              label="Título"
              placeholder="Título do podcast"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              trailingIcon={<Edit />}
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
              onChange={(event) => setLink(event.target.value)}
              trailingIcon={<ContentPaste />}
              onTrailingIconClick={handlePasteLink}
            />
            <InputField
              label="Título"
              placeholder="Adicione um título"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              trailingIcon={<Edit />}
            />
            {displayThumbnail && <Thumbnail size="lg" src={displayThumbnail} alt={title} />}
          </>
        )}

        {(isSeries || isMovie) && (
          <>
            <SearchCreateField
              label={isSeries ? 'Série' : 'Filme'}
              placeholder={`Busque ou adicione ${isSeries ? 'uma série' : 'um filme'}`}
              value={relatedQuery}
              onChange={setRelatedQuery}
              items={isSeries ? seriesItems : movieItems}
              onSelect={handleSelectRelated}
              createLabel={relatedLabel}
              onCreate={handleCreateRelated}
              settingsIcon={<Settings />}
              onSettingsClick={() => onManageRelated?.(relatedKind)}
            />
            {isSeries && (
              <>
                <div className="content-form-row">
                  <InputField
                    label="Temporada"
                    type="number"
                    min={1}
                    value={season}
                    onChange={(event) => setSeason(event.target.value)}
                  />
                  <InputField
                    label="Episódio"
                    type="number"
                    min={1}
                    value={episode}
                    onChange={(event) => setEpisode(event.target.value)}
                  />
                </div>
                <InputField label="Título" value={derivedTitle} hint="Gerado automaticamente" disabled />
              </>
            )}
          </>
        )}

        {type === 'livro' && (
          <>
            <InputField
              label="Título"
              placeholder="Nome do livro"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <InputField
              label="Autor"
              placeholder="Nome do autor"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
            />
            {thumbnail && <Thumbnail size="book" src={thumbnail} alt={title} />}
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

        {isDuplicate && <Alert type="error" description="Já existe um conteúdo com esse título ou link." />}

        <div className="content-form-divider" />

        <div className="content-form-field-group">
          {linkedSessions.length > 0 && <span className="content-form-label">Sessões vinculadas</span>}
          {linkedSessions.length > 0 ? (
            <div className="content-form-sessions-card">
              {linkedSessions.map((session, index) => (
                <EditableListItem
                  key={session.id}
                  label={session.label}
                  description={session.description}
                  divider={index < linkedSessions.length - 1}
                  onClick={onOpenSession ? () => onOpenSession(session) : null}
                  deleteIcon={<DoNotDisturbOn />}
                  onDelete={() => onRemoveSession?.(session.id)}
                />
              ))}
            </div>
          ) : (
            <p className="content-form-sessions-empty">Nenhuma sessão ainda</p>
          )}
          <Button variant="outline" fullWidth leadingIcon={<Add />} onClick={onAddSession}>
            Vincular sessão
          </Button>
        </div>
      </div>

      <div className="content-form-footer">
        <Button fullWidth onClick={handleSave} disabled={saving || !canSave}>
          {primaryLabel}
        </Button>
        {secondaryButton}
      </div>
    </>
  )
}

export default ContentForm
