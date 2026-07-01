import DonutCard from './DonutCard'

// "Produção" stats card — just DonutCard itself, fed Produção's own
// subcategories (Fala/Escrita/Conversação/Aula), shaded from the pink
// ramp. Same pattern as StudyCard/ReceptionCard: no SegmentedControl,
// this used to be the "Tipo" tab of a combined Produção card before
// it got split into two.
function ProductionCard({ groups = [], ...props }) {
  const producao = groups.find((group) => group.key === 'producao')

  const subcategoryGroups = (producao?.items ?? []).map((item, index) => ({
    key: item.key,
    label: item.label,
    colorRamp: 'data-pink',
    rampIndex: index,
    totalSeconds: item.totalSeconds,
  }))

  return (
    <DonutCard
      title="Produção"
      description="Como seu tempo de produção se divide."
      groups={subcategoryGroups}
      {...props}
    />
  )
}

export default ProductionCard
