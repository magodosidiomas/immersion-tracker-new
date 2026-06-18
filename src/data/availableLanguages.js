// Fixed list of languages offered when adding a language (onboarding
// today, the future "add language" flow in Settings later). This is a
// catalog, not user data — same idea as the session category/subcategory
// taxonomy: a stable list maintained in code, not stored per-user.
//
// flagCode is an ISO 3166-1 alpha-2 country code, rendered via the
// flag-icons SVG set (see components/Flag.jsx) instead of an emoji.
export const AVAILABLE_LANGUAGES = [
  { name: 'Inglês', flagCode: 'us' },
  { name: 'Espanhol', flagCode: 'es' },
  { name: 'Italiano', flagCode: 'it' },
  { name: 'Francês', flagCode: 'fr' },
  { name: 'Alemão', flagCode: 'de' },
  { name: 'Holandês', flagCode: 'nl' },
  { name: 'Russo', flagCode: 'ru' },
  { name: 'Japonês', flagCode: 'jp' },
  { name: 'Mandarim', flagCode: 'cn' },
  { name: 'Coreano', flagCode: 'kr' },
  { name: 'Português', flagCode: 'pt' },
  { name: 'Árabe', flagCode: 'sa' },
  { name: 'Hindi', flagCode: 'in' },
  { name: 'Turco', flagCode: 'tr' },
  { name: 'Sueco', flagCode: 'se' },
  { name: 'Polonês', flagCode: 'pl' },
  { name: 'Grego', flagCode: 'gr' },
  { name: 'Hebraico', flagCode: 'il' },
  { name: 'Vietnamita', flagCode: 'vn' },
  { name: 'Indonésio', flagCode: 'id' },
  { name: 'Tailandês', flagCode: 'th' },
  { name: 'Norueguês', flagCode: 'no' },
  { name: 'Dinamarquês', flagCode: 'dk' },
  { name: 'Finlandês', flagCode: 'fi' },
  { name: 'Ucraniano', flagCode: 'ua' },
]
