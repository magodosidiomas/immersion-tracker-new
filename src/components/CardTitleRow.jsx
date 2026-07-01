import { useState } from 'react'
import { Info } from '@nine-thirty-five/material-symbols-react/outlined'
import BottomSheet from './BottomSheet'
import './CardTitleRow.css'

// Shared header for every stats card — the label text plus an
// optional (?) info button that opens a short BottomSheet explanation.
// Lives outside each card's bordered box (see DonutCard/Immersion/
// ProductionCard's *-group wrappers), so this is the row that sits
// right above the card, not inside its padding.
function CardTitleRow({ title, description, children }) {
  const [open, setOpen] = useState(false)
  const hasInfo = Boolean(description || children)

  return (
    <div className="card-title-row">
      <p className="card-title-row-label">{title}</p>
      {hasInfo && (
        <>
          <button
            type="button"
            className="card-title-row-info"
            onClick={() => setOpen(true)}
            aria-label={`Sobre ${title}`}
          >
            <Info />
          </button>
          <BottomSheet
            open={open}
            onClose={() => setOpen(false)}
            title={title}
            description={children ? null : description}
            contentCard={false}
          >
            {children}
          </BottomSheet>
        </>
      )}
    </div>
  )
}

export default CardTitleRow
