import assert from "node:assert/strict";
import test from "node:test";
import { buildPayload } from "../payload";
import { CHALLENGE, EXPLORE, IMPROVE, INTEREST, QUESTIONS, ROLE, STAGE, STATEMENT } from "../questions";
import { computeIntent } from "../scoring";
import { computeSegment } from "../segmentation";
import type { Answers } from "../types";
import { validateSubmission } from "../validation";

const base: Answers = {
  role: ROLE.FOUNDER,
  business_stage: STAGE.EARLY,
  biggest_challenge: CHALLENGE.OTHER,
  improvement_priority: IMPROVE.DECISIONS,
  founder_statement: STATEMENT.LEVERAGE,
  talent_interest: INTEREST.VERY,
  explore_application: EXPLORE.NO,
};

test("segments: each trigger from the brief lands in the right segment", () => {
  const seg = (o: Answers) => computeSegment({ ...base, founder_statement: undefined, ...o });
  assert.equal(seg({ biggest_challenge: CHALLENGE.FOCUS }), "clarity_seeker");
  assert.equal(seg({ founder_statement: STATEMENT.MANY_STRENGTHS }), "clarity_seeker");
  assert.equal(seg({ biggest_challenge: CHALLENGE.TOO_MANY }), "overloaded_founder");
  assert.equal(seg({ founder_statement: STATEMENT.LOW_VALUE }), "overloaded_founder");
  assert.equal(seg({ biggest_challenge: CHALLENGE.TEAM }), "delegation_team_leader");
  assert.equal(seg({ founder_statement: STATEMENT.DELEGATE }), "delegation_team_leader");
  assert.equal(seg({ biggest_challenge: CHALLENGE.SLOWED }), "growth_scaling");
  assert.equal(seg({ business_stage: STAGE.SCALING }), "growth_scaling");
  assert.equal(seg({ business_stage: STAGE.GROWING }), "growth_scaling");
  assert.equal(seg({ founder_statement: STATEMENT.BUILD }), "leverage_seeker");
  assert.equal(seg({ improvement_priority: IMPROVE.FOCUS }), "leverage_seeker");
});

test("segments: the statement outweighs stage; ties follow the priority order; default is clarity", () => {
  assert.equal(
    computeSegment({ ...base, business_stage: STAGE.SCALING, founder_statement: STATEMENT.LOW_VALUE }),
    "overloaded_founder"
  );
  assert.equal(computeSegment({}), "clarity_seeker");
  assert.equal(
    computeSegment({ biggest_challenge: CHALLENGE.FOCUS, improvement_priority: IMPROVE.FOCUS }),
    "clarity_seeker" // 2 vs 2: clarity is listed before leverage
  );
});

test("intent score and level", () => {
  const i = (talent_interest: string, explore_application: string) => computeIntent({ talent_interest, explore_application });
  assert.deepEqual(i(INTEREST.CURIOUS, EXPLORE.NO), { score: 1, level: "LOW" });
  assert.deepEqual(i(INTEREST.SOMEWHAT, EXPLORE.NO), { score: 2, level: "LOW" });
  assert.deepEqual(i(INTEREST.VERY, EXPLORE.NO), { score: 3, level: "MEDIUM" });
  assert.deepEqual(i(INTEREST.SOMEWHAT, EXPLORE.YES), { score: 4, level: "MEDIUM" });
  assert.deepEqual(i(INTEREST.VERY, EXPLORE.YES), { score: 5, level: "HIGH" });
  assert.deepEqual(i(INTEREST.HELP, EXPLORE.YES), { score: 6, level: "HIGH" });
});

test("validation: accepts a complete submission and normalises it", () => {
  const r = validateSubmission({
    lead: { first_name: "  Ana ", email: "ANA@Example.com", company: "Acme", role: "CEO" },
    answers: { ...base, desired_outcome: "  Focus more  " },
    submission_id: "abc12345-def",
  });
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.data.lead.first_name, "Ana");
    assert.equal(r.data.lead.email, "ana@example.com");
    assert.equal(r.data.answers.desired_outcome, "Focus more");
    assert.equal(r.data.submissionId, "abc12345-def");
  }
});

test("validation: rejects missing, unknown and malformed values; desired_outcome is optional", () => {
  const lead = { first_name: "Ana", email: "ana@example.com", company: "", role: "" };
  const noOutcome = validateSubmission({ lead, answers: base });
  assert.ok(noOutcome.ok);

  const missing = validateSubmission({ lead, answers: { ...base, talent_interest: undefined } });
  assert.ok(!missing.ok && missing.fields.includes("talent_interest"));

  const fake = validateSubmission({ lead, answers: { ...base, business_stage: "Unicorn" } });
  assert.ok(!fake.ok && fake.fields.includes("business_stage"));

  const badEmail = validateSubmission({ lead: { ...lead, email: "nope" }, answers: base });
  assert.ok(!badEmail.ok && badEmail.fields.includes("email"));

  assert.ok(!validateSubmission(null).ok);
});

test("payload: has the agreed structure, constants, tags and role precedence", () => {
  const { payload } = buildPayload({
    lead: { first_name: "Ana", email: "ana@example.com", company: "Acme", role: "CEO" },
    answers: { ...base, explore_application: EXPLORE.YES, desired_outcome: "x" },
    submissionId: "id-123456",
    guideUrl: "https://example.com/guide.pdf",
  });
  for (const key of [
    "first_name", "email", "company", "role", "business_stage", "biggest_challenge", "improvement_priority",
    "founder_statement", "talent_interest", "desired_outcome", "explore_application", "lead_source", "project",
  ]) {
    assert.ok(key in payload, `missing ${key}`);
  }
  assert.equal(payload.lead_source, "Pareto Talent Lead Magnet");
  assert.equal(payload.project, "FP_MaraElenaVallejos_Pareto talent lead magnet");
  assert.equal(payload.role, ROLE.FOUNDER); // assessment answer wins
  assert.equal(payload.registered_role, "CEO"); // first-form role preserved
  assert.equal(payload.intent_score, 5);
  assert.equal(payload.intent_level, "HIGH");
  assert.ok(payload.tags.includes("explore-yes") && payload.tags.includes("intent-high"));
  assert.ok(payload.tags.includes("stage-early-stage"));
  assert.equal(payload.guide_url, "https://example.com/guide.pdf");
});

test("every question has options that the validator can match", () => {
  for (const q of QUESTIONS.filter((q) => q.kind === "choice")) {
    assert.ok(q.options && q.options.length >= 2, q.id);
    assert.equal(new Set(q.options).size, q.options.length, `${q.id} has duplicate options`);
  }
});
