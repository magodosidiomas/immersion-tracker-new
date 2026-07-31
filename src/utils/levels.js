// Level 1-15 milestones (cumulative hours), hardcoded to control the
// onboarding curve — dense at the start (1h→3h→5h) so early progress
// feels constant, spreading out as the habit consolidates. Index 0 is
// level 1. See imerso-data-model notes for the full table.
const LEVEL_MILESTONES_HOURS = [1, 3, 5, 10, 20, 35, 50, 75, 100, 150, 200, 300, 500, 750, 1000]

// How many levels the Metas screen lists explicitly — the hardcoded
// table above. Levels past this point exist (see nextMilestone) but
// aren't rendered as rows; the list would grow forever otherwise.
export const LISTED_LEVELS_COUNT = LEVEL_MILESTONES_HOURS.length

// Level 16+ has no fixed ceiling — hardcoding more rows would mean
// either a level cap (kills the mechanic for anyone who passes it) or
// an ever-growing table. Instead each milestone past 1000h is 1.3x the
// last, rounded to the nearest 50h, computed on the fly.
function nextMilestone(hours) {
  return Math.round((hours * 1.3) / 50) * 50
}

// Cumulative hours required to reach `level`. Level 0 is the
// pre-level-1 baseline (0h) — lets progress-bar math treat "not yet
// level 1" the same as any other bracket.
export function getMilestoneHours(level) {
  if (level <= 0) return 0
  if (level <= LEVEL_MILESTONES_HOURS.length) return LEVEL_MILESTONES_HOURS[level - 1]
  let hours = LEVEL_MILESTONES_HOURS[LEVEL_MILESTONES_HOURS.length - 1]
  for (let l = LEVEL_MILESTONES_HOURS.length + 1; l <= level; l++) {
    hours = nextMilestone(hours)
  }
  return hours
}

// 0-based bracket index — how many milestones have been fully passed.
// Kept separate from the *displayed* level (see getLevelProgress):
// this index also doubles as the lower bound's position in the
// milestone table, so shifting it to already start at 1 would throw
// off the lower/upper bracket lookup for the first bracket.
function getBracketIndex(totalHours) {
  let index = 0
  while (getMilestoneHours(index + 1) <= totalHours) index++
  return index
}

// Highest level whose milestone has been reached — kept exported since
// other code may want the raw bracket count, but MetasCard should use
// getLevelProgress().level (always >= 1) for display.
export function getCurrentLevel(totalHours) {
  return getBracketIndex(totalHours)
}

// Everything MetasCard needs, derived from accumulated immersion
// seconds: current level, and current/target/remaining/progress for
// the bracket between that level and the next — current/target are
// relative to the bracket (time earned since the last level, and the
// bracket's own size), not absolute milestone totals.
//
// Displayed level = bracketIndex + 1, so a brand-new account (0h)
// reads as "Nível 1", never "Nível 0" — the bracket bounds themselves
// (lower/upper milestone) are unaffected by this offset.
export function getLevelProgress(totalSeconds) {
  const totalHours = totalSeconds / 3600
  const bracketIndex = getBracketIndex(totalHours)
  const lowerSeconds = getMilestoneHours(bracketIndex) * 3600
  const upperSeconds = getMilestoneHours(bracketIndex + 1) * 3600
  const targetSeconds = upperSeconds - lowerSeconds
  const currentSeconds = Math.min(targetSeconds, Math.max(0, totalSeconds - lowerSeconds))
  const remainingSeconds = Math.max(0, targetSeconds - currentSeconds)
  const progress = targetSeconds > 0 ? (currentSeconds / targetSeconds) * 100 : 100

  return { level: bracketIndex + 1, currentSeconds, targetSeconds, remainingSeconds, progress }
}
