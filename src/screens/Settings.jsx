import TopNav from '../components/TopNav'
import { ArrowBack } from '@nine-thirty-five/material-symbols-react/outlined'
import './Settings.css'

// Empty for now — just the nav shell so Home's settings icon has
// somewhere to go. Real content (languages, account, etc.) gets built
// next.
function Settings({ onBack }) {
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
    </main>
  )
}

export default Settings
