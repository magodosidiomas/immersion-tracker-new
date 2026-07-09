// Fixed list of languages offered when adding a language (onboarding
// today, the future "add language" flow in Settings later). This is a
// catalog, not user data — same idea as the session category/subcategory
// taxonomy: a stable list maintained in code, not stored per-user.
//
// flagCode is an ISO 3166-1 alpha-2 country code, rendered via the
// flag-icons SVG set (see components/Flag.jsx) instead of an emoji.
// A few entries aren't tied to a country at all:
//   - Esperanto ("eo") is constructed, not national, so it has no
//     country flag to borrow — Flag.jsx falls back to a generic globe
//     icon for any code it doesn't recognize, which "eo" deliberately
//     isn't.
//   - Grego Koiné (Koine/Ancient Greek) reuses "gr", same as modern
//     Grego — there's no separate historical flag asset, and the two
//     stay distinguishable by name.
//   - Latim is the one dead language that *does* get a real, factual
//     flag: "va" (Vatican City), where Latin is still an official
//     language today.
//   - Catalão isn't a country either, but flag-icons ships Catalonia's
//     own regional flag as "es-ct", so it gets a real flag too instead
//     of falling back to the generic globe icon.
//   - Cantonês uses "hk" (Hong Kong) rather than "cn" (already taken
//     by Mandarim) — Hong Kong is where Cantonese has official status
//     and the strongest cultural association, even though it's also
//     widely spoken in Guangdong province on the mainland.
//
// Ordered alphabetically (pt-BR) rather than by popularity: with ~50
// entries and no search field yet (see AddLanguages.jsx), alphabetical
// is the only ordering a person can actually predict and scan by, and
// it needs zero upkeep as entries are added — popularity would have to
// be re-judged and re-justified forever.
export const AVAILABLE_LANGUAGES = [
  { name: 'Africâner', flagCode: 'za' },
  { name: 'Alemão', flagCode: 'de' },
  { name: 'Árabe', flagCode: 'sa' },
  { name: 'Bengali', flagCode: 'bd' },
  { name: 'Búlgaro', flagCode: 'bg' },
  { name: 'Cantonês', flagCode: 'hk' },
  { name: 'Catalão', flagCode: 'es-ct' },
  { name: 'Coreano', flagCode: 'kr' },
  { name: 'Croata', flagCode: 'hr' },
  { name: 'Dinamarquês', flagCode: 'dk' },
  { name: 'Eslovaco', flagCode: 'sk' },
  { name: 'Esloveno', flagCode: 'si' },
  { name: 'Espanhol', flagCode: 'es' },
  { name: 'Esperanto', flagCode: 'eo' },
  { name: 'Estoniano', flagCode: 'ee' },
  { name: 'Filipino', flagCode: 'ph' },
  { name: 'Finlandês', flagCode: 'fi' },
  { name: 'Francês', flagCode: 'fr' },
  { name: 'Grego', flagCode: 'gr' },
  { name: 'Grego Koiné', flagCode: 'gr' },
  { name: 'Hebraico', flagCode: 'il' },
  { name: 'Hindi', flagCode: 'in' },
  { name: 'Holandês', flagCode: 'nl' },
  { name: 'Húngaro', flagCode: 'hu' },
  { name: 'Indonésio', flagCode: 'id' },
  { name: 'Inglês', flagCode: 'us' },
  { name: 'Irlandês', flagCode: 'ie' },
  { name: 'Islandês', flagCode: 'is' },
  { name: 'Italiano', flagCode: 'it' },
  { name: 'Japonês', flagCode: 'jp' },
  { name: 'Latim', flagCode: 'va' },
  { name: 'Letão', flagCode: 'lv' },
  { name: 'Lituano', flagCode: 'lt' },
  { name: 'Malaio', flagCode: 'my' },
  { name: 'Mandarim', flagCode: 'cn' },
  { name: 'Norueguês', flagCode: 'no' },
  { name: 'Persa', flagCode: 'ir' },
  { name: 'Polonês', flagCode: 'pl' },
  { name: 'Português', flagCode: 'pt' },
  { name: 'Romeno', flagCode: 'ro' },
  { name: 'Russo', flagCode: 'ru' },
  { name: 'Sérvio', flagCode: 'rs' },
  { name: 'Suaíli', flagCode: 'ke' },
  { name: 'Sueco', flagCode: 'se' },
  { name: 'Tailandês', flagCode: 'th' },
  { name: 'Tcheco', flagCode: 'cz' },
  { name: 'Turco', flagCode: 'tr' },
  { name: 'Ucraniano', flagCode: 'ua' },
  { name: 'Urdu', flagCode: 'pk' },
  { name: 'Vietnamita', flagCode: 'vn' },
]
