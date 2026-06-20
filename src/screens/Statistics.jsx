import LanguageTopNav from '../components/LanguageTopNav'
import BottomNav from '../components/BottomNav'
import { Home as HomeIcon, BarChart } from '@nine-thirty-five/material-symbols-react/outlined'
import './Statistics.css'

// Second main tab, alongside Home — reached only via BottomNav. Same
// LanguageTopNav as Home (active language + switcher + settings), no
// back arrow since switching tabs isn't a drill-down. Content is still
// empty; this is just the shell (topnav + bottomnav) for now.
function Statistics({ onOpenHome, onOpenSettings, onOpenManageLanguages }) {
  return (
    <main className="statistics">
      <LanguageTopNav onOpenSettings={onOpenSettings} onOpenManageLanguages={onOpenManageLanguages} />
      <div className="statistics-bottom-layer">
        <BottomNav
          items={[
            { label: 'Início', icon: <HomeIcon />, onClick: onOpenHome },
            { label: 'Estatísticas', icon: <BarChart />, active: true },
          ]}
        />
      </div>
    </main>
  )
}

export default Statistics
