import TopNav from '../components/TopNav'
import BottomNav from '../components/BottomNav'
import { Home as HomeIcon, BarChart } from '@nine-thirty-five/material-symbols-react/outlined'
import './Statistics.css'

// Second main tab, alongside Home — reached only via BottomNav, so its
// TopNav has no back arrow (switching tabs isn't a drill-down). Content
// is still empty; this is just the shell (topnav + bottomnav) for now.
function Statistics({ onOpenHome }) {
  return (
    <main className="statistics">
      <TopNav title="Estatísticas" />
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
