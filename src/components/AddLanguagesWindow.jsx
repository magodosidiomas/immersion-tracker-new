import { useAddLanguages } from '../hooks/useAddLanguages'
import Modal from './Modal'
import Button from './Button'
import InputField from './InputField'
import SelectableListItem from './SelectableListItem'
import EmptyState from './EmptyState'
import Flag from './Flag'
import { ArrowBack, Close, Check, Search, SearchOff } from '@nine-thirty-five/material-symbols-react/outlined'
import './AddLanguagesWindow.css'

// Desktop-only (>=1280px) counterpart to AddLanguages — mirrors the
// Figma "Modal" frame's sideNav-hidden subpage variant. Built on the
// shared Modal component so it gets the standard topNav (title +
// voltar/fechar) and single surface/background token for free. There's
// no nested subpage here, so voltar and fechar both just close the
// window. Reuses AddLanguages' data/selection logic via
// useAddLanguages so both shells stay behaviorally identical.
function AddLanguagesWindow({ onClose }) {
  const { loaded, filteredOptions, selected, query, setQuery, toggle, handleAdd } = useAddLanguages(onClose)

  return (
    <Modal
      title="Adicionar idiomas"
      leadingIcon={<ArrowBack />}
      onLeadingClick={onClose}
      trailingIcon={<Close />}
      onTrailingClick={onClose}
      onClose={onClose}
      flushContent
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button leadingIcon={<Check />} disabled={selected.length === 0} onClick={handleAdd}>
            Adicionar ({selected.length})
          </Button>
        </>
      }
    >
      <div className="add-languages-window-body">
        <InputField
          placeholder="Procurar idioma"
          leadingIcon={<Search />}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="add-languages-window-scroll">
          {loaded && filteredOptions.length === 0 ? (
            <EmptyState
              style="plain"
              icon={<SearchOff />}
              title="Nenhum resultado encontrado"
              description="Tente pesquisar por outro termo."
            />
          ) : (
            <div className="add-languages-window-card">
              {loaded &&
                filteredOptions.map((language, index) => {
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
          )}
        </div>
      </div>
    </Modal>
  )
}

export default AddLanguagesWindow
