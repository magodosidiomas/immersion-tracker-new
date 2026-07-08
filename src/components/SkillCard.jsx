import DonutCard from './DonutCard'

// "Habilidade" stats card — just DonutCard itself, no SegmentedControl.
// Simultâneo/Escuta/Leitura summed across Imersão AND Imersão
// interativa (the point is "how much do I listen/read overall", not
// which category it came from — that's FormatCard's job). Used to be
// the "Habilidade" tab of a combined Imersão card before it got split
// into two, same reasoning as Produção's split.
const SKILL_LABELS = { simultaneo: 'Simultâneo', escuta: 'Escuta', leitura: 'Leitura' }

function SkillCard({ groups = [], ...props }) {
  const imersao = groups.find((group) => group.key === 'imersao')
  const interativa = groups.find((group) => group.key === 'imersaoInterativa')

  const skillGroups = Object.keys(SKILL_LABELS).map((key, index) => {
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

  return (
    <DonutCard
      title="Leitura x Escuta"
      groups={skillGroups}
      {...props}
    />
  )
}

export default SkillCard
