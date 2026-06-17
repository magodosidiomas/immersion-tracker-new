import TopNav from '../components/TopNav'
import SelectableListItem from '../components/SelectableListItem'
import { ArrowBack, Public, Backup, ChevronRight } from '@nine-thirty-five/material-symbols-react/outlined'
import './Settings.css'

// "Idiomas" opens the language management screen. "Backup" is drawn
// per Figma but inert for now — that flow isn't designed yet.
function Settings({ onBack, onOpenManageLanguages }) {
  return (
    <main className="settings">
      <TopNav
        title="Configurações"
        hasDivider
        leadingIcon={
          <button type="button" className="top-nav-icon-reset" onClick={onBack} aria-label="Voltar">
            <ArrowBack />
          </button>
        }
      />
      <div className="settings-content">
        <div className="settings-card">
          <SelectableListItem
            label="Idiomas"
            leadingIcon={<Public />}
            trailingIcon={<ChevronRight />}
            divider
            onClick={onOpenManageLanguages}
          />
          <SelectableListItem label="Backup" leadingIcon={<Backup />} trailingIcon={<ChevronRight />} />
        </div>
      </div>
    </main>
  )
}

export default Settings
