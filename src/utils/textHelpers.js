/**
 * Normalises a user-typed title for display without mutating the stored value.
 *
 * Rules applied per word:
 *  – starts with lowercase but has uppercase later ("mEETING", "tEAM") → title-case
 *  – all-caps and longer than 3 chars ("MEETING", "STANDUP") → title-case
 *  – everything else (normal casing, acronyms like "HR", "IT") → keep as-is
 *
 * The first word is always capitalised.
 */
export function toDisplayTitle(str) {
  if (!str) return ''
  const words = str.trim().split(/\s+/)
  return words
    .map((word, i) => {
      if (!word) return word
      const weirdMixedCase =
        /^[a-z]/.test(word) && /[A-Z]/.test(word.slice(1))
      const allCapsLong =
        word === word.toUpperCase() && word.length > 3 && /[A-Z]/.test(word)
      if (weirdMixedCase || allCapsLong) {
        return word[0].toUpperCase() + word.slice(1).toLowerCase()
      }
      if (i === 0 && /^[a-z]/.test(word)) {
        return word[0].toUpperCase() + word.slice(1)
      }
      return word
    })
    .join(' ')
}
