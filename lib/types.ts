import type { AnswerKey } from "./questions";
import type { SegmentId } from "./segmentation";

export type Answers = Partial<Record<AnswerKey, string>>;

/** Data captured by the first form (name, email, company, role). */
export type Lead = {
  first_name: string;
  email: string;
  company: string;
  role: string;
};

export type IntentLevel = "LOW" | "MEDIUM" | "HIGH";

/** What the browser sends to /api/submit. */
export type SubmitBody = {
  lead: Lead;
  answers: Answers;
  submission_id: string;
  /** Honeypot. Real users leave it empty. */
  website?: string;
};

/** What /api/submit returns on success. */
export type SubmitSuccess = {
  ok: true;
  segment: SegmentId;
  intent_score: number;
  intent_level: IntentLevel;
  pdf_url: string | null;
};

/** What the server forwards to GoHighLevel. */
export type LeadPayload = {
  first_name: string;
  email: string;
  company: string;
  role: string;
  business_stage: string;
  biggest_challenge: string;
  improvement_priority: string;
  founder_statement: string;
  talent_interest: string;
  desired_outcome: string;
  explore_application: string;
  lead_source: string;
  project: string;
  // Extras for segmentation, scoring and the email automation
  registered_role: string;
  pareto_talent_segment: string;
  intent_score: number;
  intent_level: IntentLevel;
  tags: string[];
  guide_url: string;
  submission_id: string;
  submitted_at: string;
};
