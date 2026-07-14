import { useAddLanguages } from '../hooks/useAddLanguages'
import Button from './Button'
import InputField from './InputField'
import SelectableListItem from './SelectableListItem'
import Flag from './Flag'
import { ArrowBack, Check, Search } from '@nine-thirty-five/material-symbols-react/outlined'
import './AddLanguagesWindow.css'

// Desktop-only (>=1280px) counterpart to AddLanguages — mirrors the
// Figma "Modal" frame's sideNav-hidden subpage variant: a standalone
// 560x600 window (narrower than SettingsWindow's 800px, since there's
// no sideNav here) with a back arrow instead of a close icon, and a
// Cancelar/Adicionar button pair in the footer instead of a single
// full-width action. Reuses AddLanguages' data/selection logic via
// useAddLanguages so both shells stay behaviorally identical.
function AddLanguagesWindow({ onClose }) {
  const { loaded, filteredOptions, selected, query, setQuery, toggle, handleAdd } = useAddLanguages(onClose)

  return (
    <div
      className="add-languages-window-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="add-languages-window">
        <div className="add-languages-window-topbar">
          <button type="button" className="add-languages-window-back" onClick={onClose} aria-label="Voltar">
            <ArrowBack />
          </button>
        </div>
        <div className="add-languages-window-content">
          <h2 className="add-languages-window-heading">Adicionar idiomas</h2>
          <InputField
            placeholder="Procurar idioma"
            leadingIcon={<Search />}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="add-languages-window-card">
            {loaded &&
              filteredOptions.map((language, index) => {
                const isSelected = selected.includes(language.name)
                return (
                  <SelectableListItem
                    key={language.name}
                    label={language.name}
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
                      <span className="add-languages-window-checkbox">
                        <span className="add-languages-window-checkbox-box" data-checked={isSelected}>
                          {isSelected && <Check />}
                        </span>
                      </span>
                    }
                    onClick={() => toggle(language.name)}
                  />
                )
              })}
          </div>
        </div>
        <div className="add-languages-window-footer">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button leadingIcon={<Check />} disabled={selected.length === 0} onClick={handleAdd}>
            Adicionar ({selected.length})
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AddLanguagesWindow
