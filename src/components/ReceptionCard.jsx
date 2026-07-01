import DonutCard from './DonutCard'

// "Recepção vs. Produção" stats card — just DonutCard itself (title +
// bordered ring/legend box, no SegmentedControl), same pattern as
// StudyCard. Cross-category (Recepção pulls Escuta+Leitura from
// Imersão and Imersão interativa), so it takes the full
// categoryBreakdown() output rather than just producao's own group.
const RECEPTION_SUBKEYS = ['escuta', 'leitura']

function ReceptionCard({ groups = [], ...props }) {
  const imersao = groups.find((group) => group.key === 'imersao')
  const interativa = groups.find((group) => group.key === 'imersaoInterativa')
  const producao = groups.find((group) => group.key === 'producao')

  const receptionSeconds = [imersao, interativa]
    .flatMap((group) => group?.items ?? [])
    .filter((item) => RECEPTION_SUBKEYS.includes(item.key))
    .reduce((sum, item) => sum + item.totalSeconds, 0)

  const distribuicaoGroups = [
    {
      key: 'recepcao',
      label: 'Recepção',
      description: 'Escuta, leitura',
      colorRamp: 'data-violet',
      totalSeconds: receptionSeconds,
    },
    {
      key: 'producao',
      label: 'Produção',
      description: 'Fala, escrita, conversação, aula',
      colorRamp: 'data-pink',
      totalSeconds: producao?.totalSeconds ?? 0,
    },
  ]

  return (
    <DonutCard
      title="Recepção vs. Produção"
      description="Compara o tempo de recepção (escuta e leitura) com o de produção (fala e escrita)."
      groups={distribuicaoGroups}
      {...props}
    />
  )
}

export default ReceptionCard
