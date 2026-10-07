import { QUESTIONS } from "./questions";
import type { Answers, Lead } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ID_RE = /^[\w-]{8,64}$/;

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_RE.test(value);
}

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
}

export type ValidSubmission = {
  lead: Lead;
  answers: Answers;
  submissionId: string;
};

export type ValidationResult =
  | { ok: true; data: ValidSubmission }
  | { ok: false; error: string; fields: string[] };

/** Strict server-side validation. Choice answers must match the known options exactly. */
export function validateSubmission(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request.", fields: [] };
  }
  const input = body as Record<string, unknown>;
  const rawLead = (input.lead ?? {}) as Record<string, unknown>;
  const rawAnswers = (input.answers ?? {}) as Record<string, unknown>;
  const fields: string[] = [];

  const lead: Lead = {
    first_name: clean(rawLead.first_name, 100),
    email: clean(rawLead.email, 254).toLowerCase(),
    company: clean(rawLead.company, 200),
    role: clean(rawLead.role, 100),
  };
  if (!lead.first_name) fields.push("first_name");
  if (!isValidEmail(lead.email)) fields.push("email");

  const answers: Answers = {};
  for (const q of QUESTIONS) {
    const value = clean(rawAnswers[q.id], q.maxLength ?? 200);
    if (!value) {
      if (q.required) fields.push(q.id);
      continue;
    }
    if (q.kind === "choice" && !q.options?.includes(value)) {
      fields.push(q.id);
      continue;
    }
    answers[q.id] = value;
  }

  if (fields.length) {
    return { ok: false, error: "Some answers are missing or invalid.", fields };
  }

  const submissionId =
    typeof input.submission_id === "string" && ID_RE.test(input.submission_id)
      ? input.submission_id
      : crypto.randomUUID();

  return { ok: true, data: { lead, answers, submissionId } };
}
