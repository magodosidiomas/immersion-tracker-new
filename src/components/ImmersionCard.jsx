import { useState } from 'react'
import SegmentedControl from './SegmentedControl'
import DonutCard from './DonutCard'
import CardTitleRow from './CardTitleRow'
import './ImmersionCard.css'

// "Imersão" stats card — a SegmentedControl switching between two
// DonutCard views over the same underlying data:
// - habilidade: Simultâneo/Escuta/Leitura, summed across Imersão AND
//   Imersão interativa — the point is "how much do I listen/read
//   overall", not to split it by which of the two immersion
//   categories it came from (that's what the Formato tab is for).
// - formato: Imersão vs. Imersão interativa, i.e. the category-level
//   split between the two immersion formats.
//
// Takes the full categoryBreakdown() output (all 4 categories) since
// both tabs need imersaoInterativa's data alongside imersao's.
const TABS = [
  { value: 'habilidade', label: 'Habilidade' },
  { value: 'formato', label: 'Formato' },
]

const SKILL_LABELS = { simultaneo: 'Simultâneo', escuta: 'Escuta', leitura: 'Leitura' }

function ImmersionCard({ groups = [], ...props }) {
  const [tab, setTab] = useState('habilidade')

  const imersao = groups.find((group) => group.key === 'imersao')
  const interativa = groups.find((group) => group.key === 'imersaoInterativa')

  const habilidadeGroups = Object.keys(SKILL_LABELS).map((key, index) => {
    const seconds = [imersao, interativa]
      .flatMap((group) => group?.items ?? [])
      .filter((item) => item.key === key)
      .reduce((sum, item) => sum + item.totalSeconds, 0)
    return {
      key,
      label: SKILL_LABELS[key],
      colorRamp: 'data-violet',
      rampIndex: index,
      totalSeconds: seconds,
    }
  })

  const formatoGroups = [
    { key: 'imersao', label: 'Imersão', colorRamp: 'data-violet', totalSeconds: imersao?.totalSeconds ?? 0 },
    {
      key: 'imersaoInterativa',
      label: 'Imersão interativa',
      colorRamp: 'data-teal',
      totalSeconds: interativa?.totalSeconds ?? 0,
    },
  ]

  return (
    <div className="immersion-card-group">
      <CardTitleRow title="Imersão">
        <p className="card-title-row-section">
          <strong>Habilidade</strong> — mostra qual tipo de imersão você pratica mais: Simultâneo,
          Escuta ou Leitura, somando Imersão e Imersão interativa.
        </p>
        <p className="card-title-row-section">
          <strong>Formato</strong> — compara o tempo de Imersão com o de Imersão interativa.
        </p>
      </CardTitleRow>
      <div className="immersion-card" {...props}>
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />
        <DonutCard bare groups={tab === 'habilidade' ? habilidadeGroups : formatoGroups} />
      </div>
    </div>
  )
}

export default ImmersionCard
