import DonutCard from './DonutCard'

// "Imersão vs. Interativa" stats card — just DonutCard itself, no
// SegmentedControl. Category-level split between the two immersion
// formats. Used to be the "Formato" tab of a combined Imersão card
// before it got split into two, same reasoning as Produção's split.
function FormatCard({ groups = [], ...props }) {
  const imersao = groups.find((group) => group.key === 'imersao')
  const interativa = groups.find((group) => group.key === 'imersaoInterativa')

  const formatGroups = [
    { key: 'imersao', label: 'Imersão', colorRamp: 'data-violet', totalSeconds: imersao?.totalSeconds ?? 0 },
    {
      key: 'imersaoInterativa',
      label: 'Imersão interativa',
      colorRamp: 'data-teal',
      totalSeconds: interativa?.totalSeconds ?? 0,
    },
  ]

  return (
    <DonutCard
      title="Imersão x Imersão Interativa"
      groups={formatGroups}
      {...props}
    />
  )
}

export default FormatCard
