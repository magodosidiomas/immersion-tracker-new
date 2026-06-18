import { useEffect, useState } from 'react'
import { getLanguages } from '../db'
import TopNav from '../components/TopNav'
import Button from '../components/Button'
import SelectableListItem from '../components/SelectableListItem'
import { ArrowBack, Add } from '@nine-thirty-five/material-symbols-react/outlined'
import Flag from '../components/Flag'
import './ManageLanguages.css'

// Lives inside Settings in the nav hierarchy — back always returns to
// Settings, even when this screen was opened via Home's dropdown
// shortcut (see Home.jsx's BottomSheet primaryButton). Tapping a
// language row isn't designed yet (cascade-delete confirmation is
// still pending, see imerso-data-model.md), so rows stay read-only for
// now; "Adicionar idiomas" opens AddLanguages.
function ManageLanguages({ onBack, onOpenAddLanguages }) {
  const [languages, setLanguages] = useState([])

  useEffect(() => {
    getLanguages().then(setLanguages)
  }, [])

  return (
    <main className="manage-languages">
      <TopNav
        title="Gerenciar idiomas"
        hasDivider
        leadingIcon={
          <button type="button" className="top-nav-icon-reset" onClick={onBack} aria-label="Voltar">
            <ArrowBack />
          </button>
        }
      />
      <div className="manage-languages-content">
        <p className="manage-languages-label">Meus idiomas</p>
        <div className="manage-languages-card">
          {languages.map((language, index) => (
            <SelectableListItem
              key={language.id}
              label={language.name}
              flag={<Flag code={language.flagCode} />}
              divider={index < languages.length - 1}
            />
          ))}
        </div>
        <div className="manage-languages-footer">
          <Button variant="outline" leadingIcon={<Add />} fullWidth onClick={onOpenAddLanguages}>
            Adicionar idiomas
          </Button>
        </div>
      </div>
    </main>
  )
}

export default ManageLanguages
