import { computeIntent } from "./scoring";
import { computeSegment, SEGMENTS } from "./segmentation";
import type { Answers, Lead, LeadPayload } from "./types";

export const LEAD_SOURCE = "Pareto Talent Lead Magnet";
export const PROJECT = "FP_MaraElenaVallejos_Pareto talent lead magnet";

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function buildPayload(args: {
  lead: Lead;
  answers: Answers;
  submissionId: string;
  guideUrl: string;
}): { payload: LeadPayload; segmentId: ReturnType<typeof computeSegment>; intent: ReturnType<typeof computeIntent> } {
  const { lead, answers, submissionId, guideUrl } = args;
  const segmentId = computeSegment(answers);
  const segment = SEGMENTS[segmentId];
  const intent = computeIntent(answers);

  const tags = [
    "pareto-talent-lead-magnet",
    `segment-${slug(segment.value)}`,
    `intent-${intent.level.toLowerCase()}`,
    `stage-${slug(answers.business_stage ?? "unknown")}`,
    `explore-${answers.explore_application?.startsWith("Yes") ? "yes" : "no"}`,
  ];

  const payload: LeadPayload = {
    first_name: lead.first_name,
    email: lead.email,
    company: lead.company,
    // The assessment's role answer wins; the first form's role is kept separately.
    role: answers.role ?? lead.role,
    business_stage: answers.business_stage ?? "",
    biggest_challenge: answers.biggest_challenge ?? "",
    improvement_priority: answers.improvement_priority ?? "",
    founder_statement: answers.founder_statement ?? "",
    talent_interest: answers.talent_interest ?? "",
    desired_outcome: answers.desired_outcome ?? "",
    explore_application: answers.explore_application ?? "",
    lead_source: LEAD_SOURCE,
    project: PROJECT,
    registered_role: lead.role,
    pareto_talent_segment: segment.value,
    intent_score: intent.score,
    intent_level: intent.level,
    tags,
    guide_url: guideUrl,
    submission_id: submissionId,
    submitted_at: new Date().toISOString(),
  };

  return { payload, segmentId, intent };
}
