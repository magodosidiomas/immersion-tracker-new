import TopNav from '../components/TopNav'
import Button from '../components/Button'
import InputField from '../components/InputField'
import SelectableListItem from '../components/SelectableListItem'
import EmptyState from '../components/EmptyState'
import { Close, Check, Search, SearchOff } from '@nine-thirty-five/material-symbols-react/outlined'
import Flag from '../components/Flag'
import { useAddLanguages } from '../hooks/useAddLanguages'
import './AddLanguages.css'

// Reached from ManageLanguages' "Adicionar idiomas" button. Fetches the
// current language list itself (same self-sufficient-screen pattern as
// ManageLanguages/App) so AVAILABLE_LANGUAGES can be filtered down to
// languages not already added — no point offering to add a duplicate.
function AddLanguages({ onClose }) {
  const { loaded, filteredOptions, selected, query, setQuery, toggle, handleAdd } = useAddLanguages(onClose)

  if (!loaded) return null

  return (
    <main className="add-languages">
      <TopNav
        title="Adicionar idiomas"
        hasDivider
        trailingRight={
          <button type="button" className="top-nav-icon-reset" onClick={onClose} aria-label="Fechar">
            <Close />
          </button>
        }
      />
      <InputField
        className="add-languages-search"
        placeholder="Buscar idioma"
        leadingIcon={<Search />}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="add-languages-scroll">
        {filteredOptions.length === 0 ? (
          <EmptyState
            icon={<SearchOff />}
            title="Nenhum resultado encontrado"
            description="Tente pesquisar por outro termo."
          />
        ) : (
        <div className="add-languages-card">
          {filteredOptions.map((language, index) => {
            const isSelected = selected.includes(language.name)
            return (
              <SelectableListItem
                key={language.name}
                label={language.nativeName}
                description={language.name}
                flag={<Flag code={language.flagCode} />}
                divider={index > 0}
                position={
                  filteredOptions.length === 1
                    ? 'only'
                    : index === 0
                      ? 'first'
                      : index === filteredOptions.length - 1
                        ? 'last'
                        : 'middle'
                }
                trailingIcon={
                  <span className="add-languages-checkbox">
                    <span className="add-languages-checkbox-box" data-checked={isSelected}>
                      {isSelected && <Check />}
                    </span>
                  </span>
                }
                onClick={() => toggle(language.name)}
              />
            )
          })}
        </div>
        )}
      </div>
      <div className="add-languages-footer">
        <Button leadingIcon={<Check />} disabled={selected.length === 0} fullWidth onClick={handleAdd}>
          Adicionar ({selected.length})
        </Button>
      </div>
    </main>
  )
}

export default AddLanguages
