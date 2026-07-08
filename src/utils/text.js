// Case- and accent-insensitive normalization, used for duplicate-name
// checks and search filtering (so "House of Cards" / "house of cards"
// / "Café" / "Cafe" are all treated as the same string).
export function normalizeForCompare(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
