import TopNav from '../components/TopNav'
import SelectableListItem from '../components/SelectableListItem'
import { ArrowBack, Public, Backup, VideoLabel, Movie, ChevronRight } from '@nine-thirty-five/material-symbols-react/outlined'
import './Settings.css'

// "Idiomas" opens the language management screen, "Backup" opens the
// export/import screen. "Séries"/"Filmes" open the content-catalog
// management screens (rename/delete, and for séries also episodes).
function Settings({ onBack, onOpenManageLanguages, onOpenBackup, onOpenManageSeries, onOpenManageMovies }) {
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
        <div className="settings-group">
          <span className="settings-section-label">Geral</span>
          <div className="settings-card">
            <SelectableListItem
              label="Idiomas"
              leadingIcon={<Public />}
              trailingIcon={<ChevronRight />}
              position="first"
              onClick={onOpenManageLanguages}
            />
            <SelectableListItem
              label="Backup"
              leadingIcon={<Backup />}
              trailingIcon={<ChevronRight />}
              position="last"
              divider
              onClick={onOpenBackup}
            />
          </div>
        </div>

        <div className="settings-group">
          <span className="settings-section-label">Conteúdo</span>
          <div className="settings-card">
            <SelectableListItem
              label="Séries"
              leadingIcon={<VideoLabel />}
              trailingIcon={<ChevronRight />}
              position="first"
              onClick={onOpenManageSeries}
            />
            <SelectableListItem
              label="Filmes"
              leadingIcon={<Movie />}
              trailingIcon={<ChevronRight />}
              position="last"
              divider
              onClick={onOpenManageMovies}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

export default Settings
