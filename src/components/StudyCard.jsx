import DonutCard from './DonutCard'
import './StudyCard.css'

// "Estudo" stats card — no SegmentedControl, just Estudo's own
// subcategories (Vocabulário/Gramática/Pronúncia) shaded from the
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
    <div className="study-card" {...props}>
      <DonutCard bare title="Estudo" groups={subcategoryGroups} />
    </div>
  )
}

export default StudyCard
