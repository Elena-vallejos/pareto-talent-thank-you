import { CHALLENGE, IMPROVE, STAGE, STATEMENT, type AnswerKey } from "./questions";
import type { Answers } from "./types";

export type SegmentId =
  | "clarity_seeker"
  | "overloaded_founder"
  | "delegation_team_leader"
  | "growth_scaling"
  | "leverage_seeker";

export type Segment = {
  id: SegmentId;
  /** Value saved to the GHL field `pareto_talent_segment`. */
  value: string;
  /** Friendly name shown to the lead. */
  displayName: string;
  message: string;
};

export const SEGMENTS: Record<SegmentId, Segment> = {
  clarity_seeker: {
    id: "clarity_seeker",
    value: "CLARITY SEEKER",
    displayName: "Clarity Seeker",
    message:
      "Your answers suggest that your biggest opportunity may be creating greater clarity around where your energy creates the most value.",
  },
  overloaded_founder: {
    id: "overloaded_founder",
    value: "OVERLOADED FOUNDER",
    displayName: "Overloaded Founder",
    message:
      "Your answers suggest that your biggest opportunity may be reducing low-value responsibilities and focusing more heavily on your highest-value contribution.",
  },
  delegation_team_leader: {
    id: "delegation_team_leader",
    value: "DELEGATION / TEAM LEADER",
    displayName: "Delegation / Team Leader",
    message:
      "Your answers suggest that your next level of leverage may come from improving how your strengths are translated into your team's performance.",
  },
  growth_scaling: {
    id: "growth_scaling",
    value: "GROWTH / SCALING",
    displayName: "Growth / Scaling",
    message:
      "Your answers suggest that your biggest opportunity may be identifying which activities only you should own as the business grows.",
  },
  leverage_seeker: {
    id: "leverage_seeker",
    value: "LEVERAGE SEEKER",
    displayName: "Leverage Seeker",
    message:
      "Your answers suggest that you're ready to think more intentionally about where your unique strengths can create disproportionate value.",
  },
};

/** Order matters: it breaks ties (first listed wins). */
const SEGMENT_ORDER: SegmentId[] = [
  "overloaded_founder",
  "clarity_seeker",
  "delegation_team_leader",
  "leverage_seeker",
  "growth_scaling",
];

type Signal = { key: AnswerKey; values: readonly string[]; weight: number };

/**
 * Each matching answer adds its weight to a segment; the highest total wins.
 * Weights: the "Which statement describes you best?" answer is the strongest signal (3),
 * the biggest challenge is next (2), improvement priority and business stage are hints (1-2).
 *
 * Rules marked (spec) come straight from the brief. The rest fill the gaps for answers the
 * brief didn't assign to a segment, so every answer combination lands somewhere sensible.
 */
const RULES: Record<SegmentId, Signal[]> = {
  clarity_seeker: [
    { key: "biggest_challenge", values: [CHALLENGE.FOCUS], weight: 2 }, // (spec)
    { key: "founder_statement", values: [STATEMENT.MANY_STRENGTHS], weight: 3 }, // (spec)
    { key: "biggest_challenge", values: [CHALLENGE.ADVANTAGE], weight: 2 },
  ],
  overloaded_founder: [
    { key: "biggest_challenge", values: [CHALLENGE.TOO_MANY], weight: 2 }, // (spec)
    { key: "founder_statement", values: [STATEMENT.LOW_VALUE], weight: 3 }, // (spec)
    { key: "improvement_priority", values: [IMPROVE.PRODUCTIVITY], weight: 1 },
  ],
  delegation_team_leader: [
    { key: "biggest_challenge", values: [CHALLENGE.TEAM], weight: 2 }, // (spec)
    { key: "founder_statement", values: [STATEMENT.DELEGATE], weight: 3 }, // (spec)
    { key: "biggest_challenge", values: [CHALLENGE.SYSTEMS], weight: 2 },
    { key: "improvement_priority", values: [IMPROVE.TEAM, IMPROVE.LEADERSHIP, IMPROVE.SYSTEMS], weight: 1 },
  ],
  growth_scaling: [
    { key: "biggest_challenge", values: [CHALLENGE.SLOWED], weight: 2 }, // (spec)
    { key: "business_stage", values: [STAGE.GROWING, STAGE.SCALING], weight: 1 }, // (spec)
    { key: "improvement_priority", values: [IMPROVE.GROWTH], weight: 1 },
  ],
  leverage_seeker: [
    { key: "founder_statement", values: [STATEMENT.BUILD], weight: 3 }, // (spec)
    { key: "improvement_priority", values: [IMPROVE.FOCUS], weight: 2 }, // (spec: "focus on what they do best")
    { key: "founder_statement", values: [STATEMENT.LEVERAGE], weight: 3 },
  ],
};

export function computeSegment(answers: Answers): SegmentId {
  let best: SegmentId = "clarity_seeker"; // default when nothing matches
  let bestScore = 0;

  for (const id of SEGMENT_ORDER) {
    const score = RULES[id].reduce((sum, s) => {
      const answer = answers[s.key];
      return answer && s.values.includes(answer) ? sum + s.weight : sum;
    }, 0);
    if (score > bestScore) {
      best = id;
      bestScore = score;
    }
  }
  return best;
}
