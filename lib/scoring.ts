import { EXPLORE, INTEREST } from "./questions";
import type { Answers, IntentLevel } from "./types";

const INTEREST_POINTS: Record<string, number> = {
  [INTEREST.CURIOUS]: 1,
  [INTEREST.SOMEWHAT]: 2,
  [INTEREST.VERY]: 3,
  [INTEREST.HELP]: 4,
};

const EXPLORE_BONUS = 2;

export function levelFromScore(score: number): IntentLevel {
  if (score <= 2) return "LOW";
  if (score <= 4) return "MEDIUM";
  return "HIGH";
}

export function computeIntent(answers: Answers): { score: number; level: IntentLevel } {
  const base = INTEREST_POINTS[answers.talent_interest ?? ""] ?? 0;
  const bonus = answers.explore_application === EXPLORE.YES ? EXPLORE_BONUS : 0;
  const score = base + bonus;
  return { score, level: levelFromScore(score) };
}
