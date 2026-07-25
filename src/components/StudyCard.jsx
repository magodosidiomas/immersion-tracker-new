import DonutCard from './DonutCard'

// "Estudo" stats card — no SegmentedControl, so it's just DonutCard
// itself (title + bordered ring/legend box) fed Estudo's own
// subcategories (Vocabulário/Gramática/Pronúncia), shaded from the
// amber ramp. Simpler than Immersion/ProductionCard since there's no
// second comparison view for this category yet.
const STUDY_COLORS = {
  vocabulario: 'data-teal',
  gramatica: 'data-amber',
  pronuncia: 'data-pink',
}

function StudyCard({ groups = [], ...props }) {
  const estudo = groups.find((group) => group.key === 'estudo')

  const subcategoryGroups = (estudo?.items ?? []).map((item) => ({
    key: item.key,
    label: item.label,
    colorRamp: STUDY_COLORS[item.key] ?? 'data-amber',
    rampIndex: 0,
    totalSeconds: item.totalSeconds,
  }))

  return (
    <DonutCard
      title="Estudo"
      description="Como seu tempo de estudo se divide."
      groups={subcategoryGroups}
      {...props}
    />
  )
}

export default StudyCard
