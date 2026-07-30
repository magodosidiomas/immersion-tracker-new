// Level 1-15 milestones (cumulative hours), hardcoded to control the
// onboarding curve — dense at the start (1h→3h→5h) so early progress
// feels constant, spreading out as the habit consolidates. Index 0 is
// level 1. See imerso-data-model notes for the full table.
const LEVEL_MILESTONES_HOURS = [1, 3, 5, 10, 20, 35, 50, 75, 100, 150, 200, 300, 500, 750, 1000]

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

// Highest level whose milestone has been reached by totalHours.
export function getCurrentLevel(totalHours) {
  let level = 0
  while (getMilestoneHours(level + 1) <= totalHours) level++
  return level
}

// Everything MetasCard needs, derived from accumulated immersion
// seconds: current level, and current/target/remaining/progress for
// the bracket between that level and the next — current/target are
// relative to the bracket (time earned since the last level, and the
// bracket's own size), not absolute milestone totals.
export function getLevelProgress(totalSeconds) {
  const totalHours = totalSeconds / 3600
  const level = getCurrentLevel(totalHours)
  const lowerSeconds = getMilestoneHours(level) * 3600
  const upperSeconds = getMilestoneHours(level + 1) * 3600
  const targetSeconds = upperSeconds - lowerSeconds
  const currentSeconds = Math.min(targetSeconds, Math.max(0, totalSeconds - lowerSeconds))
  const remainingSeconds = Math.max(0, targetSeconds - currentSeconds)
  const progress = targetSeconds > 0 ? (currentSeconds / targetSeconds) * 100 : 100

  return { level, currentSeconds, targetSeconds, remainingSeconds, progress }
}
