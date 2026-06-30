// strengthCalculator.js
// Exports: computeScore(value), StrengthLevel

export const StrengthLevel = Object.freeze({
  GODLIKE:  'Godlike',
  STRONG:   'Strong',
  ANNOYED:  'Annoyed',
  SCARED:   'Scared',
  DEFEATED: 'Defeated',
});

/** Score-to-level threshold table */
const SCORE_TO_LEVEL = [
  StrengthLevel.GODLIKE,   // 0
  StrengthLevel.STRONG,    // 1
  StrengthLevel.ANNOYED,   // 2
  StrengthLevel.ANNOYED,   // 3
  StrengthLevel.SCARED,    // 4
  StrengthLevel.DEFEATED,  // 5
];

/**
 * Computes the password strength score and level.
 *
 * @param {string|null|undefined} value - The current password input value
 * @returns {{ score: number, level: string }}
 */
export function computeScore(value) {
  // Guard null/undefined → treat as empty string
  const str = (value == null) ? '' : String(value);

  // Short passwords always score zero
  if (str.length <= 1) {
    return { score: 0, level: StrengthLevel.GODLIKE };
  }

  let score = 0;

  // Award one point per criterion met
  if (/[A-Z]/.test(str)) score += 1;         // uppercase
  if (/[a-z]/.test(str)) score += 1;         // lowercase
  if (/[0-9]/.test(str)) score += 1;         // digit
  if (/[^A-Za-z0-9]/.test(str)) score += 1; // symbol

  // Bonus point for length ≥ 12
  if (str.length >= 12) score += 1;

  // Clamp to [0, 5]
  score = Math.min(Math.max(score, 0), 5);

  return { score, level: SCORE_TO_LEVEL[score] };
}
