import DonutCard from './DonutCard'

// "Estudo" stats card — no SegmentedControl, so it's just DonutCard
// itself (title + bordered ring/legend box) fed Estudo's own
// subcategories (Vocabulário/Gramática/Pronúncia), shaded from the
// amber ramp. Simpler than Immersion/ProductionCard since there's no
// second comparison view for this category yet.
function StudyCard({ groups = [], ...props }) {
  const estudo = groups.find((group) => group.key === 'estudo')

  const subcategoryGroups = (estudo?.items ?? []).map((item, index) => ({
    key: item.key,
    label: item.label,
    colorRamp: 'data-amber',
    rampIndex: index,
    totalSeconds: item.totalSeconds,
  }))

  return (
    <DonutCard
      title="Estudo"
      description="Como seu tempo de Estudo se divide entre Vocabulário, Gramática e Pronúncia."
      groups={subcategoryGroups}
      {...props}
    />
  )
}

export default StudyCard
