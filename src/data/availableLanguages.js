// Fixed list of languages offered when adding a language (onboarding
// today, the future "add language" flow in Settings later). This is a
// catalog, not user data — same idea as the session category/subcategory
// taxonomy: a stable list maintained in code, not stored per-user.
//
// nativeName is the language's own name for itself (e.g. 'Deutsch' for
// Alemão) — used as the primary label in language pickers, with `name`
// (the pt-BR name) shown as the description underneath. Already-added
// Language records in IndexedDB only store the pt-BR `name`, so
// getNativeName() below re-derives nativeName from this catalog rather
// than duplicating it onto every stored Language.
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
  { name: 'Africâner', nativeName: 'Afrikaans', flagCode: 'za' },
  { name: 'Alemão', nativeName: 'Deutsch', flagCode: 'de' },
  { name: 'Árabe', nativeName: 'العربية', flagCode: 'sa' },
  { name: 'Bengali', nativeName: 'বাংলা', flagCode: 'bd' },
  { name: 'Búlgaro', nativeName: 'Български', flagCode: 'bg' },
  { name: 'Cantonês', nativeName: '廣東話', flagCode: 'hk' },
  { name: 'Catalão', nativeName: 'Català', flagCode: 'es-ct' },
  { name: 'Coreano', nativeName: '한국어', flagCode: 'kr' },
  { name: 'Croata', nativeName: 'Hrvatski', flagCode: 'hr' },
  { name: 'Dinamarquês', nativeName: 'Dansk', flagCode: 'dk' },
  { name: 'Eslovaco', nativeName: 'Slovenčina', flagCode: 'sk' },
  { name: 'Esloveno', nativeName: 'Slovenščina', flagCode: 'si' },
  { name: 'Espanhol', nativeName: 'Español', flagCode: 'es' },
  { name: 'Esperanto', nativeName: 'Esperanto', flagCode: 'eo' },
  { name: 'Estoniano', nativeName: 'Eesti', flagCode: 'ee' },
  { name: 'Filipino', nativeName: 'Filipino', flagCode: 'ph' },
  { name: 'Finlandês', nativeName: 'Suomi', flagCode: 'fi' },
  { name: 'Francês', nativeName: 'Français', flagCode: 'fr' },
  { name: 'Grego', nativeName: 'Ελληνικά', flagCode: 'gr' },
  { name: 'Grego Koiné', nativeName: 'Κοινή Ελληνική', flagCode: 'gr' },
  { name: 'Hebraico', nativeName: 'עברית', flagCode: 'il' },
  { name: 'Hindi', nativeName: 'हिन्दी', flagCode: 'in' },
  { name: 'Holandês', nativeName: 'Nederlands', flagCode: 'nl' },
  { name: 'Húngaro', nativeName: 'Magyar', flagCode: 'hu' },
  { name: 'Indonésio', nativeName: 'Bahasa Indonesia', flagCode: 'id' },
  { name: 'Inglês', nativeName: 'English', flagCode: 'us' },
  { name: 'Irlandês', nativeName: 'Gaeilge', flagCode: 'ie' },
  { name: 'Islandês', nativeName: 'Íslenska', flagCode: 'is' },
  { name: 'Italiano', nativeName: 'Italiano', flagCode: 'it' },
  { name: 'Japonês', nativeName: '日本語', flagCode: 'jp' },
  { name: 'Latim', nativeName: 'Latina', flagCode: 'va' },
  { name: 'Letão', nativeName: 'Latviešu', flagCode: 'lv' },
  { name: 'Lituano', nativeName: 'Lietuvių', flagCode: 'lt' },
  { name: 'Malaio', nativeName: 'Bahasa Melayu', flagCode: 'my' },
  { name: 'Mandarim', nativeName: '中文', flagCode: 'cn' },
  { name: 'Norueguês', nativeName: 'Norsk', flagCode: 'no' },
  { name: 'Persa', nativeName: 'فارسی', flagCode: 'ir' },
  { name: 'Polonês', nativeName: 'Polski', flagCode: 'pl' },
  { name: 'Português', nativeName: 'Português', flagCode: 'pt' },
  { name: 'Romeno', nativeName: 'Română', flagCode: 'ro' },
  { name: 'Russo', nativeName: 'Русский', flagCode: 'ru' },
  { name: 'Sérvio', nativeName: 'Српски', flagCode: 'rs' },
  { name: 'Suaíli', nativeName: 'Kiswahili', flagCode: 'ke' },
  { name: 'Sueco', nativeName: 'Svenska', flagCode: 'se' },
  { name: 'Tailandês', nativeName: 'ไทย', flagCode: 'th' },
  { name: 'Tcheco', nativeName: 'Čeština', flagCode: 'cz' },
  { name: 'Turco', nativeName: 'Türkçe', flagCode: 'tr' },
  { name: 'Ucraniano', nativeName: 'Українська', flagCode: 'ua' },
  { name: 'Urdu', nativeName: 'اردو', flagCode: 'pk' },
  { name: 'Vietnamita', nativeName: 'Tiếng Việt', flagCode: 'vn' },
]

// Looks up the nativeName for an already-added Language record (which
// only has pt-BR `name`), matching on name since it's unique in the
// catalog. Falls back to the stored name if a language somehow isn't
// in the catalog, so a lookup miss never blanks out the row.
export function getNativeName(name) {
  return AVAILABLE_LANGUAGES.find((language) => language.name === name)?.nativeName ?? name
}
