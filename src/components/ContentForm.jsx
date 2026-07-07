import { useState } from 'react'
import InputField from './InputField'
import SelectionChip from './SelectionChip'
import SearchCreateField from './SearchCreateField'
import ListItem from './ListItem'
import Thumbnail from './Thumbnail'
import Button from './Button'
import Alert from './Alert'
import { useContentLinkAutofill } from '../hooks/useContentLinkAutofill'
import { CONTENT_TYPES } from '../data/contentTypes'
import {
  Add,
  ChevronRight,
  ContentPaste,
  Edit,
  Settings,
  Videocam,
  Mic,
  Tv,
  Movie,
  Bookmark,
  Newspaper,
  Apps,
} from '@nine-thirty-five/material-symbols-react/outlined'
import './ContentForm.css'

// Icon fallback per content type (see src/data/contentTypes.js) —
// used whenever there's no thumbnail image yet (autofill hasn't
// returned one, or the type doesn't fetch one at all).
const TYPE_ICONS = { Videocam, Mic, Tv, Movie, Bookmark, Newspaper, Apps }

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
// `relatedItems` rather than being owned here (same reasoning as
// SearchCreateField itself staying "dumb").
function ContentForm({
  initialType = 'youtube',
  initialLink = '',
  initialTitle = '',
  initialAuthor = '',
  initialThumbnail = '',
  initialSeason = '',
  initialEpisode = '',
  linkedSessions = [],
  onAddSession,
  relatedItems = [],
  relatedQuery = '',
  onRelatedQueryChange,
  onSelectRelated,
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

  const autofillsFromLink = type === 'youtube' || type === 'podcast' || type === 'website'
  const autofill = useContentLinkAutofill(autofillsFromLink ? link : '', type, {
    hasTitle: title.trim().length > 0,
    onTitle: setTitle,
  })
  const displayThumbnail = autofillsFromLink ? autofill.thumbnail || thumbnail : thumbnail
  const FallbackIcon = TYPE_ICONS[CONTENT_TYPES.find((item) => item.key === type)?.icon]

  function handleTypeChange(key) {
    setType(key)
  }

  const trimmedTitle = title.trim().toLowerCase()
  const trimmedLink = link.trim().toLowerCase()
  const isDuplicate = existingContents.some((item) => {
    if (item.id === excludeId) return false
    const sameLink = trimmedLink && item.link?.trim().toLowerCase() === trimmedLink
    const sameTitle = trimmedTitle && item.title?.trim().toLowerCase() === trimmedTitle
    return sameLink || sameTitle
  })

  function handleSave() {
    if (isDuplicate) return
    onSave({
      type,
      link,
      title,
      author,
      thumbnail: displayThumbnail,
      season,
      episode,
    })
  }

  const isSeries = type === 'serie'
  const isMovie = type === 'filme'
  const relatedLabel = isSeries ? 'série' : 'filme'
  const derivedTitle =
    isSeries && relatedQuery ? `${relatedQuery}${season ? ` · T${season}` : ''}${episode ? ` E${episode}` : ''}` : ''

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

        {type === 'youtube' && (
          <>
            <InputField
              label="Link"
              placeholder="Cole o link do YouTube"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              trailingIcon={<ContentPaste />}
            />
            {title && (
              <InputField
                label="Título"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                trailingIcon={<Edit />}
              />
            )}
            <Thumbnail size="lg" src={displayThumbnail} alt={title} icon={FallbackIcon && <FallbackIcon />} />
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
            />
            <InputField
              label="Título"
              placeholder="Título do podcast"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              trailingIcon={<Edit />}
            />
            <Thumbnail size="lg" src={displayThumbnail} alt={title} icon={FallbackIcon && <FallbackIcon />} />
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
            />
            <InputField
              label="Título"
              placeholder="Adicione um título"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              trailingIcon={<Edit />}
            />
            <Thumbnail size="lg" src={displayThumbnail} alt={title} icon={FallbackIcon && <FallbackIcon />} />
          </>
        )}

        {(isSeries || isMovie) && (
          <>
            <SearchCreateField
              label={isSeries ? 'Série' : 'Filme'}
              placeholder={`Busque ou adicione ${isSeries ? 'uma série' : 'um filme'}`}
              value={relatedQuery}
              onChange={onRelatedQueryChange}
              items={relatedItems}
              onSelect={onSelectRelated}
              createLabel={relatedLabel}
              onCreate={onCreateRelated}
              settingsIcon={<Settings />}
              onSettingsClick={onManageRelated}
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
                <InputField
                  label="Título"
                  value={derivedTitle}
                  hint="Gerado automaticamente"
                  disabled
                />
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
            />
          </>
        )}

        {isDuplicate && (
          <Alert type="error" description="Já existe um conteúdo com esse título ou link." />
        )}

        <div className="content-form-divider" />

        <div className="content-form-field-group">
          <span className="content-form-label">Sessões vinculadas</span>
          {linkedSessions.length > 0 ? (
            <div className="content-form-sessions-card">
              {linkedSessions.map((session, index) => (
                <ListItem
                  key={session.id}
                  label={session.label}
                  description={session.description}
                  divider={index < linkedSessions.length - 1}
                  trailingIcon={<ChevronRight />}
                  onClick={() => session.onClick?.()}
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
        <Button fullWidth onClick={handleSave} disabled={saving || isDuplicate}>
          {primaryLabel}
        </Button>
        {secondaryButton}
      </div>
    </>
  )
}

export default ContentForm
