import { useState } from 'react'
import SegmentedControl from './SegmentedControl'
import DonutCard from './DonutCard'
import CardTitleRow from './CardTitleRow'
import './ImmersionCard.css'

// "Imersão" stats card — a SegmentedControl switching between two
// DonutCard views over the same underlying data:
// - habilidade: Imersão's own subcategories (Simultâneo/Escuta/Leitura),
//   shaded from the violet ramp so it reads as "inside Imersão".
// - tipo: Imersão vs. Imersão interativa, i.e. the category-level
//   split between the two immersion types.
//
// Takes the full categoryBreakdown() output (all 4 categories) since
// the "tipo" tab needs imersaoInterativa's total alongside imersao's.
const TABS = [
  { value: 'habilidade', label: 'Habilidade' },
  { value: 'tipo', label: 'Tipo' },
]

function ImmersionCard({ groups = [], ...props }) {
  const [tab, setTab] = useState('habilidade')

  const imersao = groups.find((group) => group.key === 'imersao')
  const interativa = groups.find((group) => group.key === 'imersaoInterativa')

  const habilidadeGroups = (imersao?.items ?? []).map((item, index) => ({
    key: item.key,
    label: item.label,
    colorRamp: 'data-violet',
    rampIndex: index,
    totalSeconds: item.totalSeconds,
  }))

  const tipoGroups = [
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
      <CardTitleRow
        title="Imersão"
        description="Habilidade mostra a divisão entre Simultâneo, Escuta e Leitura dentro da Imersão. Tipo compara o tempo de Imersão com o de Imersão interativa."
      />
      <div className="immersion-card" {...props}>
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />
        <DonutCard bare groups={tab === 'habilidade' ? habilidadeGroups : tipoGroups} />
      </div>
    </div>
  )
}

export default ImmersionCard
