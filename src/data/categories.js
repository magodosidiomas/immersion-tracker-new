// Fixed taxonomy — not user-editable, not stored as DB records. Sessions
// store the `key` values (not labels), so relabeling later doesn't
// break historical data. See imerso-data-model.md.
export const CATEGORIES = [
  {
    key: 'imersao',
    label: 'Imersão',
    colorRamp: 'data-violet',
    subcategories: [
      { key: 'simultaneo', label: 'Simultâneo' },
      { key: 'escuta', label: 'Escuta' },
      { key: 'leitura', label: 'Leitura' },
    ],
  },
  {
    key: 'imersaoInterativa',
    label: 'Imersão interativa',
    colorRamp: 'data-teal',
    subcategories: [
      { key: 'simultaneo', label: 'Simultâneo' },
      { key: 'escuta', label: 'Escuta' },
      { key: 'leitura', label: 'Leitura' },
    ],
  },
  {
    key: 'estudo',
    label: 'Estudo',
    colorRamp: 'data-amber',
    subcategories: [
      { key: 'vocabulario', label: 'Vocabulário' },
      { key: 'gramatica', label: 'Gramática' },
      { key: 'pronuncia', label: 'Pronúncia' },
    ],
  },
  {
    key: 'producao',
    label: 'Produção',
    colorRamp: 'data-pink',
    subcategories: [
      { key: 'fala', label: 'Fala' },
      { key: 'escrita', label: 'Escrita' },
      { key: 'conversacao', label: 'Conversação' },
      { key: 'aula', label: 'Aula' },
    ],
  },
]
