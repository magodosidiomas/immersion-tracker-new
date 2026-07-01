import { useState } from 'react'
import SegmentedControl from './SegmentedControl'
import DonutCard from './DonutCard'
import CardTitleRow from './CardTitleRow'
import './ProductionCard.css'

// "Produção" stats card — a SegmentedControl over a bare DonutCard:
// - distribuicao: Recepção/Compreensão (Escuta+Leitura, pulled from
//   both Imersão and Imersão interativa) vs. Produção (all 4 of its
//   own subcategories). Cross-category, so it reads straight from the
//   full categoryBreakdown() groups rather than from producao alone.
// - tipo: Produção's own subcategories (Fala/Escrita/Conversação/Aula),
//   shaded from the pink ramp.
const TABS = [
  { value: 'distribuicao', label: 'Distribuição' },
  { value: 'tipo', label: 'Tipo' },
]

const RECEPTION_SUBKEYS = ['escuta', 'leitura']

function ProductionCard({ groups = [], ...props }) {
  const [tab, setTab] = useState('distribuicao')

  const imersao = groups.find((group) => group.key === 'imersao')
  const interativa = groups.find((group) => group.key === 'imersaoInterativa')
  const producao = groups.find((group) => group.key === 'producao')

  const receptionSeconds = [imersao, interativa]
    .flatMap((group) => group?.items ?? [])
    .filter((item) => RECEPTION_SUBKEYS.includes(item.key))
    .reduce((sum, item) => sum + item.totalSeconds, 0)

  const distribuicaoGroups = [
    { key: 'recepcao', label: 'Recepção', colorRamp: 'data-violet', totalSeconds: receptionSeconds },
    {
      key: 'producao',
      label: 'Produção',
      colorRamp: 'data-pink',
      totalSeconds: producao?.totalSeconds ?? 0,
    },
  ]

  const tipoGroups = (producao?.items ?? []).map((item, index) => ({
    key: item.key,
    label: item.label,
    colorRamp: 'data-pink',
    rampIndex: index,
    totalSeconds: item.totalSeconds,
  }))

  return (
    <div className="production-card-group">
      <CardTitleRow
        title="Produção"
        description="Distribuição compara o tempo de recepção (Escuta e Leitura, de Imersão e Imersão interativa) com o tempo de Produção. Tipo mostra a divisão entre Fala, Escrita, Conversação e Aula."
      />
      <div className="production-card" {...props}>
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />
        <DonutCard bare groups={tab === 'distribuicao' ? distribuicaoGroups : tipoGroups} />
      </div>
    </div>
  )
}

export default ProductionCard
